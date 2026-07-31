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

import {
    relationshipApi
} from "../../api/relationshipApi";


// ============================================================
// NODE TYPES
// ============================================================

const nodeTypes = {

    custom: CustomNode

};


// ============================================================
// EDGE TYPES
// ============================================================

const edgeTypes = {

    custom: CustomEdge

};


// ============================================================
// BEST HANDLES
// ============================================================

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


    if (
        Math.abs(dx) >
        Math.abs(dy)
    ) {

        if (dx > 0) {

            return {

                sourceHandle:
                    "right",

                targetHandle:
                    "left"

            };

        }


        return {

            sourceHandle:
                "left",

            targetHandle:
                "right"

        };

    }


    if (dy > 0) {

        return {

            sourceHandle:
                "bottom",

            targetHandle:
                "top"

        };

    }


    return {

        sourceHandle:
            "top",

        targetHandle:
            "bottom"

    };

};


// ============================================================
// GRAPH CANVAS
// ============================================================

export default function GraphCanvas() {


    // ========================================================
    // GRAPH CONTEXT
    // ========================================================

    const {

        nodes,

        setNodes,

        edges,

        setEdges,

        selectedNode,

        selectedEdge,

        setSelectedNode,

        setSelectedEdge,

        selectedCase,

        deleteNode,

        deleteEdge,

        addEvent,

        searchTerm,

        registerEntity,

        findEntityByName

    } = useGraph();


    // ========================================================
    // MONITOR CONTEXT
    // ========================================================

    const {

        monitoredEntities

    } = useMonitor();


    // ========================================================
    // CONTEXT MENU
    // ========================================================

    const [

        menu,

        setMenu

    ] = useState<any>(null);


    // ========================================================
    // MONITORING ALERT
    // ========================================================

    const [

        monitoringAlert,

        setMonitoringAlert

    ] = useState<any>(null);


    // ========================================================
    // REACT FLOW
    // ========================================================

    const {

        screenToFlowPosition,

        fitView,

        setCenter

    } = useReactFlow();


    // ========================================================
    // MONITORING EFFECT
    // ========================================================

    useEffect(() => {

        if (
            !monitoredEntities.length
        ) {

            return;

        }

    }, [

        monitoredEntities

    ]);


    // ========================================================
    // SEARCH / FOCUS ENTITY
    // ========================================================

    useEffect(() => {

        if (
            !searchTerm.trim()
        ) {

            fitView({

                duration:
                    500,

                padding:
                    0.2

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
                    )
                        .toLowerCase();


                const type =

                    String(
                        node.data?.type ?? ""
                    )
                        .toLowerCase();


                return (

                    label.includes(search) ||

                    type.includes(search)

                );

            }

        );


        if (
            !node
        ) {

            return;

        }


        setCenter(

            node.position.x,

            node.position.y,

            {

                zoom:
                    1.6,

                duration:
                    700

            }

        );

    }, [

        searchTerm,

        nodes,

        fitView,

        setCenter

    ]);


    // ========================================================
    // DELETE SELECTED EDGE WITH DELETE KEY
    // ========================================================

    useEffect(() => {

        const handleKey = (

            event: KeyboardEvent

        ) => {

            if (
                event.key !==
                "Delete"
            ) {

                return;

            }


            if (
                !selectedEdge
            ) {

                return;

            }


            void deleteEdge(

                String(
                    selectedEdge.id
                )

            );


            setSelectedEdge(
                null
            );

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


    // ========================================================
    // NODE CHANGES
    // ========================================================

    const onNodesChange = useCallback(

        (changes: any[]) => {

            setNodes(

                currentNodes => {

                    const updatedNodes =

                        applyNodeChanges(

                            changes,

                            currentNodes

                        );


                    /*
                    ------------------------------------------------
                    Automatically update edge handles when a node
                    moves around the canvas.
                    ------------------------------------------------
                    */

                    setEdges(

                        currentEdges => {

                            return currentEdges.map(

                                edge => {

                                    const sourceNode =

                                        updatedNodes.find(

                                            node =>

                                                String(
                                                    node.id
                                                ) ===
                                                String(
                                                    edge.source
                                                )

                                        );


                                    const targetNode =

                                        updatedNodes.find(

                                            node =>

                                                String(
                                                    node.id
                                                ) ===
                                                String(
                                                    edge.target
                                                )

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

                                }

                            );

                        }

                    );


                    return updatedNodes;

                }

            );

        },

        [

            setNodes,

            setEdges

        ]

    );


    // ========================================================
    // EDGE CHANGES
    // ========================================================

    const onEdgesChange = useCallback(

        (changes: any[]) => {

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


    // ========================================================
    // CREATE RELATIONSHIP
    // ========================================================

    const onConnect = useCallback(

        async (
            connection: any
        ) => {

            // ==================================================
            // ACTIVE CASE REQUIRED
            // ==================================================

            if (
                !selectedCase?.id
            ) {

                console.warn(
                    "Cannot create relationship without an active case."
                );

                return;

            }


            // ==================================================
            // VALID CONNECTION
            // ==================================================

            if (

                !connection.source ||

                !connection.target

            ) {

                return;

            }


            // ==================================================
            // PREVENT SELF CONNECTION
            // ==================================================

            if (

                String(
                    connection.source
                ) ===
                String(
                    connection.target
                )

            ) {

                return;

            }


            // ==================================================
            // PREVENT DUPLICATE RELATIONSHIP
            // ==================================================

            const alreadyExists =

                edges.some(

                    (edge: any) => {

                        const sameDirection =

                            String(
                                edge.source
                            ) ===
                            String(
                                connection.source
                            )

                            &&

                            String(
                                edge.target
                            ) ===
                            String(
                                connection.target
                            );


                        const oppositeDirection =

                            String(
                                edge.source
                            ) ===
                            String(
                                connection.target
                            )

                            &&

                            String(
                                edge.target
                            ) ===
                            String(
                                connection.source
                            );


                        return (

                            sameDirection ||

                            oppositeDirection

                        );

                    }

                );


            if (
                alreadyExists
            ) {

                return;

            }


            // ==================================================
            // FIND SOURCE NODE
            // ==================================================

            const sourceNode =

                nodes.find(

                    (node: any) =>

                        String(
                            node.id
                        ) ===
                        String(
                            connection.source
                        )

                );


            // ==================================================
            // FIND TARGET NODE
            // ==================================================

            const targetNode =

                nodes.find(

                    (node: any) =>

                        String(
                            node.id
                        ) ===
                        String(
                            connection.target
                        )

                );


            if (

                !sourceNode ||

                !targetNode

            ) {

                console.warn(
                    "Source or target node not found."
                );

                return;

            }


            // ==================================================
            // MASTER ENTITY IDS
            // ==================================================

            const sourceEntityId =

                sourceNode?.data?.entityId ??
                sourceNode?.data?.entity?.id ??
                sourceNode?.entityId ??
                null;


            const targetEntityId =

                targetNode?.data?.entityId ??
                targetNode?.data?.entity?.id ??
                targetNode?.entityId ??
                null;


            if (

                !sourceEntityId ||

                !targetEntityId

            ) {

                console.error(
                    "Cannot create relationship: source or target entity ID is missing."
                );

                return;

            }


            // ==================================================
            // MONITORING CHECK
            // ==================================================

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

                            monitoredId !== ""

                            &&

                            (

                                monitoredId ===
                                nodeId

                                ||

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

                            monitoredId !== ""

                            &&

                            (

                                monitoredId ===
                                nodeId

                                ||

                                monitoredId ===
                                entityId

                            )

                        );

                    }

                );


            // ==================================================
            // HANDLES
            // ==================================================

            const handles =

                getBestHandles(

                    sourceNode,

                    targetNode

                );


            // ==================================================
            // TEMPORARY EDGE ID
            // ==================================================

            const temporaryEdgeId =

                `edge-${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 8)}`;


            // ==================================================
            // DATE
            // ==================================================

            const relationshipDate =

                new Date()
                    .toISOString()
                    .split("T")[0];


            // ==================================================
            // OPTIMISTIC EDGE
            // ==================================================

            const optimisticEdge = {

                id:
                    temporaryEdgeId,

                source:
                    connection.source,

                target:
                    connection.target,

                sourceHandle:
                    connection.sourceHandle ??
                    handles.sourceHandle,

                targetHandle:
                    connection.targetHandle ??
                    handles.targetHandle,

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
                        relationshipDate,

                    monitored:
                        sourceIsMonitored ||
                        targetIsMonitored

                }

            };


            // ==================================================
            // SHOW EDGE IMMEDIATELY
            // ==================================================

            setEdges(

                currentEdges =>

                    addEdge(

                        optimisticEdge,

                        currentEdges

                    )

            );


            // ==================================================
            // SAVE RELATIONSHIP TO SQL SERVER
            // ==================================================

            try {

                const backendRelationship =

                    await relationshipApi.create({

                        caseId:
                            String(
                                selectedCase.id
                            ),

                        sourceEntityId:
                            String(
                                sourceEntityId
                            ),

                        targetEntityId:
                            String(
                                targetEntityId
                            ),

                        relationshipType:
                            "related",

                        description:
                            "",

                        evidence:
                            "",

                        date:
                            relationshipDate,

                        monitored:
                            sourceIsMonitored ||
                            targetIsMonitored

                    } as any);


                // ==================================================
                // BACKEND DID NOT RETURN RELATIONSHIP
                // ==================================================

                if (
                    !backendRelationship
                ) {

                    throw new Error(
                        "Relationship API returned no relationship."
                    );

                }


                // ==================================================
                // REPLACE TEMPORARY EDGE ID
                // WITH REAL SQL SERVER ID
                // ==================================================

                setEdges(

                    currentEdges =>

                        currentEdges.map(

                            edge =>

                                String(
                                    edge.id
                                ) ===
                                    String(
                                        temporaryEdgeId
                                    )

                                    ?

                                    {

                                        ...edge,

                                        id:
                                            String(
                                                backendRelationship.id
                                            ),

                                        data: {

                                            ...edge.data,

                                            relationshipId:
                                                backendRelationship.id,

                                            relationshipType:
                                                backendRelationship.relationshipType ??
                                                "related",

                                            description:
                                                backendRelationship.description ??
                                                "",

                                            evidence:
                                                backendRelationship.evidence ??
                                                "",

                                            date:
                                                backendRelationship.date ??
                                                relationshipDate,

                                            monitored:
                                                backendRelationship.monitored ??
                                                (
                                                    sourceIsMonitored ||
                                                    targetIsMonitored
                                                )

                                        }

                                    }

                                    :

                                    edge

                        )

                );


                // ==================================================
                // RELATIONSHIP CREATED EVENT
                // ==================================================

                await addEvent({

                    title:
                        "Relationship Created",

                    type:
                        "relationship",

                    description:

                        `New relationship created between ${sourceNode?.data?.label || sourceNode.id} and ${targetNode?.data?.label || targetNode.id}`,

                    date:
                        new Date().toISOString()

                });


                // ==================================================
                // MONITORING ALERT
                // ==================================================

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


                    // ==========================================
                    // ALERT EVENT
                    // ==========================================

                    await addEvent({

                        title:
                            "MONITORING ALERT",

                        type:
                            "alert",

                        description:

                            `${monitoredName} is being monitored and a new relationship with ${connectedName} was detected.`,

                        date:
                            new Date().toISOString()

                    });


                    // ==========================================
                    // POPUP
                    // ==========================================

                    setMonitoringAlert({

                        monitoredName,

                        connectedName

                    });

                }

            }
            catch (error) {

                console.error(

                    "Failed to create relationship in SQL Server:",

                    error

                );


                // ==================================================
                // REMOVE OPTIMISTIC EDGE
                // ==================================================

                setEdges(

                    currentEdges =>

                        currentEdges.filter(

                            edge =>

                                String(
                                    edge.id
                                ) !==
                                String(
                                    temporaryEdgeId
                                )

                        )

                );

            }

        },

        [

            selectedCase,

            edges,

            nodes,

            monitoredEntities,

            setEdges,

            addEvent

        ]

    );


    // ========================================================
    // DRAG OVER
    // ========================================================

    const onDragOver = useCallback(

        (
            event: React.DragEvent
        ) => {

            event.preventDefault();

            event.stopPropagation();

            event.dataTransfer.dropEffect =
                "copy";

        },

        []

    );


    // ========================================================
    // DROP ENTITY
    // ========================================================

    const onDrop = useCallback(

        async (
            event: React.DragEvent
        ) => {

            event.preventDefault();

            event.stopPropagation();


            // ==================================================
            // ACTIVE CASE REQUIRED
            // ==================================================

            if (
                !selectedCase?.id
            ) {

                console.warn(
                    "Cannot add entity without an active case."
                );

                return;

            }


            // ==================================================
            // READ DRAG DATA
            // ==================================================

            const rawData =

                event.dataTransfer.getData(

                    "application/reactflow"

                );


            if (
                !rawData
            ) {

                return;

            }


            let entityData: any;


            // ==================================================
            // PARSE ENTITY
            // ==================================================

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


            // ==================================================
            // NORMALIZE ENTITY
            // ==================================================

            const entityName =

                String(

                    entityData.name ||

                    "Unknown Entity"

                )
                    .trim();


            const entityType =

                String(

                    entityData.type ||

                    "Unknown"

                )
                    .trim();


            const entityCategory =

                String(

                    entityData.category ||

                    "Unknown"

                );


            const entityIcon =

                String(

                    entityData.icon ||

                    "❓"

                );


            // ==================================================
            // FIND EXISTING MASTER ENTITY
            // ==================================================

            let masterEntity: any = undefined;

            masterEntity =
                findEntityByName(entityName);

            if (!masterEntity) {

                masterEntity =
                    await registerEntity({

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


            // ==================================================
            // ENTITY CREATION FAILED
            // ==================================================

            if (
                !masterEntity?.id
            ) {

                console.error(
                    "Entity could not be created."
                );

                return;

            }


            // ==================================================
            // CHECK DUPLICATE NODE
            // ==================================================

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

            if (
                existingNode
            ) {

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


                await addEvent({

                    title:
                        "Existing Entity Selected",

                    type:
                        "entity",

                    description:

                        `${masterEntity.name} already exists in the investigation graph`,

                    date:
                        new Date().toISOString()

                });


                return;

            }


            // ==================================================
            // CALCULATE CANVAS POSITION
            // ==================================================

            const position =

                screenToFlowPosition({

                    x:
                        event.clientX,

                    y:
                        event.clientY

                });


            // ==================================================
            // ENTITY ATTRIBUTES
            // ==================================================

            const attributes =

                masterEntity.attributes ??
                {};


            // ==================================================
            // CREATE REACTFLOW NODE
            // ==================================================

            const newNode = {

                id:

                    `node-${masterEntity.id}`,

                position,

                type:
                    "custom",

                data: {

                    // ------------------------------------------
                    // MASTER ENTITY
                    // ------------------------------------------

                    entityId:
                        masterEntity.id,

                    entity:
                        masterEntity,


                    // ------------------------------------------
                    // DISPLAY
                    // ------------------------------------------

                    label:
                        masterEntity.name,

                    name:
                        masterEntity.name,

                    type:
                        masterEntity.type,

                    category:
                        masterEntity.category,

                    icon:
                        masterEntity.icon,


                    // ------------------------------------------
                    // DETAILS
                    // ------------------------------------------

                    risk:

                        attributes?.risk ??
                        "Low",

                    description:

                        attributes?.description ??
                        "",


                    attachments:

                        attributes?.attachments ??
                        [],


                    details: {

                        ...attributes

                    }

                }

            };


            // ==================================================
            // ADD NODE TO CANVAS
            // ==================================================

            setNodes(

                currentNodes => [

                    ...currentNodes,

                    newNode

                ]

            );


            // ==================================================
            // SELECT NODE
            // ==================================================

            setSelectedNode(

                newNode

            );


            // ==================================================
            // SAVE CASE ENTITY RELATIONSHIP
            // ==================================================
            /*
            The graph node is already saved as part of the case
            graph through saveCurrentCase().
            */


            // ==================================================
            // AUDIT EVENT
            // ==================================================

            await addEvent({

                title:
                    "Entity Added",

                type:
                    "entity",

                description:

                    `${masterEntity.name} added to investigation`,

                date:
                    new Date().toISOString()

            });

        },

        [

            selectedCase,

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


    // ========================================================
    // CANVAS
    // ========================================================

    return (

        <div

            className="graph-wrapper"

            onClick={(event) => {

                if (

                    event.target ===
                    event.currentTarget

                ) {

                    setMenu(
                        null
                    );

                    setSelectedEdge(
                        null
                    );

                    setSelectedNode(
                        null
                    );

                }

            }}

        >

            <ReactFlow

                // ==================================================
                // DATA
                // ==================================================

                nodes={
                    nodes
                }

                edges={
                    edges
                }


                // ==================================================
                // TYPES
                // ==================================================

                nodeTypes={
                    nodeTypes
                }

                edgeTypes={
                    edgeTypes
                }


                // ==================================================
                // OPTIONS
                // ==================================================

                proOptions={{

                    hideAttribution:
                        true

                }}


                connectionMode={

                    ConnectionMode.Loose

                }


                nodesDraggable={
                    true
                }

                nodesConnectable={
                    true
                }

                elementsSelectable={
                    true
                }

                edgesFocusable={
                    true
                }


                // ==================================================
                // CHANGES
                // ==================================================

                onNodesChange={

                    onNodesChange

                }

                onEdgesChange={

                    onEdgesChange

                }


                // ==================================================
                // CONNECT
                // ==================================================

                onConnect={

                    onConnect

                }


                // ==================================================
                // DROP
                // ==================================================

                onDragOver={

                    onDragOver

                }

                onDrop={

                    onDrop

                }


                // ==================================================
                // NODE CLICK
                // ==================================================

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


                // ==================================================
                // EDGE CLICK
                // ==================================================

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


                // ==================================================
                // NODE RIGHT CLICK
                // ==================================================

                onNodeContextMenu={

                    (
                        event,
                        node
                    ) => {

                        event.preventDefault();


                        setSelectedNode(
                            node
                        );


                        setSelectedEdge(
                            null
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


                // ==================================================
                // EDGE RIGHT CLICK
                // ==================================================

                onEdgeContextMenu={

                    (
                        event,
                        edge
                    ) => {

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


                // ==================================================
                // FIT VIEW
                // ==================================================

                fitView

            >

                <Background />

            </ReactFlow>


            {/* ====================================================
                CONTEXT MENU
            ==================================================== */}

            {

                menu && (

                    <ContextMenu

                        x={
                            menu.x
                        }

                        y={
                            menu.y
                        }

                        type={

                            menu.type ||

                            "node"

                        }


                        onDelete={async () => {

                            if (

                                menu.type ===
                                "edge"

                            ) {

                                await deleteEdge(

                                    String(
                                        menu.id
                                    )

                                );


                                setSelectedEdge(
                                    null
                                );

                            }

                            else {

                                await deleteNode(

                                    String(
                                        menu.id
                                    )

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


            {/* ====================================================
                MONITORING ALERT
            ==================================================== */}

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

                                {
                                    monitoringAlert.monitoredName
                                }

                            </strong>

                            {" "}is currently being monitored.

                            <br />

                            A new relationship with

                            {" "}

                            <strong>

                                {
                                    monitoringAlert.connectedName
                                }

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