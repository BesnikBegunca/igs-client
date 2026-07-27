import {
    useState
} from "react";


import Tabs from "../tabs/Tabs";


import PropertiesPanel from "../properties/PropertiesPanel";
import Timeline from "../timeline/Timeline";


import CasesPanel from "../cases/CasesPanel";


import {
    useGraph
} from "../../context/GraphContext";


import {
    useCases
} from "../../context/CaseContext";







export default function RightSidebar() {



    const [activeTab, setActiveTab] =

        useState("cases");







    const {

        nodes,

        selectedNode,

        selectedEdge

    } = useGraph();









    const {

        activeCase

    } = useCases();









    const selectedNodeData = nodes.find(

        n =>

            n.id === selectedNode?.id

    );









    const tabs = [







        {


            id: "cases",


            label: "Cases",


            icon: "📁",


            content:



                <>

                    {

                        activeCase &&



                        <div className="active-case">



                            <h4>

                                Active Case

                            </h4>




                            <strong>

                                {activeCase.title}

                            </strong>




                            <span>

                                Status: {activeCase.status}

                            </span>



                        </div>


                    }







                    <CasesPanel />



                </>




        },









        {


            id: "properties",


            label: "Properties",


            icon: "⚙️",


            content:



                <PropertiesPanel



                    node={selectedNodeData}



                    edge={selectedEdge}



                />



        },









        {


            id: "timeline",


            label: "Timeline",


            icon: "📅",


            content:

                <Timeline />



        }






    ];









    return (



        <aside className="right-sidebar">





            <Tabs



                tabs={tabs}



                activeTab={activeTab}



                setActiveTab={setActiveTab}



            />





        </aside>



    );



}