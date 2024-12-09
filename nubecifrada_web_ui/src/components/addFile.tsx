import React, { useState } from "react";
import { FileInput, Label } from "flowbite-react";

interface TextFileUploaderProps {
  userUuid: string;
  groupUuid: string;
}

export function TextFileUploader({ userUuid, groupUuid }: TextFileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/plain") {
      setFile(selectedFile);
    } else {
      alert("Por favor, selecciona un archivo .txt válido.");
      setFile(null);
      event.target.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Por favor, selecciona un archivo primero.");
      return;
    }

    try {
      const key = await getKeyFromStorage();
      await encryptAndUploadFile(file, key, userUuid, groupUuid);
    } catch (error) {
      console.error("Error al cifrar y subir el archivo:", error);
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-center">
      <Label
        htmlFor="text-file-input"
        className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
      >
        <div className="flex flex-col items-center justify-center pb-6 pt-5">
          <svg
            className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Haz clic para subir</span> o arrastra un archivo
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Solo archivos .txt</p>
        </div>
        <FileInput
          id="text-file-input"
          className="hidden"
          onChange={handleFileChange}
          accept=".txt" // Permite solo archivos .txt
        />
      </Label>
      {file && (
        <div className="mt-4 text-lg text-gray-600">
          <p>Archivo seleccionado: {file.name}</p>
        </div>
      )}
      <button
        onClick={handleUpload}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        Subir archivo cifrado
      </button>
    </div>
  );
}

async function generateAndStoreKey() {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  const exportedKey = await crypto.subtle.exportKey("jwk", key);
  localStorage.setItem("encryptionKey", JSON.stringify(exportedKey));
}

async function getKeyFromStorage() {
  const keyData = localStorage.getItem("encryptionKey");
  if (!keyData) {
    await generateAndStoreKey();
    return getKeyFromStorage();
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

async function encryptAndUploadFile(file, key, userUuid, groupUuid) {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Generar un IV
  const fileBuffer = await file.arrayBuffer(); // Convertir el archivo a ArrayBuffer

  console.log("IV generado:", iv);
  
  // Cifrar el archivo
  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    fileBuffer
  );

  // Concatenar el IV y los datos cifrados
  const combinedData = new Uint8Array(iv.byteLength + encryptedContent.byteLength);
  combinedData.set(iv, 0); // IV primero
  combinedData.set(new Uint8Array(encryptedContent), iv.byteLength); // Datos cifrados después

  // Crear el FormData para la solicitud
  const formData = new FormData();
  formData.append("file", new Blob([combinedData]), file.name); // Enviar IV + datos cifrados como un solo archivo
  formData.append("nombre_archivo", file.name);
  formData.append("uuid_user", userUuid);
  formData.append("uuid_grupo", groupUuid);

  const token = localStorage.getItem("token"); // Obtener el token de autenticación

  const response = await fetch("http://localhost:8000/api/upload/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (response.ok) {
    console.log("Archivo cifrado subido correctamente");
  } else {
    console.error("Error al subir el archivo cifrado");
  }
}