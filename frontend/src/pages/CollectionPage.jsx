import React, { useEffect, useRef, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import FilterSidebar from "../components/product/FilterSidebar";
import SortOption from "../components/product/SortOption";
import ProductGrid from "../components/product/ProductGrid";
import productApi from "../api/productApi";

const CollectionPage = () => {
  const [searchParams] = useSearchParams();
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const queryParams = Object.fromEntries([...searchParams]);

  const { data: products = [], isLoading, isError, error } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => productApi.getProducts(queryParams),
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen container mx-auto">
      {/* Mobile filter button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden border p-3 flex justify-center items-center bg-gray-50 font-medium"
      >
        <FaFilter className="mr-2" /> Filters
      </button>

      {/* Filter Sidebar */}
      <div
        ref={sidebarRef}
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 z-50 left-0 w-64 bg-white overflow-y-auto transition-transform duration-300 lg:static lg:translate-x-0 border-r`}
      >
        <FilterSidebar />
      </div>

      <div className="flex-grow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight">
            Product Collection
          </h2>
          <SortOption />
        </div>

        {isError ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center my-8 border border-red-200">
            Failed to load products: {error?.response?.data?.message || error.message || "Server Error"}
          </div>
        ) : (
          <ProductGrid products={products} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default CollectionPage;
