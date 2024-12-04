import React, {useEffect,useState} from 'react';

interface Grupo {
  uuid_grupo: string;
  nombre_grupo: string;
  uuid_user_admin: string;
}

const HomePage: React.FC = () => {
  const [grupos,setGrupos] = useState<Grupo[]>([]);
  const [loading,setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    // Función para obtener los grupos del usuario
    const fetchGrupos = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Token no encontrado. Debes estar autenticado.');
        }

        const response = await fetch('http://localhost:8000/api/grupos/',{
            headers:{
              Authorization:`Bearer ${token}`,
            }
          }
        ); 
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
    fetchGrupos();
  }, [])


  return (
    <div>
      <h1>Home Page</h1>
      
      {loading && <p>Cargando grupos...</p>}
      
      {error && <p>Error: {error}</p>}

      <ul>
        {grupos.length === 0 && !loading ? (
          <p>No tienes grupos asignados.</p>
        ) : (
          grupos.map((grupo) => (
            <li key={grupo.uuid_grupo}>
              <h2>{grupo.nombre_grupo}</h2>
              <p>Admin: {grupo.uuid_user_admin}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
export default HomePage;
