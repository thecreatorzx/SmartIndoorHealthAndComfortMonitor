import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const SensorContext = createContext(null);

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
const DEVICE_CODE = import.meta.env.VITE_DEVICE_CODE || 'ESP-001';

// compute a 0-100 comfort score from a reading
function computeComfortScore(reading) {
  if (!reading) return null;

  const penalties = [];

  // temperature: ideal 21-24
  const t = reading.temperature;
  if (t < 18 || t > 30) penalties.push(30);
  else if (t < 21 || t > 24) penalties.push(10);

  // humidity: ideal 40-60
  const h = reading.humidity;
  if (h < 20 || h > 85) penalties.push(25);
  else if (h < 30 || h > 70) penalties.push(10);

  // co2: ideal < 800
  const c = reading.co2;
  if (c > 2500) penalties.push(30);
  else if (c > 1000) penalties.push(15);

  // noise: ideal < 60
  const n = reading.noise;
  if (n > 90) penalties.push(25);
  else if (n > 75) penalties.push(10);

  const total = penalties.reduce((a, b) => a + b, 0);
  return Math.max(0, 100 - total);
}

export function SensorProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [latestReading, setLatestReading] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [comfortScore, setComfortScore] = useState(null);
  const [lastSeen, setLastSeen] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // fetch device info from REST
    axios.get(`${SERVER_URL}/devices/${DEVICE_CODE}`)
      .then(res => setDeviceInfo(res.data))
      .catch(err => console.error('Failed to fetch device info:', err.message));

    // connect socket
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('get-history', { quantity: 30 });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // live reading from ESP32
    socket.on('sensor-update', (data) => {
      if (data.deviceCode !== DEVICE_CODE) return;
      const { deviceCode, ...reading } = data;
      setLatestReading(reading);
      setComfortScore(computeComfortScore(reading));
      setLastSeen(Date.now());

      // append to history, keep last 100
      setHistory(prev => {
        const updated = [...prev, { ...reading, recorded_at: new Date().toISOString() }];
        return updated.slice(-100);
      });
    });

    // initial + on-demand history
    socket.on('sensor-history', (data) => {
      const deviceHistory = data[DEVICE_CODE] ?? [];
      setHistory(deviceHistory);
      if (deviceHistory.length > 0) {
        const latest = deviceHistory[deviceHistory.length - 1];
        setLatestReading(latest);
        setComfortScore(computeComfortScore(latest));
        setLastSeen(new Date(latest.recorded_at).getTime());
      }
    });

    // device connection status
    socket.on('esp32-status', (data) => {
      // data can be { deviceCode, connected } (single) or { [code]: { connected } } (bulk)
      if (data.deviceCode) {
        if (data.deviceCode === DEVICE_CODE) setConnected(data.connected);
      } else {
        const status = data[DEVICE_CODE];
        if (status) setConnected(status.connected);
      }
    });

    // threshold + timeout alerts
    socket.on('alert', (data) => {
      if (data.deviceCode !== DEVICE_CODE) return;
      setAlerts(prev => [
        { ...data, id: Date.now(), receivedAt: Date.now() },
        ...prev.slice(0, 49), // keep last 50
      ]);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <SensorContext.Provider value={{
      connected,
      latestReading,
      history,
      alerts,
      deviceInfo,
      comfortScore,
      lastSeen,
      socket: socketRef.current,
    }}>
      {children}
    </SensorContext.Provider>
  );
}

export function useSensor() {
  const ctx = useContext(SensorContext);
  if (!ctx) throw new Error('useSensor must be used within SensorProvider');
  return ctx;
}