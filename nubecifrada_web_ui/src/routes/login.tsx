import { useState } from "react";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Toast } from "flowbite-react";
import { HiExclamationCircle } from "react-icons/hi";

interface LoginFormData {
  username: string;
  password: string;
}

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();


  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    const { username, password } = data;

    try {
      const response = await axios.post("http://localhost:8000/api/token/", {
        username,
        password,
      });

      console.log(response.data);
      if (response.data) {
        localStorage.setItem("token", response.data.access);
        navigate("/main");  // Redirigir al main
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);  // Log del error completo
      setError("Error al iniciar sesión. Por favor, verifica tus credenciales.");
    }
  };


  return (
    <div className="h-screen w-screen flex">
      {/* Left section with image */}
      <div className="w-1/2 bg-blue-500 flex items-center justify-center">
        <div
          className="w-full h-full bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage: "url('/assets/cloud.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
      </div>

      {/* Right section with the login form */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-3/4 max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Inicia Sesión</h2>
          {error && (
            <Toast className="mb-4">
              <HiExclamationCircle className="mr-2 h-5 w-5 text-red-500" />
              {error}
            </Toast>
          )}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Email field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nombre de Usuario
              </label>
              <input
                type="text"
                id="username"
                className={`mt-1 bg-gray-200 block w-full px-4 py-2 border ${errors.username ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Ingrese su nombre de usuario"
                {...register("username", {
                  required: "El nombre de usuario es obligatorio",
                })}
              />
              {errors.username && (
                <p className="text-red-500 text-sm">{errors.username.message}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                className={`mt-1 bg-gray-200 block w-full px-4 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Ingrese su contraseña"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>

            {/* Submit button */}
            <Button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">
              Iniciar Sesión
            </Button>
          </form>
          <p className="mt-4 text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
