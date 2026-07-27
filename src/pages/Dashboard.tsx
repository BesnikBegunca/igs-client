import GraphCanvas from "../components/graph/GraphCanvas";

import DashboardLayout from "../components/layout/DashboardLayout";

import {
    ReactFlowProvider
} from "@xyflow/react";



export default function Dashboard() {


    return (


        <div className="app">


            <ReactFlowProvider>


                <DashboardLayout>


                    <GraphCanvas />


                </DashboardLayout>


            </ReactFlowProvider>



        </div>


    );

}