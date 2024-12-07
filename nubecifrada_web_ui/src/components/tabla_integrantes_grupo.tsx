import React from 'react';
import { Button } from 'flowbite-react';

const TablaIntegrantesGrupo: React.FC = () => {
  const members = ["Yareli", "Pancho", "Tomás", "Bryan"];

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
          {members.map((member, index) => (
            <tr key={index}>
              <td className="px-4 py-2 whitespace-nowrap text-lg text-gray-500 border border-gray-300">
                {member}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-lg text-gray-500 border border-gray-300">
                <Button color="failure" size="sm">Eliminar del grupo</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaIntegrantesGrupo;