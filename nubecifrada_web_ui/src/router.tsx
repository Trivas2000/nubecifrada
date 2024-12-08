import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./routes/privateRoute";
import Login from "./routes/login";
import HomePage from "./routes/homePage";
import GroupPage from './routes/groupPage';


// Configurar todas la rutas que tendrá la aplicación
const router = (
    <Router>
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />

            <Route
                path="/main"
                element={
                    <PrivateRoute>
                        <HomePage />
                    </PrivateRoute>
                }
            />
            <Route
          path="/group/:id"
          element={
            <PrivateRoute>
              <GroupPage />
            </PrivateRoute>
          }
        />
        </Routes>
    </Router>
);
export default router;
