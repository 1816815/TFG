import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./components/AppRoutes";
import AppInitializer from "./components/AppInitializer";

const App = () => {
  return (
    <AppInitializer>
      <Router>
        <Navbar />
        <AppRoutes />
      </Router>
    </AppInitializer>
  );
};

export default App;

