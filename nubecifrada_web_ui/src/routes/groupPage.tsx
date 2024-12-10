import TablaGrupos from "../components/tabla_grupo.js";
import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import TablaIntegrantesGrupo from "../components/tabla_integrantes_grupo.js";
import { Button } from 'flowbite-react';
import ModalAñadirMiembro from "../components/modal_anadir_miembro.js";
import ModalIntegrantesGrupo from "../components/modal_integrantes_grupo.js";
import {TextFileUploader}  from "../components/addFile.js";
import { set } from "react-hook-form";


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

interface UserData {
  uuid_user: string;
  llave_publica_usuario: string;
  uuid_grupo: string;
}

interface EncryptedData {
  encryptedData: ArrayBuffer;
  iv: ArrayBuffer;
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


  const generateKeysWithCrypto = async (groupId: string): Promise<string> => {
    try {
        // Configurar los parámetros ECDH con la curva P-256
        const ecParams: EcKeyGenParams = {
            name: "ECDH",
            namedCurve: "P-256", // Usamos la curva estándar P-256
        };

        // Generar el par de claves
        const keyPair = (await crypto.subtle.generateKey(
            ecParams,
            true, // Claves exportables
            ["deriveKey", "deriveBits"]
        )) as CryptoKeyPair; // Especificamos el tipo como CryptoKeyPair

        // Exportar la clave privada y guardarla en localStorage
        const privateKey = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
        localStorage.setItem(`privateKey-${groupId}`, btoa(JSON.stringify(privateKey)));

        // Exportar la clave pública
        const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);

        // Convertir la clave pública a una representación Base64
        const publicKeyBase64 = btoa(JSON.stringify(publicKey));

        return publicKeyBase64; // Devuelve la clave pública como Base64
    } catch (error) {
        console.error("Error al generar claves ECDH:", error);
        throw error;
    }
  };



  type Base64 = string;

// ---------------Funcion para registrar llaves publicas----------------
const registerPublicKey = async (groupId: string, publicKey: Base64) => {
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
  }}



// ---------------Funcion para manejar el evento de generar claves----------------

const getUsuarioGrupoDetalles = async (uuidGrupo: string) => {
  try {
      const token = localStorage.getItem("token");
      if (!token) {
          throw new Error("Usuario no autenticado.");
      }

      const response = await fetch(`http://localhost:8000/api/grupo/${uuidGrupo}/usuario-grupo-detalles/`, {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
          },
      });

      if (!response.ok) {
          throw new Error("Error al obtener la información del usuario en el grupo.");
      }

      const data = await response.json();
      console.log("Datos del usuario en el grupo:", data);
      return data;
  } catch (error) {
      console.error("Error al obtener la información del usuario en el grupo:", error);
  }
};



//-----------------------------Funcion para obtener generador y modulo----------------
const fetchGeneratorAndModulus = async (groupId: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Usuario no autenticado.");

    const response = await fetch(`http://localhost:8000/api/grupo/${groupId}/generador-grupo/`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Error al obtener generador y módulo.");

    const data = await response.json();

    return {
      generator: data.generador_grupo,
      modulus: data.modulo_grupo,
  };

  } catch (error) {
    console.error("Error al obtener generador y módulo:", error);
    throw error; // Lanza el error para manejarlo donde se llame la función
  }
};

// ---------------Funcion para manejar el evento de generar claves----------------
const handleGenerateKeys = async () => {
  try {
    if (!grupo?.uuid_grupo) {
      console.error("UUID del grupo no está disponible.");
      return;
    }

    // Obtener detalles del usuario en el grupo
    const userDetails = await getUsuarioGrupoDetalles(grupo.uuid_grupo);

    // Verificar si ya tiene una clave pública
    if (userDetails.llave_publica_usuario) {
      alert("La clave pública ya existe. No se generará una nueva.");
      return; // Salir de la función si ya tiene una clave pública
    }


    // Obtener generador, módulo y verificación de clave pública
    const { generator, modulus } = await fetchGeneratorAndModulus(grupo.uuid_grupo);


    // Generar clave pública
    const publicKey = await generateKeysWithCrypto(grupo.uuid_grupo,);
    console.log("Clave pública generada:", publicKey);
    alert("La clave pública se ha generado y registrado exitosamente.");

    // Registrar clave pública
    await registerPublicKey(grupo.uuid_grupo, publicKey);


    console.log("Clave pública registrada exitosamente.");
  } catch (error) {
    console.error("Error al generar o registrar claves:", error);
  }
};


// Convierte la cadena base64 a ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const buffer = new ArrayBuffer(length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < length; i++) {
    view[i] = binaryString.charCodeAt(i);
  }
  return buffer;
}

  /*
  cada vez que ingreso a un grupo se chequea si debo enviarle a alguien la llave maestra.
  */

