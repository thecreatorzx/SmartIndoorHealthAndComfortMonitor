import React from 'react'
import Hero from './Hero.jsx';
import Footer from './Footer.jsx';
import Readings from './Readings.jsx';
import Trends from './Trends.jsx';
import Insights from './Insights.jsx';
import Settings from './Settings.jsx';
import Summary from './Summary.jsx';
import DeviceInfo from './DeviceInfo.jsx';
import Recent from './Recent.jsx';

const Main = ({ data }) => {
  return (
    <div className="w-full h-full bg-gray-100 px-6 lg:px-10">
        <Hero />
        <Readings />
        <Trends />
        <Insights />
        <Settings />
        <Summary />
        <DeviceInfo/>
        <Recent />
        <Footer />
    </div>
  )
}
export default Main