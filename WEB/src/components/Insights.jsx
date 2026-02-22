import React from 'react'
import { FaArrowRight, FaLightbulb, FaMoon } from 'react-icons/fa';
import { GoGraph } from "react-icons/go";

const Insights = () => {

  const insight_arr = [
    {
      icon: FaLightbulb,
      heading: "Ventilation Recommendation",
      details: "CO₂ levels are rising. Consider opening windows for 10 minutes to improve air quality.",
      iconColor: "bg-blue-500",
      color: "text-blue-500",
      bg:"bg-blue-100"

    },
    {
      icon: GoGraph,
      heading: "Optimal Conditions",
      details: "Your room has maintained optimal conditions for 5 hours. Great for productivity!",
      iconColor: "bg-green-500",
      color: "text-green-500",
      bg:"bg-green-100"

    },
    {
      icon: FaMoon,
      heading: "Sleep Quality Tip",
      details: "Lower temperature to 19-21\u00B0C before bedtime for better sleep quality tonight.",
      iconColor: "bg-purple-500",
      color: "text-purple-500",
      bg:"bg-purple-100"

    },
  ];



  return (
    <div className='mb-10'>
      <h1 className='w-fit text-2xl pb-6 font-bold'>AI-Powered Insights</h1>
      <div className="insights w-full flex flex-row justify-between">
        {insight_arr.map((e, index) => (
          <div key={index} className={`flex w-[30vw] h-50 rounded-2xl shadow-lg pt-8 pr-5 ${e.bg}`}>
            <span className="left w-60 flex justify-center">{<e.icon className={`w-auto h-10 p-3 rounded-xl text-2xl text-white ${e.iconColor}`}/>}</span>
            <span className="right text-left">
              <div className="head text-left font-semibold">{e.heading}</div>
              <div className="head w-auto text-left text-sm text-gray-500">{e.details}</div>
              <button className= {`flex pt-2 items-center ${e.color} text-sm font-semibold`}>View details <FaArrowRight className='ml-2'/></button>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Insights