import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFlashRedirect } from "../hooks/useFlashRedirect";
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
  const { navigateWithFlash } = useFlashRedirect();
  const [message, setMessage] = useState("Activando tu cuenta...");
  const navigate = useNavigate();

  useEffect(() => {
    const activate = async () => {
      try {
        await activateProfile(uid, token);
        navigateWithFlash("/login", "Cuenta activada correctamente. Puedes iniciar sesión.");
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
