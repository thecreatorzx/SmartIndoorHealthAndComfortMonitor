import React from 'react'
import { FaSmile } from "react-icons/fa";

const Hero = () => {
  return (
    <div>
        <section className="w-full h-[30vh] bg-linear-to-br from-indigo-600 via-violet-500 to-purple-800 rounded-2xl mb-4 flex justify-between items-center text-white">
            <span className=''>
                <p>AI Comfort Score</p>
                <h1 className='text-5xl font-bold'>85<span className='text-2xl'>/100</span></h1>
                <p>environment status</p>
                <p>other status</p>
            </span>
            <span className='bg-black'>
                <svg class ="w-2 bg-white">
                    <FaSmile size={"64px"} color='white'/>
                </svg>
            </span>
        </section>
    </div>
  )
}

export default Hero