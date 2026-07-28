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
    useState,
    useEffect
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

        selectedNode,
        selectedEdge,

        setSelectedNode,
        setSelectedEdge,

        deleteNode,
        deleteEdge,

        addEvent,

        searchTerm

    } = useGraph();







    const [menu, setMenu] = useState<any>(null);





    const {

        screenToFlowPosition,

        fitView,

        setCenter

    } = useReactFlow();








    useEffect(() => {


        if (!searchTerm.trim()) {


            fitView({

                duration: 500,

                padding: 0.2

            });


            return;

        }




        const node = nodes.find(n => {


            return (

                n.data.label
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())

                ||

                n.data.type
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())

            );


        });




        if (!node)
            return;




        setCenter(

            node.position.x,

            node.position.y,

            {

                zoom: 1.6,

                duration: 700

            }

        );



    }, [

        searchTerm,

        nodes,

        fitView,

        setCenter

    ]);









    // DELETE SELECTED EDGE

    useEffect(() => {


        const handleKey = (e: KeyboardEvent) => {


            if (e.key !== "Delete")
                return;




            if (selectedEdge) {


                deleteEdge(selectedEdge.id);


                setSelectedEdge(null);


                return;

            }



        };



        window.addEventListener(
            "keydown",
            handleKey
        );



        return () =>


            window.removeEventListener(
                "keydown",
                handleKey
            );



    }, [

        selectedEdge,

        deleteEdge,

        setSelectedEdge

    ]);












    const onNodesChange = useCallback(

        (changes: any) => {


            setNodes(nodes =>


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









    const onEdgesChange = useCallback(

        (changes: any) => {


            setEdges(edges =>


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

                    date:

                        new Date()

                            .toISOString()

                            .split("T")[0]

                }


            };




            setEdges(edges =>


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

            setEdges,

            addEvent

        ]

    );












    const onDragOver = useCallback(

        (event: React.DragEvent) => {


            event.preventDefault();


            event.dataTransfer.dropEffect = "move";


        },

        []

    );












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

            setNodes,

            addEvent

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


                edgesFocusable={true}



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
                onEdgeContextMenu={(event, edge) => {


                    event.preventDefault();


                    setSelectedEdge(edge);


                    setSelectedNode(null);


                    setMenu({

                        id: edge.id,

                        type: "edge",

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


                        type={menu.type || "node"}


                        onDelete={() => {



                            if (menu.type === "edge") {


                                deleteEdge(menu.id);

                                setSelectedEdge(null);


                            }
                            else {


                                deleteNode(menu.id);


                            }




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