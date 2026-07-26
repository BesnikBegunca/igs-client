import Dashboard from "./pages/Dashboard";
import { GraphProvider } from "./context/GraphContext";

function App() {
  return (
    <GraphProvider>
      <Dashboard />
    </GraphProvider>
  );
}

export default App;