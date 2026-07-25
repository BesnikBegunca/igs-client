import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { useCallback } from "react";

import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";



interface Props {

    setSelectedNode: (node: any) => void;
    setNodes: React.Dispatch<
        React.SetStateAction<any[]>
    >;

    nodes: any[];

}






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







const initialEdges = [

    {
        id: "e1-2",

        source: "1",

        target: "2",

        type: "custom",

        data: {
            label: "Owns"
        }

    }

];






const nodeTypes = {

    custom: CustomNode

};




const edgeTypes = {

    custom: CustomEdge

};









export default function GraphCanvas({

    nodes,

    setNodes,

    setSelectedNode

}: Props) {





    const [graphNodes, setGraphNodes, onNodesChange] =
        useNodesState(nodes);



    const [edges, setEdges, onEdgesChange] =

        useEdgesState(initialEdges);









    // krijon relationship të re

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









    // kur kalon node mbi canvas

    const onDragOver = useCallback(

        (event: React.DragEvent) => {


            event.preventDefault();


            event.dataTransfer.dropEffect = "move";


        },

        []

    );









    // krijon node nga toolbox

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


                id:
                    `${Date.now()}`,



                position,



                data: {


                    label: `New ${type}`,


                    type: type


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


                nodes={graphNodes}


                edges={edges}



                nodeTypes={nodeTypes}



                edgeTypes={edgeTypes}



                onNodesChange={onNodesChange}



                onEdgesChange={onEdgesChange}



                onConnect={onConnect}






                onNodeClick={(event, node) => {


                    setSelectedNode(node);



                }}



                fitView



            >




                <Background />



                <Controls />



                <MiniMap />



            </ReactFlow>





        </div>


    );

}