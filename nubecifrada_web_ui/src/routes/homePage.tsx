import TablaGrupos from "../components/tabla_grupo.tsx";
import TablaIntegrantesGrupo from "../components/tabla_integrantes_grupo.tsx";
import { Button } from 'flowbite-react';

const HomePage: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1">
        <div className="flex-1 flex flex-col ">
          <div className="flex flex-col">
            <div className="flex  -b p-4">
              <Button gradientDuoTone="purpleToPink" size="lg">Home</Button>
            </div>
            <div className="flex-1 flex justify-center items-center  ">
              <h2 className="text-6xl font-bold">Grupo los criptografos</h2>
            </div>
          </div>
          <div className="flex flex-1">
            <div className="flex-1 flex justify-center items-center  ">
              <Button gradientDuoTone="purpleToPink" size="xl">Añadir miembro al grupo</Button>
            </div>
            <div className="flex-1 flex justify-center items-center  ">
              <Button gradientDuoTone="purpleToPink" size="xl">Añadir archivo al grupo</Button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center  ">
        <h2 className="text-3xl font-bold">Integrantes:</h2>
        <TablaIntegrantesGrupo />
        </div>
      </div>
      <div className="flex-1 flex justify-center items-center  ">
        <TablaGrupos />
      </div>
    </div>
  );
};

export default HomePage;

git config --global user.email "tomirivasacuna@gmail.com"
git config --global user.name "Trivas2000"
ssh-keygen -t ed25519 -C "tomirivasacuna@gmail.com"

