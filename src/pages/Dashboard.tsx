import GraphCanvas from "../components/graph/GraphCanvas";

import SaveLoad from "../components/common/SaveLoad";

import CaseHeader from "../components/cases/CaseHeader";

import DashboardLayout from "../components/layout/DashboardLayout";




export default function Dashboard() {



    return (



        <div className="app">



            <SaveLoad />





            <DashboardLayout>



                <CaseHeader />



                <GraphCanvas />



            </DashboardLayout>



        </div>


    );

}