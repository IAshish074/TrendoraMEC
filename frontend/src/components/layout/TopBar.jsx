import React from "react";
import {TbBrandMeta} from 'react-icons/tb'
import {IoLogoInstagram} from 'react-icons/io'
import {RiTwitterXLine} from 'react-icons/ri'
function TopBar() {
  return (
    <div className="bg-[#ea2e0e] text-white">
      <div className="container mx-auto flex justify-between items-center py-3 px-4">
        <div className="hidden md:flex items-center space-x-4">
          <a href="#" className="hover:text-gray-300">
            <TbBrandMeta className="h-5 w-5" />
          </a>
          <a href="#" className="hover:text-gray-300">
            <IoLogoInstagram className="h-5 w-5" />
          </a>
          <a href="#" className="hover:text-gray-300">
            <RiTwitterXLine className="h-4 w-4" />
          </a>
        </div>
        <div className="textl-sm text-center flex-grow">
            <span>we ship worldwide -Fast and relible shipping!</span>
        </div>
        <div className="text-sm">
            <a href="tel:+919508709274" className="hover:text-gray-300 hidden md:block">+91 9508709274</a>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
