import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import HealthDeclarationForm from "./pages/HealthDeclarationForm.tsx";
import HealthDeclarationTable from "./pages/HealthDeclarationTable.tsx";
import { ToastContainer } from 'react-toastify';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/health-declaration" replace />,
      },
      {
        path: "/health-declaration",
        element: <HealthDeclarationTable />,
      },
      {
        path: "/health-declaration-form",
        element: <HealthDeclarationForm />,
      },
    ],
  },
]);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
     <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
  </StrictMode>
);