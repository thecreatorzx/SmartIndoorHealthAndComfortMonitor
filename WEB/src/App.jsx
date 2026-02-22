import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import Header from './components/Header.jsx'
import Main from './components/Main.jsx'

function App() {
  let server = import.meta.env.VITE_SERVER_URL || 'http://127.0.0.1:8000/api'

  // let fetchData = async () => {
  //   try {
  //     let response = await axios.get(`${server}/history?device_id=ESP32_001&start=2026-02-05T00:00:00&end=2026-02-05T23:59:59`)
  //     console.log(response.data)
  //     setData(response.data)
  //   } catch (error) {
  //     console.error('Error fetching data:', error)
  //   }
  // }

  const [data, setData] = useState(null);
  // useEffect(() => {
  //   fetchData();
  // }, []);
  

  return (
    <>
      <div className="App w-screen bg-gray-100 flex flex-col items-center text-gray-700">
        <Header />
        <Main data={data} />
      </div>
    </>
  )
}

export default App
