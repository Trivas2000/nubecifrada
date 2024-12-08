import React, { useState } from 'react';
import { Modal, Button, TextInput } from 'flowbite-react';

interface ModalAñadirMiembroProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (nombre: string) => void;
}

const ModalAñadirMiembro: React.FC<ModalAñadirMiembroProps> = ({ isOpen, onClose, onAddMember }) => {
  const [nombre, setNombre] = useState('');

  const handleAddMember = () => {
    onAddMember(nombre);
    setNombre('');
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <Modal.Header>
        Añadir Miembro al Grupo
      </Modal.Header>
      <Modal.Body>
        <TextInput
          id="nombre"
          type="text"
          placeholder="Nombre del miembro"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button color="green" onClick={handleAddMember}>
          Añadir
        </Button>
        <Button color="red" onClick={onClose}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalAñadirMiembro;