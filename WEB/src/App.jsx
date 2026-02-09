import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  let server = import.meta.env.VITE_SERVER_URL || 'http://127.0.0.1:8000/api'

  let fetchData = async () => {
    try {
      let response = await axios.get(`${server}/history?device_id=ESP32_001&start=2026-02-05T00:00:00&end=2026-02-05T23:59:59`)
      console.log(response.data)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const [data, setData] = useState(null);
  useEffect(() => {
    fetchData();
  }, []);
  

  return (
    <>
      <div className="App">
        <h1 className="text-3xl font-bold underline">
          Smart Indoor Health and Comfort Monitor
        </h1>
        <p>Backend Server: {server}</p>
        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600">
          Fetch Data
        </button>
        <p>Data fetched successfully!</p>
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </div>
    </>
  )
}

export default App
