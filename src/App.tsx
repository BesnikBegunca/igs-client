import {
  useState
} from "react";


import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";


import {
  GraphProvider
} from "./context/GraphContext";

import {
  CaseProvider
} from "./context/CaseContext";




function App() {


  const [page, setPage] = useState<
    "home" | "console"
  >("home");




  return (


    <CaseProvider>


      <GraphProvider>


        {
          page === "home"

            ?

            <LandingPage
              goConsole={() => setPage("console")}
            />

            :

            <Dashboard />

        }


      </GraphProvider>


    </CaseProvider>


  );


}


export default App;