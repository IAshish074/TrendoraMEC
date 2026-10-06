import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import registerImg from "../assets/register.webp";

const registerSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await registerAuth(data.name, data.email, data.password);
      toast.success(response?.message || "Account registered successfully! Please login.");
      navigate("/login");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Registration failed. Try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm"
        >
          <div className="flex justify-center mb-6">
            <h2 className="text-xl font-bold tracking-tight">Trendora</h2>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Create an Account ✨</h2>
          <p className="text-center mb-6 text-gray-600">
            Enter your details to register for a new account
          </p>

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-semibold mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              {...register("name")}
              className={`w-full p-2 border rounded focus:outline-none focus:ring-1 ${
                errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className={`w-full p-2 border rounded focus:outline-none focus:ring-1 ${
                errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password")}
              placeholder="Enter your password"
              className={`w-full p-2 border rounded focus:outline-none focus:ring-1 ${
                errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword")}
              placeholder="Confirm your password"
              className={`w-full p-2 border rounded focus:outline-none focus:ring-1 ${
                errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-black text-white p-2.5 rounded-lg font-semibold hover:bg-gray-800 transition ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>

      <div className="hidden md:block w-1/2 bg-gray-800">
        <div className="h-full flex flex-col justify-center items-center">
          <img
            src={registerImg}
            alt="Register Account"
            className="h-[750px] w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
