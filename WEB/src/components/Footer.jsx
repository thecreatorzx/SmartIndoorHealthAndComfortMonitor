import { MdHome } from 'react-icons/md';
import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';

const Footer = () => (
  <div className="w-full bg-gray-800 rounded-2xl p-6 sm:p-8 text-gray-400 text-sm mb-10">
    {/* top grid */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-6 text-left">

      {/* brand */}
      <div className="col-span-2 sm:col-span-1 flex flex-col gap-3">
        <h1 className="flex items-center gap-2 text-white text-base sm:text-lg font-semibold">
          <i className="w-7 h-7 bg-linear-to-br from-purple-400 via-blue-500 to-violet-600 flex justify-center items-center rounded-md shrink-0">
            <MdHome size="18px" color="white" />
          </i>
          Comfort AI
        </h1>
        <p className="text-xs sm:text-sm leading-relaxed">
          Smart monitoring for healthier, more comfortable living spaces powered by AI.
        </p>
      </div>

      {/* quick links */}
      <div className="flex flex-col gap-2">
        <h2 className="text-white font-semibold text-sm sm:text-base mb-1">Quick Links</h2>
        {["Dashboard", "Historical Data", "Settings", "Reports"].map(link => (
          <a key={link} href="" className="text-xs sm:text-sm hover:text-white transition">{link}</a>
        ))}
      </div>

      {/* support */}
      <div className="flex flex-col gap-2">
        <h2 className="text-white font-semibold text-sm sm:text-base mb-1">Support</h2>
        {["Help Center", "Documentation", "Contact Us", "FAQs"].map(link => (
          <a key={link} href="" className="text-xs sm:text-sm hover:text-white transition">{link}</a>
        ))}
      </div>

      {/* social */}
      <div className="flex flex-col gap-2">
        <h2 className="text-white font-semibold text-sm sm:text-base mb-1">Stay Connected</h2>
        <div className="flex gap-2">
          <FaTwitter  className="bg-gray-600 hover:bg-gray-500 w-8 h-8 p-2 rounded-xl cursor-pointer transition" />
          <FaFacebook className="bg-gray-600 hover:bg-gray-500 w-8 h-8 p-2 rounded-xl cursor-pointer transition" />
          <FaInstagram className="bg-gray-600 hover:bg-gray-500 w-8 h-8 p-2 rounded-xl cursor-pointer transition" />
        </div>
        <p className="text-xs leading-relaxed">© 2026 ComfortAI Monitor. All rights reserved.</p>
      </div>
    </div>

    {/* bottom divider */}
    <div className="border-t border-white/10 pt-4 text-center text-xs text-gray-500">
      Built with ESP32 · Node.js · React · WebSockets
    </div>
  </div>
);

export default Footer;