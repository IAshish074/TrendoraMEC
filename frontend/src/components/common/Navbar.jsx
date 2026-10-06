import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiBars3BottomRight,
} from "react-icons/hi2";
import Searchbar from "./Searchbar";
import CartDrawer from "../layout/CartDrawer";
import { IoMdClose } from "react-icons/io";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";

function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);

  const { user, isAdmin } = useAuth();
  const { itemCount } = useCart();

  const toggleNavDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <nav className="container mx-auto flex items-center justify-between py-4 px-6 relative">
        {/* left - logo */}
        <div>
          <Link to="/" className="text-2xl font-bold tracking-tight">
            Trendora
          </Link>
        </div>

        {/* center - navigation links */}
        <div className="hidden md:flex space-x-6">
          <Link
            to="/collections/all"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase tracking-wider"
          >
            Men
          </Link>
          <Link
            to="/collections/all?gender=Women"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase tracking-wider"
          >
            Women
          </Link>
          <Link
            to="/collections/all?category=Top+Wear"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase tracking-wider"
          >
            Top Wear
          </Link>
          <Link
            to="/collections/all?category=Bottom+Wear"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase tracking-wider"
          >
            Bottom Wear
          </Link>
        </div>

        {/* right - icons */}
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <Link
              to="/admin"
              className="bg-black px-3 py-1.5 rounded text-xs font-semibold text-white hover:bg-gray-800 transition"
            >
              Admin Dashboard
            </Link>
          )}

          {user ? (
            <Link to="/profile" className="flex items-center space-x-1.5 hover:text-black">
              <HiOutlineUser className="h-6 w-6 text-gray-700" />
              <span className="text-sm font-medium hidden sm:inline">
                {user.name ? user.name.split(" ")[0] : "Account"}
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md text-gray-800 transition"
            >
              Sign In
            </Link>
          )}

          {/* cart drawer toggle button */}
          <button
            onClick={toggleDrawer}
            className="relative hover:text-black focus:outline-none"
            aria-label="Shopping Cart"
          >
            <HiOutlineShoppingBag className="h-6 w-6 text-gray-700" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#ea2e0e] text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          <Searchbar />

          <button
            onClick={toggleNavDrawer}
            className="md:hidden text-gray-700 hover:text-black focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <HiBars3BottomRight className="h-6 w-6" />
          </button>
        </div>
      </nav>

      <CartDrawer drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />

      {/* Mobile Navigation */}
      <div
        className={`fixed top-0 left-0 w-3/4 sm:w-1/2 h-full bg-white shadow-xl transform transition-transform duration-300 z-50 ${
          navDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <span className="text-lg font-bold">Menu</span>
          <button onClick={toggleNavDrawer} aria-label="Close menu">
            <IoMdClose className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div className="p-4">
          <nav className="space-y-4">
            {isAdmin && (
              <Link
                to="/admin"
                onClick={toggleNavDrawer}
                className="block bg-black px-3 py-2 rounded text-center text-xs font-semibold text-white hover:bg-gray-800 transition mb-3"
              >
                Admin Dashboard
              </Link>
            )}
            <Link
              to="/collections/all"
              onClick={toggleNavDrawer}
              className="block text-gray-700 hover:text-black font-medium"
            >
              Men
            </Link>
            <Link
              to="/collections/all?gender=Women"
              onClick={toggleNavDrawer}
              className="block text-gray-700 hover:text-black font-medium"
            >
              Women
            </Link>
            <Link
              to="/collections/all?category=Top+Wear"
              onClick={toggleNavDrawer}
              className="block text-gray-700 hover:text-black font-medium"
            >
              Top Wear
            </Link>
            <Link
              to="/collections/all?category=Bottom+Wear"
              onClick={toggleNavDrawer}
              className="block text-gray-700 hover:text-black font-medium"
            >
              Bottom Wear
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}

export default Navbar;
