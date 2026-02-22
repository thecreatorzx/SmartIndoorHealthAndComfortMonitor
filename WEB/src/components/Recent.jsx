import React from 'react'
import { BsCpuFill } from "react-icons/bs";
import { FaBatteryThreeQuarters, FaWifi } from "react-icons/fa";


const Recent = () => {
  const card = [
      {
        icon: BsCpuFill,
        name: "Device Status",
        status: "Online & Active",
        L1name: "Last Update: ",
        L1value: "2 seconds ago",
        L2name: "Uptime: ",
        L2value: "15 days 4 hours",
        L3name: "Signal Strength: ",
        L3value: "Excellent(95%)",
        bg: "bg-green-100",
        color: 'text-green-500'

      },
      {
        icon: FaWifi,
        name: "Connection",
        status: "Wifi Connected",
        L1name: "Network: ",
        L1value: "Home_Wifi_5G",
        L2name: "IP Address: ",
        L2value: "192.168.1.105",
        L3name: "Firmware: ",
        L3value: "v2.4.1",
        bg: "bg-blue-100",
        color: 'text-blue-500'
      },
      {
        icon: FaBatteryThreeQuarters,
        name: "Power Status",
        status: "AC Powered",
        L1name: "Backup Battery: ",
        L1value: "78%",
        L2name: "Power Mode: ",
        L2value: "Performance",
        L3name: "Est. Battery Life: ",
        L3value: "12 hours",
        bg: "bg-purple-100",
        color: 'text-purple-500'
      }
    ];

  return (
    <div className='w-full h-fit bg-white p-6 flex flex-col rounded-2xl shadow-lg mb-10'>
      <h1 className='text-2xl font-bold text-left mb-6 flex justify-between'>Recent Alerts & Notifications <button className='text-sm text-blue-400 font-normal'>View all</button></h1>
      <div className="cards flex justify-around items-center flex-col">
       { card.map((e,index)=>(
        <div key = {index} className="flex justify-center items-start flex-col text-left">
          <div className="flex justify-center items-center"><e.icon className={`w-12 h-12 p-3 rounded-xl mb-2 ${e.bg} ${e.color}`}/><div className="flex flex-col ml-4"><i className='font-semibold'>{e.name}</i><i className={`text-sm ${e.color} font-semibold`}>{e.status}</i></div></div>
          <div className="flex w-[28vw] m-auto flex-col mt-2">
            <div className="text-sm text-gray-500 pb-1 flex justify-between">{e.L1name} <i className='text-gray-700 font-semibold'>{e.L1value}</i></div>
            <div className="text-sm text-gray-500 pb-1 flex justify-between">{e.L2name} <i className='text-gray-700 font-semibold'>{e.L2value}</i></div>
            <div className="text-sm text-gray-500 flex justify-between">{e.L3name} <i className='text-gray-700 font-semibold'>{e.L3value}</i></div>
          </div>
        </div>
       ))}
      </div>
    </div>
  )
}

export default Recent