import React, { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import productApi from "../../api/productApi";

const NewArrivals = () => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStartLeft, setScrollStartLeft] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const { data: newArrivals = [], isLoading } = useQuery({
    queryKey: ["products", "newArrivals"],
    queryFn: () => productApi.getProducts({ sortBy: "newest" }),
  });

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollStartLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    scrollRef.current.scrollLeft = scrollStartLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const updateScrollButton = () => {
    const container = scrollRef.current;
    if (container) {
      const leftScroll = container.scrollLeft;
      const rightScrollable =
        container.scrollWidth > leftScroll + container.clientWidth + 5;
      setCanScrollLeft(leftScroll > 0);
      setCanScrollRight(rightScrollable);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButton);
      updateScrollButton();
      return () => {
        container.removeEventListener("scroll", updateScrollButton);
      };
    }
  }, [newArrivals]);

  const newArrivalsList = Array.isArray(newArrivals)
    ? newArrivals
    : Array.isArray(newArrivals?.content)
    ? newArrivals.content
    : Array.isArray(newArrivals?.data)
    ? newArrivals.data
    : [];

  return (
    <section className="py-16 px-4 lg:px-0">
      <div className="container mx-auto text-center mb-10 relative">
        <h2 className="text-3xl font-bold mb-4">Explore New Arrivals</h2>
        <p className="text-lg text-gray-600 mb-8">
          Discover the latest styles straight off the runway, freshly added to
          keep your wardrobe on the cutting edge of fashion.
        </p>

        {/* Scroll buttons */}
        <div className="absolute right-0 bottom-[-30px] flex space-x-2 z-10">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-2 rounded border transition ${
              canScrollLeft
                ? "bg-white text-black hover:bg-gray-100"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            aria-label="Scroll left"
          >
            <FiChevronLeft className="text-2xl" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-2 rounded border transition ${
              canScrollRight
                ? "bg-white text-black hover:bg-gray-100"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            aria-label="Scroll right"
          >
            <FiChevronRight className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      {isLoading ? (
        <div className="container mx-auto flex space-x-6 overflow-hidden">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="min-w-[100%] sm:min-w-[50%] lg:min-w-[30%] h-[500px] bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      ) : newArrivalsList.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No new arrivals available right now.
        </div>
      ) : (
        <div
          ref={scrollRef}
          className={`container mx-auto overflow-x-auto flex space-x-6 relative scrollbar-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {newArrivalsList.map((product) => {
            const prodId = product.id || product._id;
            const imageUrl =
              product.images?.[0]?.url ||
              product.image ||
              "https://picsum.photos/500/500?random=1";

            return (
              <div
                key={prodId}
                className="min-w-[100%] sm:min-w-[50%] lg:min-w-[30%] relative group"
              >
                <img
                  src={imageUrl}
                  alt={product.images?.[0]?.altText || product.name}
                  className="w-full h-[500px] object-cover rounded-lg"
                  draggable="false"
                />
                <div className="absolute bottom-0 left-0 right-0 backdrop-blur-md bg-black/50 text-white p-4 rounded-b-lg">
                  <Link to={`/product/${prodId}`} className="block">
                    <h4 className="font-medium text-lg">{product.name}</h4>
                    <p className="mt-1 font-semibold">${product.price}</p>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default NewArrivals;
