import React from 'react'
import Hero from './Hero.jsx';

const Main = ({ data }) => {
  return (
    <div className="w-full h-full bg-gray-200 p-4">
        <Hero />
        {data && (
            <div className="bg-white p-4 rounded shadow">
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
        )}
    </div>
  )
}

export default Main