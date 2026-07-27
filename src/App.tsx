import Dashboard from "./pages/Dashboard";

import { GraphProvider } from "./context/GraphContext";
import { CaseProvider } from "./context/CaseContext";


function App() {


  return (

    <CaseProvider>

      <GraphProvider>

        <Dashboard />

      </GraphProvider>

    </CaseProvider>

  );


}


export default App;