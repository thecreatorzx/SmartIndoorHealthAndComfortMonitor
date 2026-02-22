import React from 'react'
import { useState } from 'react';
import { GoDotFill } from "react-icons/go";
import { MdHome } from "react-icons/md";
import { FaBell } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";



const Header = () => {
    const [online, setOnline] = useState(false);

  return (
    <div className='sticky top-0 z-3'>
        <header className="px-14 w-screen h-[12vh] bg-white flex justify-between items-center mb-10 shadow-lg">
            <span className="text-sm font-bold flex justify-evenly items-center">
                <i className='w-7 h-7 bg-linear-to-br from-purple-400 via-blue-500 to-violet-600 flex justify-center items-center rounded-md'><MdHome size={"18px"} color='white'/></i>
                <span className="ml-2.5">
                    <div className="text-xl">ComfortAI Monitor</div>
                    <div className="text-[0.65rem] font-normal flex"><GoDotFill className={`mt-0.5 ${online?"text-green-600":"text-red-500"} mr-1`}/> Real-time monitoring</div>
                </span>
            </span>
            <span className='flex justify-evenly items-center space-x-4'>
                <span className={`flex p-1 px-2.5 text-xs font-bold rounded-sm cursor-default ${online==true? "bg-green-100 text-green-600 hover:bg-green-200": "bg-red-100 hover:bg-red-200 text-red-600"}`}><GoDotFill className='mt-0.5 mr-1'/> Device {online?"Online":"Offline"} </span>
                <span className='w-8 h-8 hover:bg-gray-200 cursor-pointer rounded-3xl flex justify-center items-center'><FaBell size={"18px"}/></span>
                <span className='w-8 h-8 hover:bg-gray-200 cursor-pointer rounded-3xl flex justify-center items-center'><IoMdSettings size={"20px"} /></span>
                <span className='w-8 h-8 bg-linear-to-br from-violet-400 via-pink-400 to-red-500 flex justify-center items-center rounded-3xl text-sm font-medium text-white'>JD</span>
            </span>
        </header>
    </div>
  )
}

export default Header