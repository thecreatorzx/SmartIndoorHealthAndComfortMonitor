import React from 'react'
import { useState } from 'react';
import { FaSmile, FaClock, FaArrowUp, FaArrowDown} from "react-icons/fa";

const Hero = () => {


    const [comfortScore, setComfortScore] = useState(82);
    const [comfortStatus, setComfortStatus] = useState("Exellent - Your environment is optimal for comfort and productivity")
    const [updatedTime, setUpdatedTime] = useState('2 seconds');
    const [change , setChange] = useState(5);

  return (
    <div className='mb-8 rounded-2xl shadow-lg'>
        <section className="w-full h-[36vh] bg-linear-to-br from-indigo-600 via-violet-500 to-purple-800 px-10 rounded-2xl flex justify-between items-center text-white shadow-lg">
            <span className='flex justify-evenly items-start flex-col'>
                <p className='font-semibold'>AI Comfort Score</p>
                <h1 className='text-6xl font-bold pb-2'>{comfortScore}<span className='text-3xl'> /100</span></h1>
                <p className='pb-2'>{comfortStatus}</p>
                <p className='flex'> {change>0?(<span className="flex w-9 justify-between items-center "><FaArrowUp color='lightgreen'/> +{change}</span>):(<span className='flex w-9 justify-between items-center '><FaArrowDown color='#f22'/>{change}</span>)} <span className='flex w-55 pl-6 items-center justify-between'><FaClock /> Updated {updatedTime} ago.</span></p>
            </span>
            <span className="relative flex items-center justify-center w-48 h-48 py-1">
                <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 200 200"
                > 
                    <circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="12"
                    fill="none"
                    />
 
                    <circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke="white"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 80}
                    strokeDashoffset={(2 * Math.PI * 80) * (1 - comfortScore / 100)}
                    style={{ transition: "stroke-dashoffset 0.8s ease" }}
                    />
                </svg>
                <FaSmile className='absolute size-15'/>
            </span>
        </section>
    </div>
  )
}

export default Hero