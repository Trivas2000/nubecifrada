import React from 'react';

const TablaGrupos: React.FC = () => {
  return (
    <div className="overflow-x-auto w-full md:w-3/4 lg:w-3/4 mx-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="w-1/4 px-4 py-2 text-left text-lg font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
              Nombre
            </th>
            <th scope="col" className="w-1/4 px-4 py-2 text-left text-lg font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
              Subido por
            </th>
            <th scope="col" className="w-1/4 px-4 py-2 text-left text-lg font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
              Tamaño
            </th>
            <th scope="col" className="w-1/4 px-4 py-2 text-left text-lg font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
              Descargar
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: 4 }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: 4 }).map((_, colIndex) => (
                <td key={colIndex} className="w-1/4 px-4 py-2 whitespace-nowrap text-lg text-gray-500 border border-gray-300">
                  Row {rowIndex + 1}, Col {colIndex + 1}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaGrupos;