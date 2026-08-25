import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario, Rol } from '../types';
import { LocalDataService } from '../services/storage';

interface AuthContextType {
  currentUser: Usuario;
  currentRole: Rol | null;
  switchUser: (userId: string) => void;
  availableUsers: Usuario[];
  hasPermission: (moduleName: string, action: 'ver' | 'crear' | 'editar' | 'eliminar' | 'exportar') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const users = LocalDataService.getAll('usuarios');
  const roles = LocalDataService.getAll('roles');
  
  const defaultUser = users[0] || {
    id: 'usr-1',
    nombreUsuario: 'admin',
    nombreCompleto: 'Administrador del CDI',
    email: 'admin@cdisalud.gob',
    telefono: '+58 414-0001122',
    rolId: 'rol-1',
    rolNombre: 'Administrador',
    estado: 'Activo',
    fechaCreacion: '2025-01-01'
  };

  const [currentUser, setCurrentUser] = useState<Usuario>(defaultUser);
  const [currentRole, setCurrentRole] = useState<Rol | null>(() => {
    return roles.find((r) => r.id === defaultUser.rolId) || roles[0] || null;
  });

  const switchUser = (userId: string) => {
    const freshUsers = LocalDataService.getAll('usuarios');
    const freshRoles = LocalDataService.getAll('roles');
    const target = freshUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      const role = freshRoles.find((r) => r.id === target.rolId) || null;
      setCurrentRole(role);
    }
  };

  const hasPermission = (moduleName: string, action: 'ver' | 'crear' | 'editar' | 'eliminar' | 'exportar'): boolean => {
    if (!currentRole || !currentRole.permisos) return true; // Default allow if unrestricted
    const modulePerms = (currentRole.permisos as any)[moduleName];
    if (!modulePerms) return true;
    return Boolean(modulePerms[action]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        switchUser,
        availableUsers: users,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
