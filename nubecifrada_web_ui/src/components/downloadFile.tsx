import React from 'react';

interface DownloadFileProps {
  uuid_archivo: string;
  nombre_archivo: string;
  uuid_grupo: string;
}


const DownloadFile: React.FC<DownloadFileProps> = ({ uuid_archivo, nombre_archivo, uuid_grupo }) => {



  //---------------------------------Obtener infromacion del usuario en el grupo---------------------------------
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



//---------------------------------Desencriptar clave maestra y almacenarla---------------------------------
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


  // Desencriptar la clave maestra con la clave compartida
  async function decryptMasterKey(sharedKey: CryptoKey, encryptedData: Uint8Array): Promise<string> {
    // Extraer el IV del encryptedData
    const iv = encryptedData.slice(0, 12); // Los primeros 12 bytes son el IV
    const encryptedContent = encryptedData.slice(12); // El resto son los datos encriptados

    try {
      // Desencriptar los datos
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        sharedKey,
        encryptedContent
      );

      // Decodificar la clave maestra
      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('Error al desencriptar la clave maestra:', error);
      throw new Error('No se pudo desencriptar la clave maestra');
    }
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
        false,
        ['deriveKey']
      );

      const publicKey = await window.crypto.subtle.importKey(
        'raw',
        publicKeyArrayBuffer,
        {
          name: 'ECDH',
          namedCurve: 'P-256',
        },
        false,
        []
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




    // Obtener clave de almacenamiento local o desencriptar la maestra
    const getKeyFromStorage = async (): Promise<CryptoKey> => {
      const keyData = localStorage.getItem(`masterKey-${uuid_grupo}`);
      if (keyData) {
        const jwk = JSON.parse(keyData);
        return crypto.subtle.importKey("jwk", jwk, { name: "AES-GCM" }, false, ["decrypt"]);
      }

      const usuarioGrupoDetalles = await getUsuarioGrupoDetalles(uuid_grupo);
      const privateKeyBase64 = localStorage.getItem(`privateKey-${uuid_grupo}`);
      if (!usuarioGrupoDetalles.llave_maestra_cifrada || !privateKeyBase64) {
        throw new Error("No se pudo recuperar la clave necesaria.");
      }

      const privateKeyArrayBuffer = Uint8Array.from(atob(privateKeyBase64), (c) => c.charCodeAt(0));
      const publicKeyArrayBuffer = Uint8Array.from(atob(usuarioGrupoDetalles.llave_publica_invitador), (c) => c.charCodeAt(0));

      const sharedKey = await generateSharedKey(privateKeyArrayBuffer, publicKeyArrayBuffer);
      const masterKey = await decryptMasterKey(sharedKey, Uint8Array.from(atob(usuarioGrupoDetalles.llave_maestra_cifrada), (c) => c.charCodeAt(0)));

      const masterKeyJwk = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(masterKey),
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      localStorage.setItem(`encryptionKey-${uuid_grupo}`, JSON.stringify(masterKeyJwk));
      return masterKeyJwk;
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



  return (
    <button onClick={() => descargarArchivo(uuid_archivo, nombre_archivo)}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
      Descargar
    </button>
  );
};

export default DownloadFile;
