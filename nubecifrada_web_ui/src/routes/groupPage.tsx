import TablaGrupos from "../components/tabla_grupo.js";
import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import TablaIntegrantesGrupo from "../components/tabla_integrantes_grupo.js";
import { Button } from 'flowbite-react';
import axios from "axios";

interface Grupo {
  uuid_grupo: string;
  nombre_grupo: string;
  uuid_user_admin: string;
}

interface Integrante {
  uuid_integrantes: string;
  uuid_user: string;
  uuid_grupo: string;
}

const GroupPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      setGrupo((data.find((grupo: Grupo) => grupo.uuid_grupo === id)));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchIntegrantes = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token no encontrado. Debes estar autenticado.');
      }

      const response = await fetch(`http://localhost:8000/api/grupos/${id}/integrantes/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error al obtener los integrantes del grupo');
      }
      const data = await response.json();
      setIntegrantes(data);
      console.log(data);
    } catch (error: any) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchGrupos();
    fetchIntegrantes();
  }, []);

  const handleHomeClick = () => {
    navigate('/main');
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1">
        <div className="flex-1 flex flex-col ">
          <div className="flex flex-col">
            <div className="flex  -b p-4">
              <Button gradientDuoTone="purpleToPink" size="lg" onClick={handleHomeClick}>Home</Button>
            </div>
            <div className="flex-1 flex justify-center items-center  ">
              <h2 className="text-6xl font-bold">{grupo?.nombre_grupo}</h2>
            </div>
          </div>
          <div className="flex flex-1">
            <div className="flex-1 flex justify-center items-center  ">
              <Button gradientDuoTone="purpleToPink" size="xl">Añadir miembro al grupo</Button>
            </div>
            <div className="flex-1 flex justify-center items-center  ">
              <Button gradientDuoTone="purpleToPink" size="xl">Añadir archivo al grupo</Button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center  ">
        <h2 className="text-3xl font-bold">Integrantes:</h2>
        <TablaIntegrantesGrupo />
        </div>
      </div>
      <div className="flex-1 flex justify-center items-center  ">
        <TablaGrupos />
      </div>
    </div>
  );
};

export default GroupPage;
