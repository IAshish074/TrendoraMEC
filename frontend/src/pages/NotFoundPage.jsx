import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <h1 className="text-6xl font-extrabold text-gray-900 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
