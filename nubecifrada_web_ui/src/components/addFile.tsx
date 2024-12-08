import React, { useState } from "react";
import { FileInput, Label } from "flowbite-react";

export function TextFileUploader() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/plain") {
      setFile(selectedFile);
      alert(`Archivo válido seleccionado: ${selectedFile.name}`);
    } else {
      alert("Por favor, selecciona un archivo .txt válido.");
      setFile(null);
      event.target.value = "";
    }
  };

  return (
    <div className="flex w-full items-center justify-center">
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
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
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
        <div className="mt-4 text-sm text-gray-600">
          <p>Archivo seleccionado: {file.name}</p>
        </div>
      )}
    </div>
  );
}
