import { useEffect } from "react";
import  useAuth  from "../hooks/useAuth";

const Logout = () => {
  const { doLogout } = useAuth();

  useEffect(() => {
    doLogout();
  }, [doLogout]);

  return null;
};

export default Logout;
