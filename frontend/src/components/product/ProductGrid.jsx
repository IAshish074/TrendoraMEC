import React from "react";
import { Link } from "react-router-dom";

const ProductGrid = ({ products = [], isLoading = false }) => {
  const productList = Array.isArray(products)
    ? products
    : Array.isArray(products?.content)
    ? products.content
    : Array.isArray(products?.data)
    ? products.data
    : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="bg-white p-4 rounded-lg animate-pulse">
            <div className="w-full h-96 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!productList || productList.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 font-medium">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {productList.map((product) => {
        const prodId = product.id || product._id;
        const imageUrl =
          product.images?.[0]?.url ||
          product.image ||
          "https://picsum.photos/400/500?random=1";

        return (
          <Link key={prodId} to={`/product/${prodId}`} className="block group">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <div className="w-full h-96 mb-4 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={imageUrl}
                  alt={product.images?.[0]?.altText || product.name || "Product"}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition duration-300"
                />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                {product.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-gray-900 font-bold text-sm">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ProductGrid;
