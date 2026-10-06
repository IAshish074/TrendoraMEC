import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import loginImg from "../assets/login.webp";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name || "User"}! 👋`);

      if (user.role === "ROLE_ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Invalid email or password!";
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
            <h2 className="text-xl font-md tracking-tight font-bold">Trendora</h2>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Hey there! 👋</h2>
          <p className="text-center mb-6 text-gray-600">
            Enter your email and password to Login
          </p>

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

          <div className="mb-6">
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

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-black text-white p-2.5 rounded-lg font-semibold hover:bg-gray-800 transition ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>

      <div className="hidden md:block w-1/2 bg-gray-800">
        <div className="h-full flex flex-col justify-center items-center">
          <img
            src={loginImg}
            alt="Login to Account"
            className="h-[750px] w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
