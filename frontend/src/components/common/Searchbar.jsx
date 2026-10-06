import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiMagnifyingGlass, HiMiniXMark } from "react-icons/hi2";

const Searchbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/collections/all?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <div
      className={`flex items-center justify-center transition-all duration-300 ${
        isOpen ? "absolute top-0 left-0 w-full bg-white h-20 z-50 px-4 shadow-sm" : "w-auto"
      }`}
    >
      {isOpen ? (
        <form
          onSubmit={handleSearch}
          className="relative flex items-center justify-center w-full max-w-2xl mx-auto"
        >
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products, categories, brands..."
              value={searchTerm}
              className="bg-gray-100 px-4 py-2.5 pl-4 pr-12 rounded-lg focus:outline-none focus:ring-1 focus:ring-black w-full text-sm placeholder:text-gray-500"
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black p-1"
              aria-label="Submit Search"
            >
              <HiMagnifyingGlass className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleSearchToggle}
            className="ml-3 text-gray-600 hover:text-black p-1"
            aria-label="Close search"
          >
            <HiMiniXMark className="h-6 w-6" />
          </button>
        </form>
      ) : (
        <button onClick={handleSearchToggle} aria-label="Open search bar">
          <HiMagnifyingGlass className="h-6 w-6 text-gray-700 hover:text-black" />
        </button>
      )}
    </div>
  );
};

export default Searchbar;
