import { useState } from "react";

import Tabs from "../tabs/Tabs";

import PropertiesPanel from "../properties/PropertiesPanel";
import Timeline from "../timeline/Timeline";

import { useGraph } from "../../context/GraphContext";





export default function RightSidebar() {



    const [activeTab, setActiveTab] = useState(
        "properties"
    );




    const {

        nodes,

        selectedNode

    } = useGraph();







    const tabs = [



        {

            id: "properties",

            label: "Properties",

            icon: "⚙️",

            content:


                <PropertiesPanel


                    node={

                        nodes.find(

                            n =>

                                n.id === selectedNode?.id

                        )

                    }


                />


        },





        {

            id: "timeline",

            label: "Timeline",

            icon: "📅",

            content: <Timeline />


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