import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * Activate component handles account activation via token from email link.
 *
 * It extracts uid and token from URL params, calls the activation method,
 * and displays a success or error message.
 */
const Activate = () => {
  const { uid, token } = useParams();
  const { activateProfile } = useAuth();
  const [message, setMessage] = useState("Activando tu cuenta...");
  const navigate = useNavigate();

  useEffect(() => {
    const activate = async () => {
      try {
        await activateProfile(uid, token);
        setMessage("✅ Cuenta activada correctamente. Puedes iniciar sesión.");
        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        setMessage("❌ Error al activar la cuenta. El enlace puede estar expirado o ser inválido.");
      }
    };

    activate();
  }, [uid, token, activateProfile, navigate]);

  return (
    <div className="activation-message">
      <p>{message}</p>
    </div>
  );
};

export default Activate;
