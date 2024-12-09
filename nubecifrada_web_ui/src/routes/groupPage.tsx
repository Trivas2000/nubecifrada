import TablaGrupos from "../components/tabla_grupo.js";
import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import TablaIntegrantesGrupo from "../components/tabla_integrantes_grupo.js";
import { Button } from 'flowbite-react';
import ModalAñadirMiembro from "../components/modal_anadir_miembro.js";
import ModalIntegrantesGrupo from "../components/modal_integrantes_grupo.js";
import axios from "axios";
import {TextFileUploader}  from "../components/addFile.js";


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

interface User {
  uuid_user: string;
  username: string;
  first_name: string;
}


const GroupPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const username = localStorage.getItem('username');
    const uuid_user = localStorage.getItem('uuid_user');
    const navigate = useNavigate();
    const [grupo, setGrupo] = useState<Grupo | null>(null);
    const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [integrantesChanged, setIntegrantesChanged] = useState<boolean>(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [isIntegrantesModalOpen, setIsIntegrantesModalOpen] = useState(false);


    useEffect(() => {
      fetchGrupos();
      fetchIntegrantes();
    }, []);

    useEffect(() => {
      fetchIntegrantes();
    },[integrantesChanged]);


    // Maneja eliminacion desde componente hijo para actualizar integrantes
    const handleIntegrateChanged = () => {
      setIntegrantesChanged(!integrantesChanged);
    }

    const handleHomeClick = () => {
      navigate('/main');
    };

    const handleAddMemberClick = () => {
      setIsModalOpen(true);
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
    };


    useEffect(() => {
      getAllUsers();
    }, []);


    const handleOpenIntegrantesModal = () => {
      setIsIntegrantesModalOpen(true);
    };

    const handleCloseIntegrantesModal = () => {
      setIsIntegrantesModalOpen(false);
    };




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

    } catch (error: any) {
      setError(error.message);
    }
  };

  const getAllUsers = async () => {
    const url = `http://localhost:8000/api/users/`;
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      } else {
        alert('Error al buscar los usuarios');
        return null;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al buscar los usuarios');
      return null;
    }
  };

  const handleAddMember = async (uuid_user: string) => {

    const url = `http://localhost:8000/api/grupo/${grupo?.uuid_grupo}/integrante/${uuid_user}/anadir/`;
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Token no encontrado. Debes estar autenticado.');
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        handleIntegrateChanged();
        alert('Miembro añadido correctamente');
      } else {
        alert('Error al añadir el miembro');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al añadir el miembro');
    }
  }

// ---------------------------------------Generar Claves publicas y privadas---------------------------------------

// ---------------Funcion para generar llaves publicas y privadas----------------

  const generateAndCalculatePublicKey = (groupId: string, generator: number, modulus: number): string => {
      const g = BigInt(generator);
      const p = BigInt(modulus);

      // Generar la clave privada aleatoria
      const privateKey = window.crypto.getRandomValues(new Uint8Array(32)); // 32 bytes = 256 bits
      const privateKeyInt = BigInt("0x" + Array.from(privateKey).map((b) => b.toString(16).padStart(2, "0")).join(""));

      // Guardar la clave privada en localStorage asociada al grupo
      const privateKeyBase64 = btoa(String.fromCharCode(...privateKey)); // Codificar como Base64
      localStorage.setItem(`privateKey-${groupId}`, privateKeyBase64);

      // Mostrar la clave privada generada
      alert(`Clave privada generada: ${privateKeyInt}`);

      // Calcular la clave pública
      const publicKey = (g ** privateKeyInt % p).toString();

      return publicKey; // Devolver la clave pública
  };


// ---------------Funcion para registrar llaves publicas----------------
const registerPublicKey = async (groupId: string, publicKey: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Usuario no autenticado.");
    }

    const response = await fetch(`http://localhost:8000/api/grupos/${groupId}/registrar-clave-publica/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ public_key: publicKey }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al registrar la clave pública.");
    }

    console.log("Clave pública registrada con éxito.");
  } catch (error) {

      if (error instanceof Error) {
        console.error("Error al registrar la clave pública:", error.message);
      } else {
        console.error("Error desconocido al registrar la clave pública");
      }
  }

  
  const generateMasterteKey = () =>{

  }

};

// ---------------Funcion para manejar el evento de generar claves----------------
  const handleGenerateKeys = async () => {
      try {
        if (!grupo?.uuid_grupo) {
          console.error("UUID del grupo no está disponible.");
          return;
        }

        // hay que obtenerlo desde el backend
        const generator = 2;
        const modulus = 23;

        const publicKey = generateAndCalculatePublicKey(grupo.uuid_grupo, generator, modulus);
        console.log("Clave pública generada:", publicKey);

        await registerPublicKey(grupo.uuid_grupo, publicKey);
        console.log("Clave pública registrada exitosamente.");
      } catch (error) {
        console.error("Error al generar o registrar claves:", error);
      }
  };




  return (
    <div className="h-screen flex flex-col">
        <div className="flex items-center justify-between p-10 border-b px-48">
          <div className="flex items-center gap-2">
            <h2 className="text-4xl font-bold">Grupo:</h2>
            <span className="text-4xl font-normal text-gray-700">
              {grupo?.nombre_grupo || "Nombre del Grupo"}
            </span>
          </div>


          <div className="flex gap-20">
            <Button gradientDuoTone="purpleToPink" size="lg" onClick={handleAddMemberClick}>
              Añadir integrantes
            </Button>

            <Button gradientDuoTone="purpleToPink" size="lg" onClick={handleOpenIntegrantesModal}>
              Ver Integrantes
            </Button>

            <Button gradientDuoTone="purpleToPink" size="lg" onClick={handleHomeClick}>
              Home
            </Button>

            <Button gradientDuoTone="purpleToPink" size="lg" onClick={handleGenerateKeys}>
              Generar Claves
            </Button>



            <Button gradientDuoTone="purpleToPink" size="lg" onClick={handleHomeClick}>
                Home
            </Button>
            <Button gradientDuoTone="purpleToPink" size="lg" onClick={generateMasterKey}>
              Generar llave maestra
            </Button>



          </div>

        </div>

        {/* Zona para subir archivos */}
        <div className="flex-1 flex-col items-center justify-center border-b px-52 py-10">
          <p className="text-4xl text-gray-700 mb-6">Subir Archivo</p>

          {grupo?.uuid_user_admin === uuid_user && (
          <TextFileUploader groupUuid={grupo?.uuid_grupo} userUuid={uuid_user}/>)
          }

        </div>

        {/* Tabla */}
        <div className="flex-1 flex flex-col items-center justify-center p-5">
          {grupo?.uuid_user_admin === uuid_user && (
          <TablaGrupos groupUuid = {grupo?.uuid_grupo}/>)}
        </div>

        {/* Modal para añadir integrantes */}
        <ModalAñadirMiembro
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddMember={handleAddMember}
          allUsers={allUsers}
        />

        {/* Modal para ver integrantes */}
        <ModalIntegrantesGrupo
        isOpen={isIntegrantesModalOpen}
        onClose={handleCloseIntegrantesModal}
        integrantes={integrantes}
        uuidGrupo={grupo?.uuid_grupo || ""}
        handleDelete={handleIntegrateChanged}
        />
  </div>
  );
};
export default GroupPage;