useEffect(() => {
  const checkPendingUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token no encontrado. Debes estar autenticado.');
      }
    
      console.log(id);
      const response = await fetch(
        `http://localhost:8000/api/${id}/integrantes-pendientes/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener los integrantes pendientes');
      }

      const data = await response.json();

      if (data.length === 0) {
        console.log('No hay usuarios pendientes para enviar la llave maestra.');
      } else {
        console.log('Usuarios pendientes:', data);
        
        if(id){
          console.log("iniciando compartir llave maestra")
          const masterKey = localStorage.getItem(`masterKey-${id}`);
          const privateKey  = localStorage.getItem(`privateKey-${id}`);
          console.log(masterKey);
          console.log(privateKey);
          if (!masterKey || !privateKey) {
            throw new Error('La clave maestra o la clave privada no están disponibles');
          }
          // Convertir la clave privada del usuario a un formato adecuado (ArrayBuffer)
          const privateKeyArrayBuffer = new TextEncoder().encode(privateKey);
  
          for (const user of data) {
            console.log(`Enviando llave maestra a ${user.uuid_user}`);
  
            // 1. Convertir la clave pública del destinatario desde el backend a ArrayBuffer
            //const publicKeyArrayBuffer = hexStringToArrayBuffer(user.llave_publica_usuario);
            /*
            // 2. Generar la clave compartida usando Diffie-Hellman
            console.log("generando clave compartida")
            const binaryString_private = atob(privateKey);
            const privateKeyArrayBuffer = Uint8Array.from(binaryString_private, char => char.charCodeAt(0)).buffer;
            const binaryString_master = atob(user.llave_publica_usuario);
            const publicKeyArrayBuffer = Uint8Array.from(binaryString_master, char => char.charCodeAt(0)).buffer;
            const sharedKey = await generateSharedKey(privateKeyArrayBuffer, publicKeyArrayBuffer);
            */
            const privateKeyArrayBuffer = base64ToArrayBuffer(privateKey);
            const publicKeyArrayBuffer = base64ToArrayBuffer(user.llave_publica_usuario);
            const sharedKey = await generateSharedKey(privateKeyArrayBuffer, publicKeyArrayBuffer);

            // 3. Cifrar la masterKey usando la clave compartida
            const encryptedMasterKey = await encryptMasterKey(sharedKey, masterKey);
  
            // 4. Enviar la clave maestra cifrada al backend
            await sendMasterKey(user.uuid_user, encryptedMasterKey);
          }
        }
      }
    } catch (error: any) {
      console.error('Error al verificar usuarios pendientes:', error.message || error);
    }
  };

  checkPendingUsers();
}, [id]);

// Convierte la cadena hexadecimal en ArrayBuffer
function hexStringToArrayBuffer(hexString: string): ArrayBuffer {
  const byteArray = [];
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray.push(parseInt(hexString.substr(i, 2), 16));
  }
  return new Uint8Array(byteArray).buffer;
}

// Generar la clave compartida usando Diffie-Hellman
async function generateSharedKey(privateKeyArrayBuffer: ArrayBuffer, publicKeyArrayBuffer: ArrayBuffer): Promise<CryptoKey> {
  const privateKey = await window.crypto.subtle.importKey(
    'raw',
    privateKeyArrayBuffer,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey']
  );

  const publicKey = await window.crypto.subtle.importKey(
    'raw',
    publicKeyArrayBuffer,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey']
  );

  const sharedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: publicKey,
    },
    privateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt']
  );

  return sharedKey;
}

// Cifrar la masterKey con la clave compartida usando AES-GCM
async function encryptMasterKey(sharedKey: CryptoKey, masterKey: string): Promise<Uint8Array> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization Vector (IV)
  const encoder = new TextEncoder();
  const data = encoder.encode(masterKey);

  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    sharedKey,
    data
  );
  const combinedData = new Uint8Array(iv.byteLength + encryptedData.byteLength);
  combinedData.set(iv, 0); // IV primero
  combinedData.set(new Uint8Array(encryptedData), iv.byteLength); // Datos cifrados después

  return combinedData ;
}

// Enviar la masterKey cifrada al backend
async function sendMasterKey(uuid_user: string, encryptedMasterKey: Uint8Array): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token no encontrado.');
  }
  console.log("enviando masterkey cifrada")
  const response = await fetch(
    `http://localhost:8000/api/enviar-masterkey/`, 
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uuid_user: uuid_user,
        master_key_encrypted: arrayBufferToBase64(encryptedMasterKey), // Enviar el array completo
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Error al enviar la clave maestra cifrada');
  }

  const data = await response.json();
  console.log('Respuesta del servidor:', data);
}

// Convertir ArrayBuffer a Base64 para poder enviarlo en JSON
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
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

            <Button gradientDuoTone="purpleToPink" size="lg" onClick={handleGenerateKeys}>
              Generar Claves
            </Button>

            <Button gradientDuoTone="purpleToPink" size="lg" onClick={handleHomeClick}>
                Home
            </Button>

          </div>

        </div>

        {/* Zona para subir archivos */}
        <div className="flex-1 flex-col items-center justify-center border-b px-52 py-10">
          <p className="text-4xl text-gray-700 mb-6">Subir Archivo</p>

          {grupo?.uuid_grupo && uuid_user && (
          <TextFileUploader groupUuid={grupo?.uuid_grupo} userUuid={uuid_user}/>)
          }

        </div>

        {/* Tabla */}
        <div className="flex-1 flex flex-col items-center justify-center px-14">
          {grupo?.uuid_grupo && uuid_user && (
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
