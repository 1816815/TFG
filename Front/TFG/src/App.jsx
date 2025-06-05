import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./components/AppRoutes";
import AppInitializer from "./components/AppInitializer";

/**
 * The main component of the application, which wraps the app initialization
 * and routing logic.
 *
 * It initializes the app by fetching the user's data and setting up the
 * Redux store. Then, it renders the main router component, which holds the
 * navigation bar and the routes.
 */
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

