import { useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import useUser from "../hooks/useUser";
import { useFlashRedirect } from "../hooks/useFlashRedirect";

export const HomeVoter = () => {
  const user = useSelector((state) => state.user.user);
  const { updateUserProfile } = useUser();
  const { navigateWithFlash } = useFlashRedirect();

  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);

 useEffect(() => {
  if (showModal) {
    const modalElement = modalRef.current;
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();

    const handleModalHidden = () => {
      setShowModal(false);
    };

    modalElement.addEventListener("hidden.bs.modal", handleModalHidden);

    return () => {
      modalElement.removeEventListener("hidden.bs.modal", handleModalHidden);
    };
  }
}, [showModal]);


const handleSubmit = async () => {
  if (!user) return;

  const updatedUser = {
    ...user,
    role_id: 1,
  };

  try {
    const result = await updateUserProfile(updatedUser);

    // Cierra el modal manualmente
    const modalElement = modalRef.current;
    const modal = window.bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();

    // Espera un pequeño delay (el tiempo que Bootstrap necesita para cerrar)
    setTimeout(() => {
      // Limpieza manual del backdrop
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach((backdrop) => backdrop.remove());

      document.body.classList.remove('modal-open');
      document.body.style = ''; // limpia estilos en línea

      if (!result) {
        navigateWithFlash("/profile", "Error al actualizar el rol", "error");
      } else {
        navigateWithFlash(
          "/profile",
          "Rol actualizado correctamente",
          "success"
        );
      }
    }, 300); // tiempo típico de animación en Bootstrap
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    navigateWithFlash("/profile", "Error al actualizar el rol", "error");
  }
};



  return (
    <div className="container py-4">
      <div className="home-welcome mb-4">
        <h2>
          Bienvenido/a, <span>{user && user.username}</span>
        </h2>
        <p className="lead mb-0">
          ¡Nos alegra tenerte aquí! Participa y haz oír tu voz en nuestras
          encuestas.
        </p>
      </div>

      <section className="home-section">
        <h3 className="mb-2">Participa en encuestas</h3>
        <p>
          Puedes participar en las encuestas disponibles en la opción{" "}
          <strong>
            <a href="/encuestas">Encuestas</a>
          </strong>{" "}
          del menú. ¡Tu opinión es muy valiosa!
        </p>
      </section>

      <section className="home-section">
        <h4>¿Quieres diseñar tus propias encuestas?</h4>
        <p>
          Si deseas crear y gestionar tus propias encuestas, puedes solicitar la
          mejora a <strong>Cliente</strong>.
        </p>
        <button
          className="upgrade-btn btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          Solicitar upgrade a Cliente
        </button>
      </section>

      {/* Modal Bootstrap 5 */}
      <div
        className="modal fade"
        tabIndex="-1"
        ref={modalRef}
        aria-labelledby="upgradeModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="upgradeModalLabel">
                Confirmar solicitud
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  const modalElement = modalRef.current;
                  const modal =
                    window.bootstrap.Modal.getInstance(modalElement);
                  if (modal) modal.hide();
                }}
                aria-label="Cerrar"
              ></button>
            </div>
            <div className="modal-body">
              ¿Estás seguro que quieres solicitar el upgrade a Cliente?
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  const modalElement = modalRef.current;
                  const modal =
                    window.bootstrap.Modal.getInstance(modalElement);
                  if (modal) modal.hide();
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                Sí, confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeVoter;
