import React from 'react';

interface DownloadFileProps {
  uuid_archivo: string;
  nombre_archivo: string;
}

const getKeyFromStorage = async (): Promise<CryptoKey> => {
  console.log("Buscando llave en localStorage...");
  const keyData = localStorage.getItem("encryptionKey");
  if (!keyData) {
    console.error("No se encontró la clave de desencriptación en el almacenamiento local");
    throw new Error("No se encontró la clave de desencriptación en el almacenamiento local");
  }
  console.log("Clave encontrada en localStorage:", keyData);

  try {
    const jwk = JSON.parse(keyData);
    console.log("Clave JWK parseada:", jwk);

    const cryptoKey = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );
    console.log("Clave importada como CryptoKey:", cryptoKey);
    return cryptoKey;
  } catch (error) {
    console.error("Error al importar la clave:", error);
    throw new Error("Error al importar la clave");
  }
};

const decryptFile = async (encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> => {
  try {
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encryptedData
    );
    return decryptedData;
  } catch (error) {
    console.error("Error al desencriptar los datos:", error);
    throw new Error("Error al desencriptar los datos");
  }
};

const descargarArchivo = async (uuid_archivo: string, nombre_archivo: string) => {
  try {
    const response = await fetch(`http://localhost:8000/api/archivos/${uuid_archivo}/download/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Si usas autenticación con token
      },
    });

    if (!response.ok) {
      throw new Error('Error al descargar el archivo');
    }

    const encryptedData = await response.arrayBuffer();
    console.log("Datos encriptados recibidos:", encryptedData);

    const key = await getKeyFromStorage(); // Obtener la clave de desencriptación

    // Asumimos que los primeros 12 bytes del encryptedData son el IV
    const iv = new Uint8Array(encryptedData.slice(0, 12));
    console.log("IV:", iv);
    const data = encryptedData.slice(12);

    const decryptedData = await decryptFile(data, key, iv);
    console.log("Datos desencriptados:", decryptedData);

    const blob = new Blob([decryptedData], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre_archivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al descargar y desencriptar el archivo:", error);
  }
};

const DownloadFile: React.FC<DownloadFileProps> = ({ uuid_archivo, nombre_archivo }) => {
  return (
    <button onClick={() => descargarArchivo(uuid_archivo, nombre_archivo)}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
      Descargar
    </button>
  );
};

export default DownloadFile;