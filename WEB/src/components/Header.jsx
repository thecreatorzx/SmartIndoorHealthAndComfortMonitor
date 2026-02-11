import React from 'react'
import { useState } from 'react';
import { GoDotFill } from "react-icons/go";
import { MdHome } from "react-icons/md";
import { FaBell } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";



const Header = () => {
    const [online, setOnline] = useState(true);

  return (
    <div>
        <header className="p-4 w-screen h-[10vh] bg-white flex justify-between items-center">
            <span className="text-sm font-bold flex items-center">
                <i className='w-6 h-6 bg-linear-to-br from-purple-400 via-blue-500 to-violet-600 flex justify-center items-center rounded-md'><MdHome size={"16px"} color='white'/></i>
                <span className="ml-2.5">
                    <div className="">ComfortAI Monitor</div>
                    <div className="text-[0.65rem] font-normal flex"><GoDotFill className='mt-0.5 text-green-600 mr-1'/> Real-time monitoring</div>
                </span>
            </span>
            <span className='flex items-center space-x-4 '>
                <span className={`flex p-1 px-2.5 text-xs rounded-sm cursor-default ${online==true? "bg-green-100 text-green-600 hover:bg-green-200": "bg-red-100 hover:bg-red-200 text-red-600"}`}><GoDotFill className='mt-0.5 mr-1'/> Device {online?"Online":"Offline"} </span>
            <span className='w-8 h-8 hover:bg-gray-200 cursor-pointer rounded-3xl flex justify-center items-center'><FaBell /></span>
            <span className='w-8 h-8 hover:bg-gray-200 cursor-pointer rounded-3xl flex justify-center items-center'><IoMdSettings /></span>
            <span className='w-8 h-8 bg-linear-to-br from-violet-400 via-pink-400 to-red-500 flex justify-center items-center rounded-3xl text-sm font-medium text-white'>JD</span>
            </span>
        </header>
    </div>
  )
}

export default Header