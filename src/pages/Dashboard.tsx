import { useState } from "react";

import Toolbox from "../components/toolbox/Toolbox";
import GraphCanvas from "../components/graph/GraphCanvas";
import PropertiesPanel from "../components/properties/PropertiesPanel";



const initialNodes = [

    {
        id: "1",

        position: {
            x: 100,
            y: 100
        },

        data: {
            label: "Fisteku",
            type: "Person"
        },

        type: "custom"
    },


    {
        id: "2",

        position: {
            x: 450,
            y: 250
        },

        data: {
            label: "BMW X5",
            type: "Vehicle"
        },

        type: "custom"
    }

];





export default function Dashboard() {



    const [nodes, setNodes] =
        useState<any[]>(initialNodes);




    const [selectedNode, setSelectedNode] =
        useState<any>(null);






    return (


        <div className="app">



            <div className="main">





                {/* LEFT SIDE */}

                <Toolbox />







                {/* GRAPH AREA */}

                <section className="canvas">


                    <GraphCanvas


                        nodes={nodes}


                        setNodes={setNodes}


                        setSelectedNode={setSelectedNode}


                    />


                </section>







                {/* RIGHT SIDE */}

                <PropertiesPanel

                    node={
                        nodes.find(
                            n => n.id === selectedNode?.id
                        )
                    }

                    setNodes={setNodes}

                />





            </div>




        </div>


    );

}