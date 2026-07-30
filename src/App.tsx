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


import {
  MonitorProvider
} from "./context/MonitorContext";


import {
  AlertProvider
} from "./context/AlertContext";








function App() {



  const [page, setPage] = useState<
    "home" | "console"
  >("home");







  return (




    <AlertProvider>



      <MonitorProvider>



        <CaseProvider>



          <GraphProvider>




            {

              page === "home"


                ?


                <LandingPage

                  goConsole={() =>

                    setPage("console")

                  }

                />


                :


                <Dashboard />

            }




          </GraphProvider>



        </CaseProvider>



      </MonitorProvider>



    </AlertProvider>




  );



}



export default App;