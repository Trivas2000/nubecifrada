import React from 'react';
import { Button } from 'flowbite-react';

interface TablaIntegrantesGrupoProps {
  integrantes: any[];
  uuidGrupo: string;
  handleDelete: () => void;
}


const TablaIntegrantesGrupo: React.FC <TablaIntegrantesGrupoProps> = ({ integrantes, uuidGrupo, handleDelete }) => {

  const eliminarIntegrante = async (uuidIntegrante: string) => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:8000/api/grupo/${uuidGrupo}/integrante/${uuidIntegrante}/eliminar/`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            alert('Integrante eliminado correctamente');
            handleDelete();
        } else {
            const errorData = await response.json();
            console.error('Error en la respuesta:', errorData);
            alert('Error al eliminar el integrante');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la solicitud');
    }
  };




  return (
    <div className="overflow-x-auto w-full md:w-3/4 lg:w-1/2 mx-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-2 text-left text-lg font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
              Nombre
            </th>
            <th scope="col" className="px-4 py-2 text-left text-lg font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
              Acción
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {integrantes.map((integrante, index) => (
            <tr key={index}>
              <td className="px-4 py-2 whitespace-nowrap text-lg text-gray-500 border border-gray-300">
                {integrante.username}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-lg text-gray-500 border border-gray-300">
                <Button color="failure" size="sm" onClick={() => eliminarIntegrante(integrante.uuid_user)} >Eliminar del grupo</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaIntegrantesGrupo;
