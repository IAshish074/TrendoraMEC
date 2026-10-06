import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import productApi from "../../api/productApi";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.coerce.number().min(0, "Price must be greater than or equal to 0"),
  countInStock: z.coerce.number().min(0, "Stock count must be 0 or greater"),
  sku: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  material: z.string().optional(),
  gender: z.string().optional(),
  sizes: z.string().optional(),
  colors: z.string().optional(),
  imageUrl: z.string().optional(),
});

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id && id !== "new";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isLoading },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      countInStock: 0,
      sku: "",
      category: "",
      brand: "",
      material: "",
      gender: "",
      sizes: "",
      colors: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (isEditing) {
      productApi
        .getProduct(id)
        .then((data) => {
          if (data) {
            setValue("name", data.name || "");
            setValue("description", data.description || "");
            setValue("price", data.price || 0);
            setValue("countInStock", data.countInStock || 0);
            setValue("sku", data.sku || "");
            setValue("category", data.category || "");
            setValue("brand", data.brand || "");
            setValue("material", data.material || "");
            setValue("gender", data.gender || "");
            setValue(
              "sizes",
              Array.isArray(data.sizes) ? data.sizes.join(", ") : data.sizes || ""
            );
            setValue(
              "colors",
              Array.isArray(data.colors) ? data.colors.join(", ") : data.colors || ""
            );
            setValue(
              "imageUrl",
              Array.isArray(data.images) && data.images[0]?.url
                ? data.images.map((img) => img.url).join(", ")
                : data.image || ""
            );
          }
        })
        .catch(() => {
          toast.error("Failed to load product details.");
        });
    }
  }, [id, isEditing, setValue]);

  const onSubmit = async (data) => {
    const formattedData = {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      countInStock: Number(data.countInStock),
      sku: data.sku,
      category: data.category,
      brand: data.brand,
      material: data.material,
      gender: data.gender,
      sizes: data.sizes
        ? data.sizes.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      colors: data.colors
        ? data.colors.split(",").map((c) => c.trim()).filter(Boolean)
        : [],
      images: data.imageUrl
        ? data.imageUrl
            .split(",")
            .map((url) => ({ url: url.trim() }))
            .filter((img) => img.url)
        : [],
    };

    try {
      if (isEditing) {
        await productApi.updateProduct(id, formattedData);
        toast.success("Product updated successfully!");
      } else {
        await productApi.createProduct(formattedData);
        toast.success("Product created successfully!");
      }
      navigate("/admin/products");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to save product. Check inputs and try again."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-gray-500 font-medium">
        Loading product form...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border shadow-sm my-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {isEditing ? "Edit Product" : "Add New Product"}
        </h2>
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="text-sm text-gray-600 font-semibold hover:underline"
        >
          ← Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            {...register("name")}
            className={`w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 ${
              errors.name ? "border-red-500" : "border-gray-300 focus:ring-black"
            }`}
            placeholder="e.g. Premium Cotton Jacket"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            {...register("description")}
            rows={4}
            className={`w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 ${
              errors.description ? "border-red-500" : "border-gray-300 focus:ring-black"
            }`}
            placeholder="Provide detailed description of the product..."
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Price ($) *
            </label>
            <input
              type="number"
              step="0.01"
              {...register("price")}
              className={`w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                errors.price ? "border-red-500" : "border-gray-300 focus:ring-black"
              }`}
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Count in Stock *
            </label>
            <input
              type="number"
              {...register("countInStock")}
              className={`w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                errors.countInStock ? "border-red-500" : "border-gray-300 focus:ring-black"
              }`}
            />
            {errors.countInStock && (
              <p className="text-red-500 text-xs mt-1">{errors.countInStock.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">SKU</label>
            <input
              type="text"
              {...register("sku")}
              className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g. TR-JKT-001"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
            <input
              type="text"
              {...register("category")}
              className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g. Top Wear"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
            <select
              {...register("gender")}
              className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white"
            >
              <option value="">Unisex / All</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Brand</label>
            <input
              type="text"
              {...register("brand")}
              className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g. Urban Threads"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Material</label>
            <input
              type="text"
              {...register("material")}
              className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g. 100% Organic Cotton"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Sizes (comma-separated)
          </label>
          <input
            type="text"
            {...register("sizes")}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="S, M, L, XL"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Colors (comma-separated)
          </label>
          <input
            type="text"
            {...register("colors")}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="Black, Red, Blue"
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Product Image (Upload File or Enter Image URLs)
          </label>
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error("Image file size should be less than 5MB");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const currentUrls = register("imageUrl").value;
                    const newUrls = currentUrls ? `${currentUrls}, ${reader.result}` : reader.result;
                    setValue("imageUrl", newUrls);
                    toast.success("Image file attached successfully!");
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50 focus:outline-none"
            />

            <input
              type="text"
              {...register("imageUrl")}
              className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving Product..."
            : isEditing
            ? "Update Product"
            : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default EditProductPage;
