import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const FilterSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filter, setFilter] = useState({
    category: "",
    gender: "",
    color: "",
    size: [],
    material: [],
    brand: [],
    minPrice: 0,
    maxPrice: 1000,
  });

  const [priceRange, setPriceRange] = useState([0, 1000]);

  const categories = ["Top Wear", "Bottom Wear"];
  const colors = [
    "Red",
    "Blue",
    "Black",
    "Green",
    "Yellow",
    "Gray",
    "White",
    "Pink",
    "Beige",
    "Navy",
  ];
  const materials = [
    "Cotton",
    "Wool",
    "Denim",
    "Polyester",
    "Silk",
    "Linen",
    "Viscose",
    "Fleece",
  ];
  const size = ["XS", "S", "M", "L", "XL", "XXL"];
  const brands = [
    "Urban Threads",
    "Modern Fit",
    "Street Style",
    "Beach Breeze",
    "Fashionista",
    "ChicStyle",
  ];
  const genders = ["Men", "Women"];

  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);

    setFilter({
      category: params.category || "",
      gender: params.gender || "",
      color: params.color || "",
      size: params.size ? params.size.split(",") : [],
      material: params.material ? params.material.split(",") : [],
      brand: params.brand ? params.brand.split(",") : [],
      minPrice: Number(params.minPrice ?? 0),
      maxPrice: Number(params.maxPrice ?? 1000),
    });

    setPriceRange([0, Number(params.maxPrice ?? 1000)]);
  }, [searchParams]);

  const updateURLParams = (newFilter) => {
    const params = new URLSearchParams();
    Object.keys(newFilter).forEach((key) => {
      if (Array.isArray(newFilter[key]) && newFilter[key].length > 0) {
        params.append(key, newFilter[key].join(","));
      } else if (newFilter[key] !== "" && newFilter[key] !== null && newFilter[key] !== undefined) {
        params.append(key, newFilter[key]);
      }
    });
    setSearchParams(params);
    navigate(`?${params.toString()}`);
  };

  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    let newFilter = { ...filter };

    if (type === "checkbox") {
      if (checked) {
        newFilter[name] = [...(newFilter[name] || []), value];
      } else {
        newFilter[name] = (newFilter[name] || []).filter((item) => item !== value);
      }
    } else {
      newFilter[name] = value;
    }

    setFilter(newFilter);
    updateURLParams(newFilter);
  };

  const handleColorClick = (colorName) => {
    const newColor = filter.color === colorName ? "" : colorName;
    const newFilter = { ...filter, color: newColor };
    setFilter(newFilter);
    updateURLParams(newFilter);
  };

  const handlePriceChange = (e) => {
    const newPrice = Number(e.target.value);
    setPriceRange([0, newPrice]);
    const newFilters = { ...filter, minPrice: 0, maxPrice: newPrice };
    setFilter(newFilters);
    updateURLParams(newFilters);
  };

  const handleClearFilters = () => {
    const cleared = {
      category: "",
      gender: "",
      color: "",
      size: [],
      material: [],
      brand: [],
      minPrice: 0,
      maxPrice: 1000,
    };
    setFilter(cleared);
    setPriceRange([0, 1000]);
    setSearchParams(new URLSearchParams());
    navigate("");
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium text-gray-800">Filter</h3>
        <button
          onClick={handleClearFilters}
          className="text-xs text-blue-600 font-semibold hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* category filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Category</label>
        {categories.map((category) => (
          <div key={category} className="flex items-center mb-1">
            <input
              type="radio"
              name="category"
              value={category}
              checked={filter.category === category}
              onChange={handleFilterChange}
              className="mr-2 h-4 w-4 text-black focus:ring-black border-gray-400"
            />
            <span className="text-gray-700 text-sm">{category}</span>
          </div>
        ))}
      </div>

      {/* Gender filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Gender</label>
        {genders.map((gender) => (
          <div key={gender} className="flex items-center mb-1">
            <input
              type="radio"
              name="gender"
              value={gender}
              checked={filter.gender === gender}
              onChange={handleFilterChange}
              className="mr-2 h-4 w-4 text-black focus:ring-black border-gray-400"
            />
            <span className="text-gray-700 text-sm">{gender}</span>
          </div>
        ))}
      </div>

      {/* color filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Colors</label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorClick(color)}
              title={color}
              className={`w-7 h-7 rounded-full border border-gray-300 transition hover:scale-105 ${
                filter.color === color ? "ring-2 ring-black" : ""
              }`}
              style={{
                backgroundColor: color.toLowerCase(),
              }}
            />
          ))}
        </div>
      </div>

      {/* size filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Size</label>
        {size.map((sz) => (
          <div key={sz} className="flex items-center mb-1">
            <input
              type="checkbox"
              value={sz}
              onChange={handleFilterChange}
              name="size"
              checked={filter.size.includes(sz)}
              className="mr-2 h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <span className="text-gray-700 text-sm">{sz}</span>
          </div>
        ))}
      </div>

      {/* Material filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Materials</label>
        {materials.map((material) => (
          <div key={material} className="flex items-center mb-1">
            <input
              type="checkbox"
              value={material}
              onChange={handleFilterChange}
              checked={filter.material.includes(material)}
              name="material"
              className="mr-2 h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <span className="text-gray-700 text-sm">{material}</span>
          </div>
        ))}
      </div>

      {/* brand filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Brands</label>
        {brands.map((brand) => (
          <div key={brand} className="flex items-center mb-1">
            <input
              type="checkbox"
              checked={filter.brand.includes(brand)}
              value={brand}
              onChange={handleFilterChange}
              name="brand"
              className="mr-2 h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <span className="text-gray-700 text-sm">{brand}</span>
          </div>
        ))}
      </div>

      {/* price Range filter */}
      <div className="mb-8">
        <label className="block text-gray-600 font-medium mb-2">
          Price Range (Up to ${priceRange[1]})
        </label>
        <input
          type="range"
          name="priceRange"
          min={0}
          max={1000}
          step={10}
          value={priceRange[1]}
          onChange={handlePriceChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
        />
        <div className="flex justify-between text-gray-600 text-sm mt-2">
          <span>$0</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
