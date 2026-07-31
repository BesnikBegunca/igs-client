import {
    ReactFlow,
    Background,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    ConnectionMode
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import {
    useCallback,
    useEffect,
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

import {
    useMonitor
} from "../../context/MonitorContext";


const nodeTypes = {

    custom: CustomNode

};


const edgeTypes = {

    custom: CustomEdge

};


const getBestHandles = (
    sourceNode: any,
    targetNode: any
) => {

    const dx =
        targetNode.position.x -
        sourceNode.position.x;

    const dy =
        targetNode.position.y -
        sourceNode.position.y;


    if (Math.abs(dx) > Math.abs(dy)) {

        if (dx > 0) {

            return {
                sourceHandle: "right",
                targetHandle: "left"
            };

        }

        return {
            sourceHandle: "left",
            targetHandle: "right"
        };

    }


    if (dy > 0) {

        return {
            sourceHandle: "bottom",
            targetHandle: "top"
        };

    }


    return {
        sourceHandle: "top",
        targetHandle: "bottom"
    };

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

        searchTerm,

        registerEntity,
        findEntityByName

    } = useGraph();


    const {

        monitoredEntities

    } = useMonitor();


    const [menu, setMenu] =
        useState<any>(null);


    /*
    ============================================================
    MONITORING ALERT POPUP
    ============================================================
    */

    const [

        monitoringAlert,

        setMonitoringAlert

    ] = useState<any>(null);


    const {

        screenToFlowPosition,
        fitView,
        setCenter

    } = useReactFlow();


    /*
    ============================================================
    MONITORING
    ============================================================
    */

    useEffect(() => {

        if (!monitoredEntities.length) {

            return;

        }

        /*
        Monitoring state is available here
        and can be used when relationships
        are created.
        */

    }, [

        monitoredEntities

    ]);


    /*
    ============================================================
    SEARCH / FOCUS ENTITY
    ============================================================
    */

    useEffect(() => {

        if (!searchTerm.trim()) {

            fitView({

                duration: 500,

                padding: 0.2

            });

            return;

        }


        const search =

            searchTerm
                .trim()
                .toLowerCase();


        const node = nodes.find(

            (node: any) => {

                const label =

                    String(
                        node.data?.label ?? ""
                    ).toLowerCase();


                const type =

                    String(
                        node.data?.type ?? ""
                    ).toLowerCase();


                return (

                    label.includes(search) ||

                    type.includes(search)

                );

            }

        );


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


    /*
    ============================================================
    DELETE SELECTED EDGE
    ============================================================
    */

    useEffect(() => {

        const handleKey = (

            event: KeyboardEvent

        ) => {

            if (

                event.key !== "Delete"

            )

                return;


            if (selectedEdge) {

                deleteEdge(

                    selectedEdge.id

                );

                setSelectedEdge(

                    null

                );

            }

        };


        window.addEventListener(

            "keydown",

            handleKey

        );


        return () => {

            window.removeEventListener(

                "keydown",

                handleKey

            );

        };

    }, [

        selectedEdge,
        deleteEdge,
        setSelectedEdge

    ]);


    /*
    ============================================================
    NODE CHANGES
    ============================================================
    */

    const onNodesChange = useCallback(

        (changes: any) => {

            setNodes(currentNodes => {

                const updatedNodes =

                    applyNodeChanges(

                        changes,

                        currentNodes

                    );


                /*
                Update relationship handles
                automatically when nodes move.
                */

                setEdges(currentEdges => {

                    return currentEdges.map(edge => {

                        const sourceNode =

                            updatedNodes.find(

                                node =>
                                    node.id ===
                                    edge.source

                            );


                        const targetNode =

                            updatedNodes.find(

                                node =>
                                    node.id ===
                                    edge.target

                            );


                        if (

                            !sourceNode ||

                            !targetNode

                        ) {

                            return edge;

                        }


                        const handles =

                            getBestHandles(

                                sourceNode,

                                targetNode

                            );


                        return {

                            ...edge,

                            sourceHandle:
                                handles.sourceHandle,

                            targetHandle:
                                handles.targetHandle

                        };

                    });

                });


                return updatedNodes;

            });

        },

        [

            setNodes,
            setEdges

        ]

    );


    /*
    ============================================================
    EDGE CHANGES
    ============================================================
    */

    const onEdgesChange =

        useCallback(

            (changes: any) => {

                setEdges(

                    currentEdges =>

                        applyEdgeChanges(

                            changes,

                            currentEdges

                        )

                );

            },

            [

                setEdges

            ]

        );


    /*
    ============================================================
    CREATE RELATIONSHIP
    ============================================================
    */

    const onConnect =

        useCallback(

            (connection: any) => {

                if (

                    !connection.source ||

                    !connection.target

                ) {

                    return;

                }


                /*
                Prevent self connection
                */

                if (

                    connection.source ===

                    connection.target

                ) {

                    return;

                }


                /*
                Prevent duplicate connection
                */

                const alreadyExists =

                    edges.some(

                        (edge: any) =>

                            (

                                edge.source ===
                                connection.source &&

                                edge.target ===
                                connection.target

                            )

                            ||

                            (

                                edge.source ===
                                connection.target &&

                                edge.target ===
                                connection.source

                            )

                    );


                if (alreadyExists)

                    return;


                /*
                ====================================================
                FIND SOURCE / TARGET NODES
                ====================================================
                */

                const sourceNode =

                    nodes.find(

                        (node: any) =>

                            node.id ===
                            connection.source

                    );


                const targetNode =

                    nodes.find(

                        (node: any) =>

                            node.id ===
                            connection.target

                    );


                if (

                    !sourceNode ||

                    !targetNode

                ) {

                    return;

                }


                /*
                ====================================================
                MONITORING CHECK
                ====================================================
                */

                const sourceIsMonitored =

                    monitoredEntities.some(

                        (entity: any) => {

                            const monitoredId =

                                String(

                                    entity?.id ??

                                    entity?.data?.entityId ??

                                    entity?.data?.id ??

                                    ""

                                );


                            const nodeId =

                                String(

                                    sourceNode?.id ??

                                    ""

                                );


                            const entityId =

                                String(

                                    sourceNode?.data?.entityId ??

                                    ""

                                );


                            return (

                                monitoredId !== "" &&

                                (

                                    monitoredId ===
                                    nodeId ||

                                    monitoredId ===
                                    entityId

                                )

                            );

                        }

                    );


                const targetIsMonitored =

                    monitoredEntities.some(

                        (entity: any) => {

                            const monitoredId =

                                String(

                                    entity?.id ??

                                    entity?.data?.entityId ??

                                    entity?.data?.id ??

                                    ""

                                );


                            const nodeId =

                                String(

                                    targetNode?.id ??

                                    ""

                                );


                            const entityId =

                                String(

                                    targetNode?.data?.entityId ??

                                    ""

                                );


                            return (

                                monitoredId !== "" &&

                                (

                                    monitoredId ===
                                    nodeId ||

                                    monitoredId ===
                                    entityId

                                )

                            );

                        }

                    );


                /*
                ====================================================
                CREATE EDGE
                ====================================================
                */

                const newEdge = {

                    ...connection,

                    id:

                        `${connection.source} -${connection.target} -${Date.now()} `,

                    type:

                        "custom",

                    data: {

                        label:
                            "Relationship",

                        relationshipType:
                            "Related",

                        color:
                            "#94a3b8",

                        description:
                            "",

                        evidence:
                            "",

                        date:

                            new Date()
                                .toISOString()
                                .split("T")[0],

                        monitored:

                            sourceIsMonitored ||

                            targetIsMonitored

                    }

                };


                setEdges(

                    currentEdges =>

                        addEdge(

                            newEdge,

                            currentEdges

                        )

                );


                /*
                ====================================================
                RELATIONSHIP EVENT
                ====================================================
                */

                addEvent({

                    title:
                        "Relationship Created",

                    type:
                        "relationship",

                    description:

                        `New relationship created between ${sourceNode?.data?.label || connection.source} and ${targetNode?.data?.label || connection.target}`

                });


                /*
                ====================================================
                MONITORING ALERT
                ====================================================
                */

                if (

                    sourceIsMonitored ||

                    targetIsMonitored

                ) {

                    const monitoredNode =

                        sourceIsMonitored

                            ?

                            sourceNode

                            :

                            targetNode;


                    const connectedNode =

                        sourceIsMonitored

                            ?

                            targetNode

                            :

                            sourceNode;


                    const monitoredName =

                        monitoredNode?.data?.label ||

                        "Monitored Entity";


                    const connectedName =

                        connectedNode?.data?.label ||

                        "Unknown Entity";


                    /*
                    ====================================================
                    ADD MONITORING EVENT
                    ====================================================
                    */

                    addEvent({

                        title:
                            "MONITORING ALERT",

                        type:
                            "alert",

                        description:

                            `${monitoredName} is being monitored and a new relationship with ${connectedName} was detected.`

                    });


                    /*
                    ====================================================
                    SHOW RED POPUP
                    ====================================================
                    */

                    setMonitoringAlert({

                        monitoredName,

                        connectedName

                    });

                }

            },

            [

                edges,
                nodes,
                monitoredEntities,
                setEdges,
                addEvent

            ]

        );


    /*
    ============================================================
    DRAG OVER
    ============================================================
    */

    const onDragOver =

        useCallback(

            (event: React.DragEvent) => {

                event.preventDefault();

                event.stopPropagation();

                event.dataTransfer.dropEffect =
                    "copy";

            },

            []

        );


    /*
    ============================================================
    DROP ENTITY
    ============================================================
    */

    const onDrop =

        useCallback(

            (event: React.DragEvent) => {

                event.preventDefault();

                event.stopPropagation();


                const rawData =

                    event.dataTransfer.getData(

                        "application/reactflow"

                    );


                if (!rawData)

                    return;


                let entityData: any;


                try {

                    entityData =

                        JSON.parse(

                            rawData

                        );

                }

                catch {

                    entityData = {

                        name:
                            rawData,

                        type:
                            "Unknown",

                        icon:
                            "❓",

                        category:
                            "Unknown",

                        attributes:
                            {}

                    };

                }


                /*
                Normalize
                */

                const entityName =

                    String(

                        entityData.name ||

                        "Unknown Entity"

                    ).trim();


                const entityType =

                    String(

                        entityData.type ||

                        "Unknown"

                    ).trim();


                const entityCategory =

                    entityData.category ||

                    "Unknown";


                const entityIcon =

                    entityData.icon ||

                    "❓";


                /*
                Find registered entity
                */

                let masterEntity =

                    findEntityByName(

                        entityName

                    );


                /*
                Register if missing
                */

                if (!masterEntity) {

                    masterEntity =

                        registerEntity({

                            name:
                                entityName,

                            type:
                                entityType,

                            category:
                                entityCategory,

                            icon:
                                entityIcon,

                            attributes:

                                entityData.attributes ||

                                {}

                        });

                }


                if (!masterEntity)

                    return;


                /*
                Check duplicate node
                */

                const existingNode =

                    nodes.find(

                        (node: any) =>

                            String(

                                node.data?.entityId

                            ) ===

                            String(

                                masterEntity.id

                            )

                    );


                if (existingNode) {

                    setCenter(

                        existingNode.position.x,

                        existingNode.position.y,

                        {

                            zoom:
                                1.5,

                            duration:
                                500

                        }

                    );


                    setSelectedNode(

                        existingNode

                    );


                    addEvent({

                        title:
                            "Existing Entity Selected",

                        type:
                            "entity",

                        description:

                            `${masterEntity.name} already exists in the investigation graph`

                    });


                    return;

                }


                /*
                Calculate position
                */

                const position =

                    screenToFlowPosition({

                        x:
                            event.clientX,

                        y:
                            event.clientY

                    });


                /*
                Create node
                */

                const newNode = {

                    id:

                        `node - ${masterEntity.id} `,

                    position,

                    type:
                        "custom",

                    data: {

                        entityId:
                            masterEntity.id,

                        label:
                            masterEntity.name,

                        type:
                            masterEntity.type,

                        icon:
                            masterEntity.icon,

                        category:
                            masterEntity.category,

                        risk:

                            masterEntity.attributes
                                ?.risk ||

                            "Low",

                        description:

                            masterEntity.attributes
                                ?.description ||

                            "",

                        attachments:

                            masterEntity.attributes
                                ?.attachments ||

                            [],

                        details: {

                            ...masterEntity.attributes

                        },

                        entity:
                            masterEntity

                    }

                };


                /*
                Add node
                */

                setNodes(

                    currentNodes => [

                        ...currentNodes,

                        newNode

                    ]

                );


                /*
                Select
                */

                setSelectedNode(

                    newNode

                );


                /*
                Event
                */

                addEvent({

                    title:
                        "Entity Added",

                    type:
                        "entity",

                    description:

                        `${masterEntity.name} added to investigation`

                });

            },

            [

                findEntityByName,
                registerEntity,
                nodes,
                screenToFlowPosition,
                setNodes,
                setSelectedNode,
                setCenter,
                addEvent

            ]

        );


    /*
    ============================================================
    CANVAS
    ============================================================
    */

    return (

        <div

            className="graph-wrapper"

            onClick={(event) => {

                if (

                    event.target ===

                    event.currentTarget

                ) {

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

                /*
                Hide React Flow attribution
                */

                proOptions={{

                    hideAttribution:
                        true

                }}

                /*
                Allows source-to-source
                and target-to-target
                connections.
                */

                connectionMode={

                    ConnectionMode.Loose

                }

                nodesDraggable={true}

                nodesConnectable={true}

                elementsSelectable={true}

                edgesFocusable={true}

                onNodesChange={

                    onNodesChange

                }

                onEdgesChange={

                    onEdgesChange

                }

                onConnect={

                    onConnect

                }

                onDragOver={

                    onDragOver

                }

                onDrop={

                    onDrop

                }

                /*
                NODE CLICK
                */

                onNodeClick={

                    (_, node) => {

                        setSelectedNode(

                            node

                        );

                        setSelectedEdge(

                            null

                        );

                        setMenu(

                            null

                        );

                    }

                }

                /*
                EDGE CLICK
                */

                onEdgeClick={

                    (_, edge) => {

                        setSelectedEdge(

                            edge

                        );

                        setSelectedNode(

                            null

                        );

                        setMenu(

                            null

                        );

                    }

                }

                /*
                NODE RIGHT CLICK
                */

                onNodeContextMenu={

                    (event, node) => {

                        event.preventDefault();

                        setSelectedNode(

                            node

                        );

                        setMenu({

                            id:
                                node.id,

                            type:
                                "node",

                            x:
                                event.clientX,

                            y:
                                event.clientY

                        });

                    }

                }

                /*
                EDGE RIGHT CLICK
                */

                onEdgeContextMenu={

                    (event, edge) => {

                        event.preventDefault();

                        setSelectedEdge(

                            edge

                        );

                        setSelectedNode(

                            null

                        );

                        setMenu({

                            id:
                                edge.id,

                            type:
                                "edge",

                            x:
                                event.clientX,

                            y:
                                event.clientY

                        });

                    }

                }

                fitView

            >

                <Background />

            </ReactFlow>


            {

                menu && (

                    <ContextMenu

                        x={menu.x}

                        y={menu.y}

                        type={

                            menu.type ||

                            "node"

                        }

                        onDelete={() => {

                            if (

                                menu.type ===

                                "edge"

                            ) {

                                deleteEdge(

                                    menu.id

                                );

                                setSelectedEdge(

                                    null

                                );

                            }

                            else {

                                deleteNode(

                                    menu.id

                                );

                            }

                            setMenu(

                                null

                            );

                        }}

                        onClose={() => {

                            setMenu(

                                null

                            );

                        }}

                    />

                )

            }


            /*
            ========================================================
            MONITORING ALERT POPUP
            ========================================================
            */

            {

                monitoringAlert && (

                    <div

                        style={{

                            position:
                                "fixed",

                            top:
                                "24px",

                            right:
                                "24px",

                            width:
                                "380px",

                            background:
                                "#1a0b0b",

                            border:
                                "1px solid #ef4444",

                            borderLeft:
                                "5px solid #ef4444",

                            borderRadius:
                                "10px",

                            padding:
                                "18px",

                            zIndex:
                                99999,

                            boxShadow:
                                "0 10px 35px rgba(0,0,0,0.45)",

                            color:
                                "white"

                        }}

                    >

                        <div

                            style={{

                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "space-between",

                                marginBottom:
                                    "10px"

                            }}

                        >

                            <div

                                style={{

                                    color:
                                        "#ef4444",

                                    fontWeight:
                                        700,

                                    fontSize:
                                        "16px"

                                }}

                            >

                                🚨 MONITORING ALERT

                            </div>


                            <button

                                onClick={() =>

                                    setMonitoringAlert(

                                        null

                                    )

                                }

                                style={{

                                    background:
                                        "transparent",

                                    border:
                                        "none",

                                    color:
                                        "#94a3b8",

                                    fontSize:
                                        "20px",

                                    cursor:
                                        "pointer"

                                }}

                            >

                                ×

                            </button>

                        </div>


                        <div

                            style={{

                                fontSize:
                                    "14px",

                                lineHeight:
                                    "1.6",

                                color:
                                    "#e5e7eb"

                            }}

                        >

                            <strong>

                                {monitoringAlert.monitoredName}

                            </strong>

                            {" "}is currently being monitored.

                            <br />

                            A new relationship with

                            {" "}

                            <strong>

                                {monitoringAlert.connectedName}

                            </strong>

                            {" "}was detected.

                        </div>


                        <div

                            style={{

                                marginTop:
                                    "14px",

                                padding:
                                    "10px",

                                background:
                                    "rgba(239,68,68,0.10)",

                                border:
                                    "1px solid rgba(239,68,68,0.25)",

                                borderRadius:
                                    "6px",

                                color:
                                    "#fca5a5",

                                fontSize:
                                    "12px"

                            }}

                        >

                            New activity detected on a monitored entity.

                        </div>


                    </div>

                )

            }

        </div>

    );

}