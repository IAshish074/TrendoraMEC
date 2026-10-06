import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userApi from "../../api/userApi";
import authApi from "../../api/authApi";

const addUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email address is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string(),
});

const UserManagement = () => {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => userApi.getUsers(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "ROLE_USER",
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => userApi.updateUserRole(userId, role),
    onSuccess: () => {
      toast.success("User role updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update user role.");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => userApi.deleteUser(userId),
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete user.");
    },
  });

  const handleAddUser = async (data) => {
    try {
      await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      toast.success("User added successfully!");
      reset();
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add user.");
    }
  };

  const handleRoleChange = (userId, newRole) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>

      {/* Add New User Form */}
      <div className="p-6 rounded-lg mb-8 border bg-white shadow-sm">
        <h3 className="text-lg font-bold mb-4">Add New User</h3>
        <form onSubmit={handleSubmit(handleAddUser)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                {...register("name")}
                className={`w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                  errors.name ? "border-red-500" : "border-gray-300 focus:ring-black"
                }`}
                placeholder="Full Name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                {...register("email")}
                className={`w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                  errors.email ? "border-red-500" : "border-gray-300 focus:ring-black"
                }`}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                {...register("password")}
                className={`w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                  errors.password ? "border-red-500" : "border-gray-300 focus:ring-black"
                }`}
                placeholder="Minimum 6 characters"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
              <select
                {...register("role")}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white"
              >
                <option value="ROLE_USER">Customer (ROLE_USER)</option>
                <option value="ROLE_ADMIN">Admin (ROLE_ADMIN)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white py-2 px-6 rounded-lg text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {isSubmitting ? "Adding User..." : "Add User"}
          </button>
        </form>
      </div>

      {/* User List Table */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500 font-medium">Loading users...</div>
      ) : (
        <div className="overflow-x-auto shadow-sm rounded-lg border bg-white">
          <table className="min-w-full text-left text-gray-500 text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u) => {
                  const userId = u.id || u._id;
                  const currentRole = u.role?.toUpperCase().includes("ADMIN")
                    ? "ROLE_ADMIN"
                    : "ROLE_USER";

                  return (
                    <tr key={userId} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-semibold text-gray-900 whitespace-nowrap">
                        {u.name}
                      </td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">
                        <select
                          value={currentRole}
                          onChange={(e) => handleRoleChange(userId, e.target.value)}
                          className="p-1.5 border rounded bg-white text-xs font-semibold focus:outline-none"
                        >
                          <option value="ROLE_USER">Customer</option>
                          <option value="ROLE_ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteUser(userId)}
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
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No users found.
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

export default UserManagement;
