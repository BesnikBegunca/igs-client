import GraphCanvas from "../components/graph/GraphCanvas";

import DashboardLayout from "../components/layout/DashboardLayout";

import {
    ReactFlowProvider
} from "@xyflow/react";



interface Props {

    onBack?: () => void;

}



export default function Dashboard({ onBack }: Props) {


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