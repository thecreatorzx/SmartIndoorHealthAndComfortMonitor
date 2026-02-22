import React from 'react'
import { FaTemperatureHigh, FaWind } from 'react-icons/fa';
import { MdWaterDrop } from 'react-icons/md';
import { PiSpeakerSimpleHighBold } from 'react-icons/pi';

const Summary = () => {
  const card = [
      {
        icon: FaTemperatureHigh,
        name: "Avg Temperature",
        value: "22.3\u00B0C",
        range: "21.8-23.1\u00B0C",
        bg: "bg-orange-100",
        color: 'text-orange-500'

  
      },
      {
        icon: MdWaterDrop,
        name: "Avg Humidity",
        value: "49%",
        range: "45-52%",
        bg: "bg-blue-100",
        color: 'text-blue-500'
      },
      {
        icon: FaWind,
        name: "Avg CO₂",
        value: "695ppm",
        range: "620-780ppm",
        bg: "bg-green-100",
        color: 'text-green-500'
      },
      {
        icon: PiSpeakerSimpleHighBold,
        name: "Avg Noise",
        punch: "Set noise threshold",
        value: "38dB",
        range: "32-45dB",
        bg: "bg-purple-100",
        color: 'text-purple-500'
      }, 
    ];

  return (
    <div className='w-full h-fit bg-white p-6 flex flex-col rounded-2xl shadow-lg mb-10'>
      <h1 className='text-2xl font-bold text-left mb-6'>Today's Summary</h1>
      <div className="cards flex justify-around items-center">
       { card.map((e,index)=>(
        <div key = {index} className="flex justify-center items-center flex-col">
          <e.icon className={`w-12 h-12 p-3 rounded-xl mb-2 ${e.bg} ${e.color}`}/>
          <div className="text-2xl font-semibold pb-1">{e.value}</div>
          <div className="text-sm text-gray-700 pb-1">{e.name}</div>
          <div className="text-sm text-gray-500">{e.range}</div>
        </div>
       ))}
      </div>
    </div>
  )
}

export default Summary