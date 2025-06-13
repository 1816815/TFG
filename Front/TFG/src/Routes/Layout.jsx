import { useFlashRedirect } from "../hooks/useFlashRedirect";
import Navbar from "../components/Navbar";
import FlashMessage from "../components/FlashMessage";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";

export const Layout = () => {
    useFlashRedirect();
   return (
    <>
    <div id="root">

    
      <Navbar />

        <FlashMessage />
        <main className="main-content">
        <Outlet />
        </main>
        <Footer />
    </div>
    </>
  );
}

export default Layout
