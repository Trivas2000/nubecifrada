import React, { useEffect, useState } from 'react';
import CreateGroupForm from "../componets/createGroupForm";

interface Grupo {
  uuid_grupo: string;
  nombre_grupo: string;
  uuid_user_admin: string;
}

const HomePage: React.FC = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token,setToken] = useState<string | null>(null);
  const fetchGrupos = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token no encontrado. Debes estar autenticado.');
      }

      const response = await fetch('http://localhost:8000/api/grupos/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error al obtener los grupos');
      }
      const data = await response.json();
      setGrupos(data); // Suponiendo que la respuesta es un array de grupos
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Tus Grupos</h1>

        {/* Caja de formulario para crear un grupo */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 max-w-md mx-auto border border-gray-200">
          <CreateGroupForm onGroupCreated={fetchGrupos} />
        </div>

        {loading && <p className="text-gray-600">Cargando grupos...</p>}

        {error && <p className="text-red-600">Error: {error}</p>}

        {grupos.length === 0 && !loading ? (
          <p className="text-gray-600">No tienes grupos asignados.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grupos.map((grupo) => (
              <div
                key={grupo.uuid_grupo}
                className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {grupo.nombre_grupo}
                </h2>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Admin:</span>{" "}
                  {grupo.uuid_user_admin}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="font-medium">ID del Grupo:</span>{" "}
                  {grupo.uuid_grupo}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;