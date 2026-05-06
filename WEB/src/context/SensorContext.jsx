import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const SensorContext = createContext(null);

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
const DEVICE_CODE = import.meta.env.VITE_DEVICE_CODE || 'ESP-001';

export function SensorProvider({ children }) {
  const [connected, setConnected]         = useState(false);
  const [latestReading, setLatestReading] = useState(null);
  const [history, setHistory]             = useState([]);
  const [alerts, setAlerts]               = useState([]);
  const [insights, setInsights]           = useState([]);
  const [deviceInfo, setDeviceInfo]       = useState(null);
  const [comfortScore, setComfortScore]   = useState(null);
  const [lastSeen, setLastSeen]           = useState(null);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);
  const [openExposures, setOpenExposures] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // ── REST: device info ──────────────────────────────────────────
    axios.get(`${SERVER_URL}/devices/${DEVICE_CODE}`, { withCredentials: true })
      .then(res => setDeviceInfo(res.data))
      .catch(err => console.error('Failed to fetch device info:', err.message));

    // ── REST: initial stats (reading + comfort + exposures) ────────
    axios.get(`${SERVER_URL}/devices/${DEVICE_CODE}/stats`, { withCredentials: true })
      .then(res => {
        const d = res.data;
        if (d.latest_reading) {
          setLatestReading(d.latest_reading);
        }
        if (d.comfort_score != null) {
          setComfortScore(d.comfort_score);
        }
        if (d.connected != null) setConnected(d.connected);
        if (d.lastSeen)          setLastSeen(d.lastSeen);
        if (d.unread_alerts)     setUnreadAlertCount(d.unread_alerts);
        if (d.open_exposures)    setOpenExposures(d.open_exposures);
      })
      .catch(err => console.error('Failed to fetch device stats:', err.message));

    // ── Socket.IO ──────────────────────────────────────────────────
    const socket = io(SERVER_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket auth failed:', err.message);
      setConnected(false);
    });

    // live reading from ESP32 — comfortScore comes from backend
    socket.on('sensor-update', (data) => {
      if (data.deviceCode !== DEVICE_CODE) return;
      const { deviceCode, comfortScore: score, timestamp, ...reading } = data;
      setLatestReading(reading);
      setComfortScore(score);
      setConnected(true);
      setLastSeen(Date.now());
      setHistory(prev =>
        [...prev, { ...reading, recorded_at: timestamp ?? new Date().toISOString() }].slice(-500)
      );
    });

    // initial history + on-demand history
    socket.on('sensor-history', (data) => {
      const deviceHistory = data[DEVICE_CODE] ?? [];
      if (deviceHistory.length > 0) {
        setHistory(deviceHistory);
        const latest = deviceHistory[deviceHistory.length - 1];
        setLatestReading(latest);
        setLastSeen(new Date(latest.recorded_at).getTime());
      }
    });

    // device connection status — handles both initial and live formats
    socket.on('esp32-status', (data) => {
      if (data.deviceCode) {
        // live event — flat object
        if (data.deviceCode === DEVICE_CODE) {
          setConnected(data.connected);
          if (data.timestamp) setLastSeen(data.timestamp);
        }
      } else {
        // initial payload — keyed by device code
        const status = data[DEVICE_CODE];
        if (status) {
          setConnected(status.connected);
          if (status.lastSeen) setLastSeen(status.lastSeen);
        }
      }
    });

    // threshold + timeout + escalation alerts
    socket.on('alert', (data) => {
      // threshold and timeout are identified by deviceCode
      if (data.deviceCode && data.deviceCode !== DEVICE_CODE) return;

      // escalation uses deviceId — we can't filter by DEVICE_CODE here easily,
      // so we accept all escalations and let the UI show them
      setAlerts(prev => [
        { ...data, id: `live-${Date.now()}`, receivedAt: Date.now() },
        ...prev.slice(0, 49),
      ]);
    });

    // unread alert counts broadcast every 60s
    socket.on('alert-counts', (data) => {
      if (data[DEVICE_CODE] !== undefined) {
        setUnreadAlertCount(data[DEVICE_CODE]);
      }
    });

    // AI insights
    socket.on('ai-insight', (data) => {
      if (data.deviceCode !== DEVICE_CODE) return;

      if (data.summary) {
        // breach insight — full payload inline
        setInsights(prev => [
          {
            id: data.insightId,
            trigger_type: data.triggerType,
            breached_fields: data.breachedFields,
            summary: data.summary,
            recommendation: data.recommendation,
            severity: data.severity,
            sensor_snapshot: data.sensorSnapshot,
            acknowledged: false,
            created_at: new Date().toISOString(),
          },
          ...prev.slice(0, 49),
        ]);
      } else {
        // digest insight — fetch full content from REST
        axios.get(`${SERVER_URL}/devices/${DEVICE_CODE}/insights?limit=1`, { withCredentials: true })
          .then(res => {
            if (res.data.data?.length > 0) {
              setInsights(prev => [res.data.data[0], ...prev.slice(0, 49)]);
            }
          })
          .catch(err => console.error('Failed to fetch digest insight:', err.message));
      }
    });

    return () => socket.disconnect();
  }, []);

  return (
    <SensorContext.Provider value={{
      connected,
      latestReading,
      history,
      alerts,
      insights,
      deviceInfo,
      comfortScore,
      lastSeen,
      unreadAlertCount,
      openExposures,
      socket: socketRef.current,
      DEVICE_CODE,
      SERVER_URL,
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