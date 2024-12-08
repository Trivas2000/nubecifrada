import React from "react";
import { Modal, Button } from "flowbite-react";
import TablaIntegrantesGrupo from "./tabla_integrantes_grupo";

interface ModalIntegrantesGrupoProps {
  isOpen: boolean;
  onClose: () => void;
  integrantes: any[];
  uuidGrupo: string;
  handleDelete: () => void;
}

const ModalIntegrantesGrupo: React.FC<ModalIntegrantesGrupoProps> = ({
  isOpen,
  onClose,
  integrantes,
  uuidGrupo,
  handleDelete,
}) => {
  return (
    <Modal show={isOpen} onClose={onClose} size="5xl">
      <Modal.Header>
        <h2 className="text-2xl font-bold">Integrantes del Grupo</h2>
      </Modal.Header>
      <Modal.Body>
        <TablaIntegrantesGrupo
          integrantes={integrantes}
          uuidGrupo={uuidGrupo}
          handleDelete={handleDelete}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button gradientDuoTone="purpleToPink" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalIntegrantesGrupo;
