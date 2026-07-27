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

import {
    useCallback,
    useState
} from "react";


import {
    useReactFlow
} from "@xyflow/react";


import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";


import {
    useGraph
} from "../../context/GraphContext";


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


        setSelectedEdge,


        deleteNode,
        addEvent



    } = useGraph();









    const [menu, setMenu] = useState<any>(null);





    const {

        screenToFlowPosition

    } = useReactFlow();











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









    // MOVE / DELETE EDGES

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

    // CREATE RELATIONSHIP

    const onConnect = useCallback(

        (connection: any) => {


            const newEdge = {


                ...connection,


                id:

                    `${connection.source}-${connection.target}-${Date.now()}`,



                type: "custom",



                data: {

                    label: "Relationship",

                    relationshipType: "Related",

                    color: "#94a3b8",

                    description: "",

                    evidence: "",

                    date: new Date()
                        .toISOString()
                        .split("T")[0]

                }


            };





            setEdges((edges) =>

                addEdge(
                    newEdge,
                    edges
                )

            );


            addEvent({

                title: "Relationship Created",

                description:

                    `New relationship created between ${connection.source} and ${connection.target}`

            });



        },

        [

            setEdges

        ]

    );












    // DRAG OVER CANVAS

    const onDragOver = useCallback(

        (event: React.DragEvent) => {


            event.preventDefault();


            event.dataTransfer.dropEffect = "move";


        },

        []

    );













    // CREATE NEW NODE

    const onDrop = useCallback(

        (event: React.DragEvent) => {


            event.preventDefault();




            const rawData = event.dataTransfer.getData(

                "application/reactflow"

            );





            if (!rawData)

                return;






            let entity;






            try {


                entity = JSON.parse(rawData);


            }

            catch {


                entity = {


                    type: rawData,

                    name: rawData,

                    icon: "❓",

                    category: "Unknown"


                };


            }








            const position = screenToFlowPosition({


                x: event.clientX,


                y: event.clientY


            });









            const newNode = {



                id:

                    Date.now().toString(),




                position,




                type: "custom",




                data: {



                    label: entity.name,


                    type: entity.type,


                    icon: entity.icon,


                    category: entity.category,


                    risk: "Low",


                    description: "",
                    attachments: [],



                    details: {


                        gender: "",

                        role: "",

                        phone: "",

                        email: "",

                        address: "",

                        owner: "",

                        plate: "",

                        model: "",

                        color: "",

                        vin: ""


                    }



                }



            };








            setNodes(nodes => [


                ...nodes,


                newNode



            ]);
            addEvent({

                title: "Entity Created",

                description:

                    `${entity.name} added to investigation`

            });




        },

        [

            screenToFlowPosition,

            setNodes

        ]

    );














    return (




        <div




            className="graph-wrapper"




            onDrop={onDrop}




            onDragOver={onDragOver}




            onClick={(event) => {


                if (event.target === event.currentTarget) {


                    setMenu(null);


                    setSelectedEdge(null);


                    setSelectedNode(null);


                }


            }}





        >









            <ReactFlow




                nodes={nodes}

                edges={edges}

                nodeTypes={nodeTypes}

                edgeTypes={edgeTypes}


                nodesDraggable={true}

                nodesConnectable={true}

                elementsSelectable={true}


                onNodesChange={onNodesChange}

                onEdgesChange={onEdgesChange}

                onConnect={onConnect}








                onNodeClick={(event, node) => {



                    setSelectedNode(node);



                    setSelectedEdge(null);



                    setMenu(null);



                }}









                onEdgeClick={(event, edge) => {



                    setSelectedEdge(edge);



                    setSelectedNode(null);



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