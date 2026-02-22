import React, { useState } from 'react'
import { FaTemperatureHigh, FaWind } from 'react-icons/fa'
import { MdWaterDrop } from 'react-icons/md'
import { PiSpeakerSimpleHighBold } from 'react-icons/pi'

const Settings = () => {
  const [check, setCheck] = useState(31);
  const [btns, setBtns] = useState([false, false, false, false]);
  const props = [
    {
      icon: FaTemperatureHigh,
      name: "Temperature",
      punch: "Set comfortable range",
      bg: "bg-orange-100",
      color: "text-orange-500",
      repr: "(\u00B0C)",
      min: "Minimum"

    },
    {
      icon: MdWaterDrop,
      name: "Humidity",
      punch: "Set comfortable range",
      bg: "bg-blue-100",
      color: "text-blue-500",
      repr: "(%)",
      min: "Minimum"
    },
    {
      icon: FaWind,
      name: "CO₂ Level",
      punch: "Set air quality threshold",
      bg: "bg-green-100",
      color: "text-green-500",
      repr: "(ppm)",
      min: "Warning Level"
    },
    {
      icon: PiSpeakerSimpleHighBold,
      name: "Noise Level",
      punch: "Set noise threshold",
      bg: "bg-purple-100",
      color: "text-purple-500",
      repr: "(dB)",
      min: "Warning Level"
    }, 
  ];
  const toggleFunc = (e, index) => {
    const arr= [...btns];
    arr[index] = !arr[index];
    setBtns(arr);
  }

  return (
    <div className='bg-white w-full h-fit rounded-2xl p-6 mb-10 shadow-lg'>
      <div className='text-2xl font-bold flex justify-between p-4'>Threshold Settings <button className='text-sm  bg-indigo-500 hover:bg-indigo-400 focus:bg-indigo-400 rounded-lg text-white p-2 cursor-not-allowed'>Save Changes</button></div>
      <div className="sections flex flex-wrap justify-evenly items-center">
        {props.map((e,index)=>
          <div key={index} className="w-[45vw] p-5">
            <div className="top flex justify-between">
              <span className="left flex justify-center items-center text-left">
                {<e.icon className={`${e.color} ${e.bg} w-12 h-12 rounded-xl p-3`}/>}
                <span className="flex flex-col pl-4">{e.name} <i className='text-sm text-gray-600'>{e.punch}</i></span>
              </span>
              <span className={`toggle flex items-center pl-1 w-11 h-6.5 rounded-4xl  ${!btns[index]?"bg-red-400":"bg-indigo-500"}`} onClick={(e)=> toggleFunc(e, index)}><div className={`relative ball w-5 h-5 rounded-full bg-white transition-all ${btns[index]?"translate-x-4": "translate-x-0"}`}></div></span>
            </div>
            <div className="bottom flex flex-col mt-8 text-left text-gray-500 text-sm">
              <label htmlFor="max">Maximum{e.repr}</label>
              <input type="number" id='max' className='text-black text-lg outline outline-gray-300 rounded-md px-4 py-1 mb-4 mt-1' onChange={(e)=>setCheck(e.target.value)} value={check}/>
              <label htmlFor="min">{e.min}{e.repr}</label>
              <input type="number" id='min' className='text-black outline outline-gray-300 rounded-md text-lg px-4 py-1 mt-1' value={check} onChange={(e) => setCheck(e.target.value)}/>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings