import React, { useState, useEffect } from 'react';
import DownloadFile from './downloadFile';

interface Archivo {
  uuid_archivo: string;
  nombre_archivo: string;
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
        setArchivos(data);
      } catch (error) {
        console.error("Error al obtener los archivos:", error);
      }
    };

    fetchArchivos();
  }, [groupUuid]);

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
                  <DownloadFile uuid_archivo={archivo.uuid_archivo} nombre_archivo={archivo.nombre_archivo} />
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