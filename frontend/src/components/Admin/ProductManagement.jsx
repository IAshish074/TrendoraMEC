import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import productApi from "../../api/productApi";

const ProductManagement = () => {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: () => productApi.getProducts(),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => productApi.deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete product.");
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const productList = Array.isArray(products)
    ? products
    : Array.isArray(products?.content)
    ? products.content
    : Array.isArray(products?.data)
    ? products.data
    : [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Link
          to="/admin/products/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
        >
          + Add Product
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500 font-medium">
          Loading products...
        </div>
      ) : (
        <div className="overflow-x-auto shadow-sm rounded-lg border bg-white">
          <table className="min-w-full text-left text-gray-500 text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {productList.length > 0 ? (
                productList.map((product) => {
                  const prodId = product.id || product._id;
                  return (
                    <tr key={prodId} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-semibold text-gray-900 whitespace-nowrap">
                        {product.name}
                      </td>
                      <td className="p-4 font-medium text-gray-900">${product.price}</td>
                      <td className="p-4">{product.sku || "N/A"}</td>
                      <td className="p-4">{product.category || "N/A"}</td>
                      <td className="p-4 flex items-center space-x-2">
                        <Link
                          to={`/admin/products/${prodId}/edit`}
                          className="bg-amber-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-amber-600 transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(prodId)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
