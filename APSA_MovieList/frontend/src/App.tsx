import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login, ListaFilmes, AdicionarFilme, EditarFilme } from './pages';
import { authService } from './services';

/**
 * Componente de rota protegida
 * Redireciona para login se usuário não estiver autenticado
 */
interface RotaProtegidaProps {
  children: React.ReactNode;
}

const RotaProtegida: React.FC<RotaProtegidaProps> = ({ children }) => {
  const estaAutenticado = authService.estaAutenticado();

  if (!estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/**
 * Componente principal da aplicação com roteamento
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/lista"
          element={
            <RotaProtegida>
              <ListaFilmes />
            </RotaProtegida>
          }
        />
        <Route
          path="/adicionar"
          element={
            <RotaProtegida>
              <AdicionarFilme />
            </RotaProtegida>
          }
        />
        <Route
          path="/editar/:id"
          element={
            <RotaProtegida>
              <EditarFilme />
            </RotaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

