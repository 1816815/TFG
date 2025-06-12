import { useFlashRedirect } from "../hooks/useFlashRedirect";
import Navbar from "../components/Navbar";
import FlashMessage from "../components/FlashMessage";
import { Outlet } from "react-router-dom";

export const Layout = () => {
    useFlashRedirect();
   return (
    <>
      <Navbar />

        <FlashMessage />
        <Outlet />

    </>
  );
}

export default Layout
