import { Navigate } from "react-router-dom";
import { isCrmLoggedIn } from "../utils/auth.js";

export default function ProtectedRoute({ children }) {
  if (!isCrmLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
