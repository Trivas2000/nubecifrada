import { useState } from "react";
import axios from "axios";

interface CreateGroupProps {
  onGroupCreated: () => void; // Callback para actualizar la lista de grupos
}

const CreateGroup: React.FC<CreateGroupProps> = ({ onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [response, setResponse] = useState<any | null>(null);

  const createGroup = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Usuario no autenticado.");
        return;
      }
  
      // Realizar la solicitud usando Fetch API
      const res = await fetch("http://localhost:8000/api/create-group/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: groupName }),
      });
  
      // Verificar si la respuesta es exitosa
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al crear el grupo.");
      }
  
      const data = await res.json();
      setResponse(data);
  
      // Descargar la clave privada del grupo para guardarla localmente
      const blob = new Blob([data.public_key], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "group_public_key.txt";
      a.click();
      URL.revokeObjectURL(url);
  
      // Actualizar la lista de grupos
      onGroupCreated();
    } catch (error: any) {
      console.error("Error al crear el grupo:", error.message);
      alert(`Error al crear el grupo: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Crear Grupo</h2>
      <input
        type="text"
        className="border p-2 w-full mb-4"
        placeholder="Nombre del Grupo"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={createGroup}
      >
        Crear Grupo
      </button>
      {response && (
        <div className="mt-4">
          <p className="text-green-600 font-semibold">
            {response.message || "Grupo creado exitosamente"}
          </p>
          <p>
            <strong>ID del Grupo:</strong> {response.group_id}
          </p>
          <p>
            <strong>Clave Pública:</strong>
          </p>
          <textarea
            className="block w-full border p-2 mt-2"
            rows={3}
            value={response.public_key}
            readOnly
          />
        </div>
      )}
    </div>
  );
};

export default CreateGroup;