import React, { useState } from 'react';
import { Modal, Button, TextInput } from 'flowbite-react';
import { Dropdown } from "flowbite-react";

interface User {
  uuid_user: string;
  username: string;
  first_name: string;
}

interface ModalAñadirMiembroProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (nombre: string) => void;
  allUsers: User[];
}

const ModalAñadirMiembro: React.FC<ModalAñadirMiembroProps> = ({ isOpen, onClose, onAddMember, allUsers }) => {
  const [nombre, setNombre] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleAddMember = () => {
    if (selectedUser) {
      onAddMember(selectedUser.uuid_user);
    }
  }

  return (
    <Modal show={isOpen} onClose={onClose}>
      <Modal.Header>
        Añadir Miembro al Grupo
      </Modal.Header>
      <Modal.Body>
        <Dropdown
          label={selectedUser?.username || "Selecciona un usuario"}
          inline={true}
        >
          {allUsers.map((user) => (
            <Dropdown.Item
              key={user.username}
              onClick={() => handleSelectUser(user)}
            >
              {user.username}
            </Dropdown.Item>
          ))}
        </Dropdown>
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
