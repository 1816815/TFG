import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showFlashMessage } from "../Redux/slices/messageSlice";

export function useFlashRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const flash = location.state?.flashMessage;
    if (flash) {
      dispatch(showFlashMessage(flash));
      window.history.replaceState({}, document.title);
    }
  }, [location, dispatch]);

  // Función para redirigir con mensaje flash
  const navigateWithFlash = (path, message, type = "info") => {
    navigate(path, {
      state: {
        flashMessage: { message, type },
      },
    });
  };

  return { navigateWithFlash };
}
