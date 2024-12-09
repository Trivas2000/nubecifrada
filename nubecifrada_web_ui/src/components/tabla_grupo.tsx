import React, { useEffect, useState } from "react";
import { data } from "react-router-dom";

interface Archivo {
  uuid_archivo: string;
  nombre_archivo: string;
  ruta_archivo: string;
  uuid_user_subidor: string;
  nombre_usuario: string;
}

interface TablaGruposProps {
  groupUuid: string;
}

const TablaGrupos: React.FC<TablaGruposProps> = ({ groupUuid }) => {
  const [archivos, setArchivos] = useState<Archivo[]>([]);

  useEffect(() => {
    const fetchArchivos = async () => {
      try {
        const token = localStorage.getItem("token"); // Obtener el token de autenticación
        const response = await fetch(`http://localhost:8000/api/grupos/${groupUuid}/archivos/`, {
          headers: {
            Authorization: `Bearer ${token}`, // Incluir el token de autenticación en los encabezados
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setArchivos(data);
        } else {
          throw new Error("La respuesta no es un array");
        }
      } catch (error) {
        console.error("Error al obtener los archivos:", error);
      }
    };

    fetchArchivos();
  }, [groupUuid]);

  const handleDownload = async (archivo: Archivo) => {
    console.log("empezando descarga");
    try {
      console.log("buscando toke");
      const token = localStorage.getItem("token"); // Obtener el token de autenticación
      const response = await fetch(`http://localhost:8000/api/archivos/${archivo.uuid_archivo}/download/`, {
        headers: {
          Authorization: `Bearer ${token}`, // Incluir el token de autenticación en los encabezados
        },
      })
      console.log("response");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("archivo.nombre_archivo");
      console.log(archivo.nombre_archivo);
     
      const encryptedData = await response.arrayBuffer();
      console.log("tengo el archivo");
      const key = await getKeyFromStorage();

      console.log("tengo la llave")

      console.log(key);
      
      const decryptedData = await decryptFile(encryptedData, key);
      const blob = new Blob([decryptedData], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      a.download = archivo.nombre_archivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar y desencriptar el archivo:", error);
    }
  };


  async function getKeyFromStorage() {
    const keyData = localStorage.getItem("encryptionKey");
    if (!keyData) {
      return null;
    }
    const importedKey = await crypto.subtle.importKey(
      "jwk",
      JSON.parse(keyData),
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  
    return importedKey;
  }

  
  const decryptFile = async (encryptedData: ArrayBuffer, key: CryptoKey): Promise<ArrayBuffer> => {
    try {
      const iv = new Uint8Array(encryptedData.slice(0, 12)); // Obtén el IV
      console.log("IV:", iv);
  
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        encryptedData.slice(12) // Datos cifrados
      );
      console.log("Datos desencriptados exitosamente");
      return decryptedData;
    } catch (error) {
      console.error("Error al desencriptar los datos:", error);
      throw new Error("Error al desencriptar los datos");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-5 w-full">
      <h2 className="text-4xl text-gray-700 font-normal mb-4">Archivos del Grupo</h2>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Nombre Archivo</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Usuario Subidor</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {archivos.map((archivo, index) => (
              <tr key={archivo.uuid_archivo} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="py-2 px-4 border-b border-gray-200">{archivo.nombre_archivo}</td>
                <td className="py-2 px-4 border-b border-gray-200">{archivo.nombre_usuario}</td>
                <td className="py-2 px-4 border-b border-gray-200">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => handleDownload(archivo)}
                  >
                    Descargar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaGrupos;