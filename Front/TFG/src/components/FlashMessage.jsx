import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearFlashMessage } from "../Redux/slices/messageSlice";

const alertTypeClasses = {
  success: "alert alert-success",
  error: "alert alert-danger",
  warning: "alert alert-warning",
  info: "alert alert-info",
};

export default function FlashMessage({ duration = 3000 }) {
  const dispatch = useDispatch();
  const { message, type } = useSelector((state) => state.flashMessage);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        dispatch(clearFlashMessage());
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, dispatch, duration]);

  if (!message) return null;

  return (
<div
  className={`
    ${alertTypeClasses[type] || alertTypeClasses.info}
    alert alert-dismissible fade show
    position-fixed top-0 start-50 translate-middle-x
    mt-3 shadow
    z-1050
  `}
  role="alert"
  style={{ maxWidth: '90%', width: 'auto', opacity: 0.95 }}
>
  {message}
</div>

  );
}
