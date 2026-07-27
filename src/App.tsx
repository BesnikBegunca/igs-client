import Dashboard from "./pages/Dashboard";

import { GraphProvider } from "./context/GraphContext";
import { CaseProvider } from "./context/CaseContext";


function App() {


  return (

    <GraphProvider>

      <CaseProvider>

        <Dashboard />

      </CaseProvider>

    </GraphProvider>

  );


}


export default App;