import React, { useState } from 'react'
import { FaCheckCircle, FaSoundcloud, FaSpeakap, FaSpeakerDeck, FaTemperatureHigh, FaWind } from 'react-icons/fa'
import { MdWaterDrop } from "react-icons/md";
import { PiSpeakerSimpleHighFill } from "react-icons/pi";

const Readings = () => {


  return (
    <div className='mb-10 flex flex-col justify-start items-start'>
      <p className='text-2xl font-bold pb-5'>Current Readings</p>
      <div className="w-full cards flex flex-wrap gap-10 justify-evenly items-center">
        <span className="card w-70 h-60 bg-white rounded-2xl shadow-lg">
          <div className="top flex justify-between items-center px-6 pt-8">
            <FaTemperatureHigh className=' w-12 h-12 p-2.5 rounded-lg text-orange-500 bg-orange-100'/>
            <span className="status h-6 p-2 flex rounded-lg justify-center items-center text-orange-500 text-sm bg-orange-100 font-semibold">OPTIMAL</span>
          </div>
          <div className="temp flex px-6 pt-6 text-4xl font-bold ">22.5<i className='text-gray-400 text-3xl pl-1 pt-2'>&deg;C</i></div>
          <p className='w-35 flex px-6 pt-3 font-semibold'>Temperature</p>
          <p className=' flex justify-between pt-3 px-6 text-gray-500 text-sm'>Target: 21-24&deg;C <i>{<FaCheckCircle className='text-green-500'/>}</i></p>
        </span>
        
        <span className="card w-70 h-60 bg-white rounded-2xl shadow-lg">
          <div className="top flex justify-between items-center px-6 pt-8">
            <MdWaterDrop className=' w-12 h-12 p-2.5 rounded-lg text-blue-500 bg-blue-100'/>
            <span className="status h-6 p-2 flex rounded-lg justify-center items-center text-blue-500 text-sm bg-blue-100 font-semibold">OPTIMAL</span>
          </div>
          <div className="temp flex px-6 pt-6 text-4xl font-bold ">48<i className='text-gray-400 text-3xl pl-1 pt-2'>%</i></div>
          <p className='w-35 flex px-6 pt-3 font-semibold'>Humidity</p>
          <p className=' flex justify-between pt-3 px-6 text-gray-500 text-sm'>Target: 40-60%<i>{<FaCheckCircle className='text-green-500'/>}</i></p>
        </span>
        
        <span className="card w-70 h-60 bg-white rounded-2xl shadow-lg">
          <div className="top flex justify-between items-center px-6 pt-8">
            <FaWind className=' w-12 h-12 p-2.5 rounded-lg text-green-500 bg-green-100'/>
            <span className="status h-6 p-2 flex rounded-lg justify-center items-center text-green-500 text-sm bg-green-100 font-semibold">OPTIMAL</span>
          </div>
          <div className="temp flex px-6 pt-6 text-4xl font-bold ">680<i className='text-gray-400 text-2xl pl-1 pt-2'> ppm</i></div> 
          <p className='flex justify-center w-30 px-6 pt-3 font-semibold'>CO₂ Level</p>
          <p className=' flex justify-between pt-3 px-6 text-gray-500 text-sm'>Target: &lt; 1000ppm <i>{<FaCheckCircle className='text-green-500'/>}</i></p>
        </span>
        
        <span className="card w-70 h-60 bg-white rounded-2xl shadow-lg">
          <div className="top flex justify-between items-center px-6 pt-8">
            <PiSpeakerSimpleHighFill className=' w-12 h-12 p-2.5 rounded-lg text-purple-500 bg-purple-100'/>
            <span className="status h-6 p-2 flex rounded-lg justify-center items-center text-purple-500 text-sm bg-purple-100 font-semibold">OPTIMAL</span>
          </div>
          <div className="temp flex px-6 pt-6 text-4xl font-bold ">42<i className='text-gray-400 text-2xl pl-1 pt-2'>dB</i></div>
          <p className='w-35 flex px-6 pt-3 font-semibold'>Noise Level</p>
          <p className=' flex justify-between pt-3 px-6 text-gray-500 text-sm'>Target: &lt;40dB<i>{<FaCheckCircle className='text-green-500'/>}</i></p>
        </span>
      </div>
    </div>
  )
}

export default Readings