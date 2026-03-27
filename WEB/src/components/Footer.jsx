import React from 'react'
import { MdHome } from 'react-icons/md'
import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa'
const Footer = () => {
  return (
    <div className='w-full bg-gray-800 rounded-2xl flex justify-between items-start p-8 text-left text-gray-400 text-sm mb-10'>
      <section className='w-[22vw]'>
        <h1 className='flex justify-start items-center text-white text-lg'>
          <i className='w-7 h-7 mr-2 bg-linear-to-br from-purple-400 via-blue-500 to-violet-600 flex justify-center items-center rounded-md'><MdHome size={"18px"} color='white'/></i>
          Comfort AI
        </h1>
        <p className='pt-5'>Smart monitoring for healthier, more comfortable living spaces powered by AI.</p>
      </section>
      <section className='w-[22vw] flex flex-col pl-4'>
          <h1 className='pb-2 text-lg text-white'>Quick Links</h1>
           <a href="">Dashboard</a>
           <a href="">Historical Data</a>
           <a href="">Settings</a>
           <a href="">Reports</a>
      </section>
      <section className='w-[22vw] flex flex-col'>
        <h1 className='pb-2 text-lg text-white'>Support</h1>
           <a href="">Help Center</a>
           <a href="">Documentation</a>
           <a href="">Contact Us</a>
           <a href="">FAQs</a>
      </section>
      <section className='w-[22vw] flex flex-col'>
        <h1 className='text-lg text-white pb-2'>Stay Connected</h1>
        <div className="connect flex flex-row space-between pb-2"><FaTwitter className='bg-gray-600 w-8 h-8 p-2 rounded-xl mr-2'/><FaFacebook className='bg-gray-600 w-8 h-8 p-2 rounded-xl mr-2'/><FaInstagram className='bg-gray-600 w-8 h-8 p-2 rounded-xl'/></div>
        <p>@2026 ComfortAI Monitor. All rights reserved.</p>
      </section>
    </div>
  )
}

export default Footer