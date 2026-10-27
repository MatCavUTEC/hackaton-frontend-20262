import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import AuthProvider from "./context/AuthProvider";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import NewsPage from "./pages/NewsPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import SagasPage from "./pages/SagasPage";
import SagaStoryPage from "./pages/SagaStoryPage";
import WantedDetailPage from "./pages/WantedDetailPage";
import WantedPage from "./pages/WantedPage";

function App() {
  return (
    // useTransitions={false}: cada cambio de ruta se dibuja al instante.
    // Lo necesita la View Transition API para "fotografiar" la página nueva.
    <BrowserRouter useTransitions={false}>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas privadas: PrivateRoute decide si entras o vas al login */}
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/wanted" element={<WantedPage />}>
                {/* El detalle es hijo del listado: se dibuja encima de él */}
                <Route path=":id" element={<WantedDetailPage />} />
              </Route>
              {/* Grand Line: la API responde 423 hasta tener el Log Pose */}
              <Route path="/news" element={<NewsPage />}>
                <Route path=":id" element={<NewsDetailPage />} />
              </Route>
              <Route path="/sagas" element={<SagasPage />} />
              <Route path="/sagas/:id" element={<SagaStoryPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
