import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { useCallback, useState } from "react";

import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";

import { useGraph } from "../../context/GraphContext";

import ContextMenu from "../ContextMenu";





const nodeTypes = {

    custom: CustomNode

};



const edgeTypes = {

    custom: CustomEdge

};








export default function GraphCanvas() {



    const {

        nodes,

        setNodes,

        edges,

        setEdges,

        setSelectedNode,

        deleteNode


    } = useGraph();







    const [menu, setMenu] = useState<any>(null);









    // MOVE NODES

    const onNodesChange = useCallback(

        (changes: any) => {


            setNodes((nodes) =>


                applyNodeChanges(

                    changes,

                    nodes

                )


            );


        },

        [
            setNodes
        ]

    );











    // EDGE CHANGES

    const onEdgesChange = useCallback(

        (changes: any) => {


            setEdges((edges) =>


                applyEdgeChanges(

                    changes,

                    edges

                )


            );


        },

        [
            setEdges
        ]

    );












    // CREATE RELATIONSHIP

    const onConnect = useCallback(

        (connection: any) => {


            const newEdge = {


                ...connection,


                id:

                    `${connection.source}-${connection.target}-${Date.now()}`,



                type: "custom",



                data: {


                    label: "Relationship"


                }


            };





            setEdges((edges) =>


                addEdge(

                    newEdge,

                    edges

                )


            );


        },

        [
            setEdges
        ]

    );












    // DRAG OVER

    const onDragOver = useCallback(

        (event: React.DragEvent) => {


            event.preventDefault();


            event.dataTransfer.dropEffect = "move";


        },

        []

    );












    // DROP NEW NODE

    const onDrop = useCallback(

        (event: React.DragEvent) => {


            event.preventDefault();





            const type =

                event.dataTransfer.getData(
                    "application/reactflow"
                );





            if (!type) return;







            const position = {


                x: event.clientX - 300,


                y: event.clientY - 100


            };







            const newNode = {


                id: `${Date.now()}`,



                position,



                data: {


                    label: `New ${type}`,


                    type: type,


                    description: "",


                    risk: "Low"


                },



                type: "custom"


            };








            setNodes((nodes) => [


                ...nodes,

                newNode


            ]);



        },

        [
            setNodes
        ]

    );












    return (



        <div


            className="graph-wrapper"


            onDrop={onDrop}


            onDragOver={onDragOver}



        >






            <ReactFlow



                nodes={nodes}



                edges={edges}




                nodeTypes={nodeTypes}



                edgeTypes={edgeTypes}





                onNodesChange={onNodesChange}



                onEdgesChange={onEdgesChange}





                onConnect={onConnect}






                onNodeClick={(event, node) => {


                    setSelectedNode(node);


                    setMenu(null);


                }}








                onNodeContextMenu={(event, node) => {


                    event.preventDefault();



                    setSelectedNode(node);




                    setMenu({

                        id: node.id,

                        x: event.clientX,

                        y: event.clientY

                    });



                }}






                fitView



            >





                <Background />


                <Controls />


                <MiniMap />





            </ReactFlow>









            {
                menu && (


                    <ContextMenu


                        x={menu.x}


                        y={menu.y}



                        onDelete={() => {


                            deleteNode(
                                menu.id
                            );


                            setMenu(null);


                        }}




                        onClose={() => {


                            setMenu(null);


                        }}


                    />


                )
            }






        </div>


    );

}