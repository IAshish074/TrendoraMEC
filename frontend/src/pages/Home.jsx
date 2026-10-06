import React from "react";
import { useQuery } from "@tanstack/react-query";
import Hero from "../components/layout/Hero";
import GenderCollectionSection from "../components/product/GenderCollectionSection";
import NewArrivals from "../components/product/NewArrivals";
import ProductDetails from "../components/product/ProductDetails";
import ProductGrid from "../components/product/ProductGrid";
import FeaturesCollection from "../components/product/FeaturesCollection";
import FeatureSection from "../components/product/FeatureSection";
import productApi from "../api/productApi";

const Home = () => {
  const { data: topWearProducts = [], isLoading } = useQuery({
    queryKey: ["products", "topWear"],
    queryFn: () => productApi.getProducts({ category: "Top Wear" }),
  });

  return (
    <div>
      <Hero />
      <GenderCollectionSection />
      <NewArrivals />

      {/* Best Seller Section */}
      <h2 className="text-3xl text-center font-bold mb-4 mt-12 tracking-tight">
        Best Seller
      </h2>
      <ProductDetails />

      <div className="container mx-auto my-16 px-4">
        <h2 className="text-2xl text-center font-bold mb-8 uppercase tracking-tight">
          Top Wear Collection
        </h2>
        <ProductGrid products={topWearProducts} isLoading={isLoading} />
      </div>

      <FeaturesCollection />
      <FeatureSection />
    </div>
  );
};

export default Home;
