import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import ProductGrid from "./ProductGrid";
import productApi from "../../api/productApi";
import { useCart } from "../../hooks/useCart";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (id) {
      productApi
        .getProduct(id)
        .then((data) => {
          if (data) {
            setProduct(data);
            if (data.images && data.images.length > 0) {
              setMainImage(data.images[0].url);
            }
          }
        })
        .catch(() => {
          toast.error("Failed to load product details.");
        })
        .finally(() => setLoading(false));
    } else {
      // Home page default product preview
      productApi
        .getProducts()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setProduct(data[0]);
            if (data[0].images && data[0].images.length > 0) {
              setMainImage(data[0].images[0].url);
            }
            setSimilarProducts(data.slice(1, 5));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (product?.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size.");
      return;
    }
    if (product?.colors?.length > 0 && !selectedColor) {
      toast.error("Please select a color.");
      return;
    }

    setIsSubmitting(true);
    try {
      const prodId = product?.id || product?._id || id;
      await addToCart({
        productId: prodId,
        name: product?.name || "Product Item",
        size: selectedSize || "Default",
        color: selectedColor || "Default",
        quantity: quantity,
        price: product?.price || 0,
        image: mainImage || product?.images?.[0]?.url || "https://picsum.photos/150",
      });
    } catch {
      toast.error("Could not add product to cart.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuantityChange = (action) => {
    if (action === "plus") {
      setQuantity((prev) => prev + 1);
    }
    if (action === "minus" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg border shadow-sm animate-pulse">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2 h-[450px] bg-gray-200 rounded-lg"></div>
          <div className="md:w-1/2 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Product not found.
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg border shadow-sm">
        <div className="flex flex-col md:flex-row">
          {/* Left thumbnails */}
          {product.images && product.images.length > 0 && (
            <div className="hidden md:flex flex-col space-y-4 mr-6">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.altText || `Thumbnail ${index}`}
                  onClick={() => setMainImage(image.url)}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${
                    mainImage === image.url ? "border-black border-2" : "border-gray-200"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="md:w-1/2">
            <div className="mb-4">
              <img
                src={mainImage || "https://picsum.photos/450/450?random=1"}
                alt={product.name}
                className="w-full h-[450px] object-cover rounded-lg bg-gray-100"
              />
            </div>

            {/* Mobile Thumbnails */}
            {product.images && product.images.length > 0 && (
              <div className="md:hidden flex space-x-4 mb-4 overflow-x-auto">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.altText || `Thumbnail ${index}`}
                    onClick={() => setMainImage(image.url)}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${
                      mainImage === image.url ? "border-black border-2" : "border-gray-200"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="md:w-1/2 md:ml-10">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <div className="flex items-center space-x-3 mb-4">
              <p className="text-2xl font-bold text-gray-900">${product.price}</p>
              {product.originalPrice && (
                <p className="text-lg text-gray-400 line-through">
                  ${product.originalPrice}
                </p>
              )}
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-gray-700 font-semibold mb-2 text-sm">Color:</p>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded border text-sm capitalize font-medium transition ${
                        selectedColor === color
                          ? "bg-black text-white border-black"
                          : "border-gray-300 text-gray-800 hover:border-gray-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <p className="text-gray-700 font-semibold mb-2 text-sm">Size:</p>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded border text-sm font-semibold transition ${
                        selectedSize === size
                          ? "bg-black text-white border-black"
                          : "border-gray-300 text-gray-800 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="text-gray-700 font-semibold mb-2 text-sm">Quantity:</p>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => handleQuantityChange("minus")}
                  className="px-3 py-1 bg-gray-100 rounded text-lg font-bold hover:bg-gray-200 border"
                >
                  -
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange("plus")}
                  className="px-3 py-1 bg-gray-100 rounded text-lg font-bold hover:bg-gray-200 border"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isSubmitting}
              className={`bg-black text-white py-3 px-6 rounded-lg w-full mb-6 font-semibold tracking-wider transition ${
                isSubmitting ? "cursor-not-allowed opacity-50" : "hover:bg-gray-800"
              }`}
            >
              {isSubmitting ? "ADDING TO CART..." : "ADD TO CART"}
            </button>

            <div className="mt-8 pt-6 border-t text-gray-700">
              <h3 className="text-lg font-bold mb-3">Specifications</h3>
              <table className="w-full text-left text-sm text-gray-600">
                <tbody>
                  {product.brand && (
                    <tr className="border-b">
                      <td className="py-2 font-semibold text-gray-800">Brand</td>
                      <td className="py-2">{product.brand}</td>
                    </tr>
                  )}
                  {product.material && (
                    <tr className="border-b">
                      <td className="py-2 font-semibold text-gray-800">Material</td>
                      <td className="py-2">{product.material}</td>
                    </tr>
                  )}
                  {product.sku && (
                    <tr>
                      <td className="py-2 font-semibold text-gray-800">SKU</td>
                      <td className="py-2">{product.sku}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl text-center font-bold mb-6">
              You May Also Like
            </h2>
            <ProductGrid products={similarProducts} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
