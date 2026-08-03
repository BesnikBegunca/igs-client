import {
    FiX
} from "react-icons/fi";

import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BaseEdge,
    getBezierPath,
    Position,
    type Node,
    type Edge,
    type EdgeProps
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";



interface Props {

    entity: any;

    nodes: any[];

    edges: any[];

    onClose: () => void;

    onSelectEntity: (entity: any) => void;

}



// ============================================================
// RELATIONSHIP COLORS
// ============================================================

const relationshipColors: Record<string, string> = {

    Related:
        "#94a3b8",

    Owner:
        "#22c55e",

    Owns:
        "#22c55e",

    Friend:
        "#3b82f6",

    Family:
        "#f97316",

    "Works For":
        "#a855f7",

    Suspect:
        "#ef4444",

    Witness:
        "#eab308",

    Partner:
        "#ec4899",

    "Located At":
        "#06b6d4",

    Driver:
        "#14b8a6"

};



const getRelationshipColor = (
    relationship: string
) => {

    return (

        relationshipColors[relationship] ||

        "#94a3b8"

    );

};



// ============================================================
// CUSTOM EDGE
//
// Uses ReactFlow's native Bezier path.
// No forced curve.
// No relationship label.
// Relationship is displayed ONLY in the small
// relationship container.
// ============================================================

function EntityGraphEdge({

    id,

    sourceX,

    sourceY,

    targetX,

    targetY,

    sourcePosition,

    targetPosition,

    data

}: EdgeProps) {

    const relationship =

        String(

            data?.relationshipType ??

            "Related"

        );



    const color =

        getRelationshipColor(

            relationship

        );



    /*
     * ReactFlow calculates the natural Bezier
     * connection depending on the position
     * of the source and target.
     *
     * This means:
     *
     * Bottom -> Top
     * Right  -> Left
     * Top    -> Bottom
     * Left   -> Right
     *
     * all behave naturally.
     */

    const [

        path

    ] = getBezierPath({

        sourceX,

        sourceY,

        sourcePosition,

        targetX,

        targetY,

        targetPosition,

        curvature:
            0.25

    });



    return (

        <BaseEdge

            id={id}

            path={path}

            style={{

                stroke:
                    color,

                strokeWidth:
                    2.2,

                opacity:
                    0.9

            }}

        />

    );

}



// ============================================================
// ENTITY GRAPH
// ============================================================

export default function EntityGraph({

    entity,

    nodes,

    edges,

    onClose,

    onSelectEntity

}: Props) {



    // ========================================================
    // MAIN ENTITY
    // ========================================================

    const mainName = String(

        entity?.data?.label ??

        entity?.data?.name ??

        entity?.label ??

        entity?.name ??

        ""

    )
        .trim()
        .toLowerCase();



    const mainType = String(

        entity?.data?.type ??

        entity?.data?.entityType ??

        entity?.type ??

        ""

    )
        .trim()
        .toLowerCase();



    const mainEntityId = String(

        entity?.id ??

        entity?.data?.id ??

        ""

    );



    // ========================================================
    // NODE HELPERS
    // ========================================================

    const getNodeName = (
        node: any
    ) =>

        String(

            node?.data?.label ??

            node?.data?.name ??

            node?.label ??

            node?.name ??

            ""

        )
            .trim()
            .toLowerCase();



    const getNodeType = (
        node: any
    ) =>

        String(

            node?.data?.type ??

            node?.data?.entityType ??

            node?.type ??

            ""

        )
            .trim()
            .toLowerCase();



    const isSameEntity = (
        node: any
    ) => {

        if (!node) {

            return false;

        }



        const nodeId = String(

            node.id ??

            node.data?.id ??

            ""

        );



        if (

            mainEntityId &&

            nodeId === mainEntityId

        ) {

            return true;

        }



        const nodeName =
            getNodeName(node);



        const nodeType =
            getNodeType(node);



        if (

            !mainName ||

            !nodeName

        ) {

            return false;

        }



        if (

            nodeName !== mainName

        ) {

            return false;

        }



        if (

            mainType &&

            nodeType

        ) {

            return (

                nodeType === mainType

            );

        }



        return true;

    };



    // ========================================================
    // FIND MAIN ENTITY INSTANCES
    // ========================================================

    const entityNodes =

        nodes.filter(

            (node: any) =>

                isSameEntity(node)

        );



    const entityIds =

        new Set<string>(

            entityNodes.map(

                (node: any) =>

                    String(node.id)

            )

        );



    if (mainEntityId) {

        entityIds.add(
            mainEntityId
        );

    }



    // ========================================================
    // CONNECTED EDGES
    // ========================================================

    const graphEdges =

        edges.filter(

            (edge: any) => {

                const source =
                    String(edge.source);



                const target =
                    String(edge.target);



                return (

                    entityIds.has(source) ||

                    entityIds.has(target)

                );

            }

        );



    // ========================================================
    // COLLECT NODE IDS
    // ========================================================

    const nodeIds =
        new Set<string>();



    entityNodes.forEach(

        (node: any) => {

            nodeIds.add(

                String(node.id)

            );

        }

    );



    graphEdges.forEach(

        (edge: any) => {

            nodeIds.add(

                String(edge.source)

            );



            nodeIds.add(

                String(edge.target)

            );

        }

    );



    // ========================================================
    // RAW GRAPH NODES
    // ========================================================

    const rawGraphNodes =

        nodes.filter(

            (node: any) =>

                nodeIds.has(

                    String(node.id)

                )

        );



    // ========================================================
    // REMOVE DUPLICATES
    // ========================================================

    const visualNodeMap =
        new Map<string, any>();



    rawGraphNodes.forEach(

        (node: any) => {

            const nodeName =
                getNodeName(node);



            const nodeType =
                getNodeType(node);



            const key =

                isSameEntity(node)

                    ? "__MAIN_ENTITY__"

                    : `${nodeName}::${nodeType}`;



            if (

                !visualNodeMap.has(key)

            ) {

                visualNodeMap.set(

                    key,

                    node

                );

            }

        }

    );



    const uniqueGraphNodes =

        Array.from(

            visualNodeMap.values()

        );



    // ========================================================
    // MAP ORIGINAL IDS -> VISUAL IDS
    // ========================================================

    const originalToVisualId =

        new Map<string, string>();



    uniqueGraphNodes.forEach(

        (node: any) => {

            const nodeName =
                getNodeName(node);



            const nodeType =
                getNodeType(node);



            const key =

                isSameEntity(node)

                    ? "__MAIN_ENTITY__"

                    : `${nodeName}::${nodeType}`;



            const visualNode =

                visualNodeMap.get(key);



            if (!visualNode) {

                return;

            }



            rawGraphNodes

                .filter(

                    (rawNode: any) => {

                        if (

                            isSameEntity(rawNode) &&

                            isSameEntity(node)

                        ) {

                            return true;

                        }



                        return (

                            getNodeName(rawNode) ===
                            nodeName &&

                            getNodeType(rawNode) ===
                            nodeType

                        );

                    }

                )

                .forEach(

                    (rawNode: any) => {

                        originalToVisualId.set(

                            String(

                                rawNode.id

                            ),

                            String(

                                visualNode.id

                            )

                        );

                    }

                );

        }

    );



    // ========================================================
    // NORMALIZE RELATIONSHIPS
    // ========================================================

    const normalizedEdges =

        graphEdges

            .map(

                (edge: any) => {

                    const source =

                        originalToVisualId.get(

                            String(

                                edge.source

                            )

                        );



                    const target =

                        originalToVisualId.get(

                            String(

                                edge.target

                            )

                        );



                    if (

                        !source ||

                        !target ||

                        source === target

                    ) {

                        return null;

                    }



                    const relationship =

                        String(

                            edge.data
                                ?.relationshipType ??

                            "Related"

                        )
                            .trim() ||

                        "Related";



                    return {

                        ...edge,

                        source,

                        target,

                        relationship

                    };

                }

            )

            .filter(

                (

                    edge

                ): edge is NonNullable<typeof edge> =>

                    edge !== null

            );



    // ========================================================
    // MAIN NODE
    // ========================================================

    const mainGraphNode =

        uniqueGraphNodes.find(

            (node: any) =>

                isSameEntity(node)

        );



    if (!mainGraphNode) {

        return null;

    }



    const mainVisualId =
        String(mainGraphNode.id);



    // ========================================================
    // GROUP DIRECT RELATIONSHIPS
    //
    // MAIN
    //   |
    //   +--- Family
    //   |      |
    //   |      +--- Person A
    //   |      +--- Person B
    //   |
    //   +--- Works For
    //          |
    //          +--- Police
    //
    // Each relationship appears ONLY ONCE.
    // ========================================================

    const relationshipGroups =

        new Map<string, {

            relationship: string;

            color: string;

            entities: any[];

            edges: any[];

        }>();



    normalizedEdges.forEach(

        (edge: any) => {

            let otherId = "";



            if (

                edge.source ===
                mainVisualId

            ) {

                otherId =
                    edge.target;

            }

            else if (

                edge.target ===
                mainVisualId

            ) {

                otherId =
                    edge.source;

            }

            else {

                return;

            }



            const relationship =
                edge.relationship;



            if (

                !relationshipGroups.has(

                    relationship

                )

            ) {

                relationshipGroups.set(

                    relationship,

                    {

                        relationship,

                        color:
                            getRelationshipColor(

                                relationship

                            ),

                        entities: [],

                        edges: []

                    }

                );

            }



            const group =

                relationshipGroups.get(

                    relationship

                )!;



            const entityNode =

                uniqueGraphNodes.find(

                    (node: any) =>

                        String(node.id) ===
                        String(otherId)

                );



            if (

                entityNode &&

                !group.entities.some(

                    (node: any) =>

                        String(node.id) ===
                        String(entityNode.id)

                )

            ) {

                group.entities.push(

                    entityNode

                );

            }



            group.edges.push(edge);

        }

    );



    // ========================================================
    // GRAPH DIMENSIONS
    // ========================================================

    const graphWidth =
        3000;



    const nodeWidth =
        180;



    const nodeHeight =
        78;



    // Small relationship title
    const relationshipWidth =
        120;



    const relationshipHeight =
        34;



    const horizontalGap =
        70;



    const mainY =
        70;



    const relationshipY =
        230;



    const entityY =
        380;



    const centerX =
        graphWidth / 2;



    // ========================================================
    // GROUP ARRAY
    // ========================================================

    const groups =

        Array.from(

            relationshipGroups.values()

        );



    // ========================================================
    // CALCULATE GROUP WIDTH
    // ========================================================

    const getGroupWidth = (

        group: {
            entities: any[];
        }

    ) => {

        const count =
            Math.max(

                1,

                group.entities.length

            );



        return Math.max(

            relationshipWidth + 80,

            count *
            nodeWidth +

            (
                count - 1
            ) *
            horizontalGap

        );

    };



    const totalGroupsWidth =

        groups.reduce(

            (sum, group) =>

                sum +

                getGroupWidth(group),

            0

        ) +

        Math.max(

            0,

            groups.length - 1

        ) *

        90;



    let groupCursor =

        centerX -

        totalGroupsWidth / 2;



    // ========================================================
    // NODE LIST
    // ========================================================

    const graphNodes: Node[] = [];



    // ========================================================
    // MAIN NODE
    // ========================================================

    graphNodes.push({

        id:
            mainVisualId,

        type:
            "default",

        position: {

            x:
                centerX -

                nodeWidth / 2,

            y:
                mainY

        },

        sourcePosition:
            Position.Bottom,

        targetPosition:
            Position.Top,

        data: {

            label:

                `${

                    mainGraphNode.data?.icon ||

                    "❓"

                } ${

                    mainGraphNode.data?.label ||

                    mainGraphNode.data?.name ||

                    "Unknown"

                }`,

            original:
                mainGraphNode.data

        },

        style: {

            width:
                nodeWidth,

            minHeight:
                nodeHeight,

            background:
                "#2563eb",

            color:
                "#ffffff",

            border:
                "2px solid #60a5fa",

            borderRadius:
                14,

            padding:
                15,

            textAlign:
                "center",

            fontWeight:
                700,

            boxShadow:
                "0 12px 35px rgba(37,99,235,0.32)"

        }

    });



    // ========================================================
    // RELATIONSHIP NODES
    // ========================================================

    const relationshipNodes: {

        id: string;

        relationship: string;

        color: string;

        x: number;

        y: number;

        width: number;

    }[] = [];



    const entityPositions =

        new Map<string, {

            x: number;

            y: number;

        }>();



    // ========================================================
    // POSITION GROUPS
    // ========================================================

    groups.forEach(

        (group, groupIndex) => {

            const width =
                getGroupWidth(group);



            const groupCenter =

                groupCursor +

                width / 2;



            const relationshipNodeId =

                `relationship-${

                    groupIndex

                }-${

                    group.relationship

                }`;



            relationshipNodes.push({

                id:
                    relationshipNodeId,

                relationship:
                    group.relationship,

                color:
                    group.color,

                x:
                    groupCenter -

                    relationshipWidth / 2,

                y:
                    relationshipY,

                width

            });



            // ==================================================
            // ENTITIES UNDER RELATIONSHIP
            // ==================================================

            const count =
                group.entities.length;



            const entitiesWidth =

                count *
                nodeWidth +

                Math.max(

                    0,

                    count - 1

                ) *
                horizontalGap;



            const entityStartX =

                groupCenter -

                entitiesWidth / 2;



            group.entities.forEach(

                (

                    entityNode: any,

                    entityIndex: number

                ) => {

                    const entityId =
                        String(entityNode.id);



                    const x =

                        entityStartX +

                        entityIndex *

                        (

                            nodeWidth +

                            horizontalGap

                        );



                    entityPositions.set(

                        entityId,

                        {

                            x,

                            y:
                                entityY

                        }

                    );

                }

            );



            groupCursor +=

                width + 90;

        }

    );



    // ========================================================
    // CREATE RELATIONSHIP CONTAINERS
    //
    // Relationship text appears ONLY HERE.
    // ========================================================

    relationshipNodes.forEach(

        (relationshipNode) => {

            graphNodes.push({

                id:
                    relationshipNode.id,

                type:
                    "default",

                position: {

                    x:
                        relationshipNode.x,

                    y:
                        relationshipNode.y

                },

                sourcePosition:
                    Position.Bottom,

                targetPosition:
                    Position.Top,

                data: {

                    label:
                        relationshipNode.relationship,

                    relationship:
                        true,

                    color:
                        relationshipNode.color

                },

                style: {

                    width:
                        relationshipWidth,

                    height:
                        relationshipHeight,

                    minHeight:
                        relationshipHeight,

                    background:
                        `${

                            relationshipNode.color

                        }18`,

                    color:
                        relationshipNode.color,

                    border:
                        `1px solid ${

                            relationshipNode.color

                        }88`,

                    borderRadius:
                        9,

                    padding:
                        "7px 10px",

                    textAlign:
                        "center",

                    fontSize:
                        10,

                    fontWeight:
                        800,

                    letterSpacing:
                        "0.2px",

                    boxShadow:
                        `0 4px 14px ${

                            relationshipNode.color

                        }12`

                }

            });

        }

    );



    // ========================================================
    // CREATE ENTITY NODES
    // ========================================================

    uniqueGraphNodes

        .filter(

            (node: any) =>

                !isSameEntity(node)

        )

        .forEach(

            (node: any) => {

                const id =
                    String(node.id);



                const position =

                    entityPositions.get(id);



                if (!position) {

                    return;

                }



                graphNodes.push({

                    id,

                    type:
                        "default",

                    position,

                    sourcePosition:
                        Position.Bottom,

                    targetPosition:
                        Position.Top,

                    data: {

                        label:

                            `${

                                node.data?.icon ||

                                "❓"

                            } ${

                                node.data?.label ||

                                node.data?.name ||

                                "Unknown"

                            }`,

                        original:
                            node.data

                    },

                    style: {

                        width:
                            nodeWidth,

                        minHeight:
                            nodeHeight,

                        background:
                            "#111827",

                        color:
                            "#ffffff",

                        border:
                            "1px solid #334155",

                        borderRadius:
                            12,

                        padding:
                            15,

                        textAlign:
                            "center",

                        fontWeight:
                            650,

                        boxShadow:
                            "0 8px 25px rgba(0,0,0,0.35)"

                    }

                });

            }

        );



    // ========================================================
    // CREATE EDGES
    //
    // IMPORTANT:
    // There are NO edge labels.
    //
    // Relationship is displayed only once inside
    // the relationship node.
    // ========================================================

    const finalEdges: Edge[] = [];



    // ========================================================
    // MAIN -> RELATIONSHIP
    // ========================================================

    relationshipNodes.forEach(

        (relationshipNode) => {

            finalEdges.push({

                id:

                    `main-to-${

                        relationshipNode.id

                    }`,

                source:
                    mainVisualId,

                target:
                    relationshipNode.id,

                type:
                    "entityGraphEdge",

                data: {

                    relationshipType:
                        relationshipNode.relationship

                }

            });

        }

    );



    // ========================================================
    // RELATIONSHIP -> ENTITIES
    // ========================================================

    groups.forEach(

        (

            group,

            groupIndex

        ) => {

            const relationshipNode =

                relationshipNodes[groupIndex];



            group.entities.forEach(

                (

                    entityNode: any

                ) => {

                    finalEdges.push({

                        id:

                            `${

                                relationshipNode.id

                            }-entity-${

                                entityNode.id

                            }`,

                        source:
                            relationshipNode.id,

                        target:
                            String(entityNode.id),

                        type:
                            "entityGraphEdge",

                        data: {

                            relationshipType:
                                group.relationship

                        }

                    });

                }

            );

        }

    );



    // ========================================================
    // DIRECT ENTITY IDS
    // ========================================================

    const directEntityIds =

        new Set<string>();



    groups.forEach(

        (group) => {

            group.entities.forEach(

                (node: any) => {

                    directEntityIds.add(

                        String(node.id)

                    );

                }

            );

        }

    );



    // ========================================================
    // DISCONNECTED NODES
    // ========================================================

    const disconnectedNodes =

        uniqueGraphNodes.filter(

            (node: any) =>

                !isSameEntity(node) &&

                !directEntityIds.has(

                    String(node.id)

                )

        );



    if (

        disconnectedNodes.length > 0

    ) {

        const startY =
            entityY + 230;



        disconnectedNodes.forEach(

            (

                node: any,

                index: number

            ) => {

                const id =
                    String(node.id);



                const totalWidth =

                    disconnectedNodes.length *

                    (

                        nodeWidth +

                        horizontalGap

                    );



                const x =

                    centerX -

                    totalWidth / 2 +

                    index *

                    (

                        nodeWidth +

                        horizontalGap

                    );



                const existingNode =

                    graphNodes.find(

                        (item) =>

                            item.id === id

                    );



                if (existingNode) {

                    existingNode.position = {

                        x,

                        y:
                            startY

                    };

                }

            }

        );

    }



    // ========================================================
    // CONNECTION EDGE STYLING
    // ========================================================

    const styledEdges: Edge[] =

        finalEdges.map(

            (edge) => {

                const relationship =

                    String(

                        edge.data
                            ?.relationshipType ??

                        "Related"

                    );



                const color =

                    getRelationshipColor(

                        relationship

                    );



                return {

                    ...edge,

                    style: {

                        stroke:
                            color,

                        strokeWidth:
                            2.2,

                        opacity:
                            0.9

                    }

                };

            }

        );



    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div

            className="graph-page-overlay"

            style={{

                position:
                    "fixed",

                inset:
                    0,

                zIndex:
                    9999,

                background:
                    "rgba(0,0,0,0.82)",

                backdropFilter:
                    "blur(8px)"

            }}

        >

            <div

                className="graph-page"

                style={{

                    position:
                        "relative",

                    width:
                        "94vw",

                    height:
                        "92vh",

                    margin:
                        "4vh auto",

                    background:
                        "#080b12",

                    border:
                        "1px solid #1e293b",

                    borderRadius:
                        18,

                    overflow:
                        "hidden",

                    boxShadow:
                        "0 30px 100px rgba(0,0,0,0.65)"

                }}

            >

                {/* ==================================================
                    CLOSE
                ================================================== */}

                <button

                    className="graph-close"

                    onClick={onClose}

                    style={{

                        position:
                            "absolute",

                        top:
                            18,

                        right:
                            18,

                        zIndex:
                            20,

                        width:
                            38,

                        height:
                            38,

                        border:
                            "1px solid #334155",

                        borderRadius:
                            10,

                        background:
                            "#111827",

                        color:
                            "#cbd5e1",

                        display:
                            "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        cursor:
                            "pointer",

                        fontSize:
                            18

                    }}

                >

                    <FiX />

                </button>



                {/* ==================================================
                    HEADER
                ================================================== */}

                <div

                    className="graph-header"

                    style={{

                        position:
                            "absolute",

                        top:
                            22,

                        left:
                            28,

                        zIndex:
                            10,

                        pointerEvents:
                            "none"

                    }}

                >

                    <h2

                        style={{

                            margin:
                                0,

                            color:
                                "#f8fafc",

                            fontSize:
                                20,

                            fontWeight:
                                750

                        }}

                    >

                        🔗 Connection Map

                    </h2>



                    <p

                        style={{

                            margin:
                                "5px 0 0",

                            color:
                                "#64748b",

                            fontSize:
                                12

                        }}

                    >

                        {

                            entity?.data?.label ??

                            entity?.data?.name ??

                            entity?.label ??

                            entity?.name ??

                            "Entity"

                        }

                        {" "}

                        network analysis

                    </p>

                </div>



                {/* ==================================================
                    GRAPH
                ================================================== */}

                <div

                    className="graph-container"

                    style={{

                        width:
                            "100%",

                        height:
                            "100%"

                    }}

                >

                    <ReactFlow

                        nodes={
                            graphNodes
                        }

                        edges={
                            styledEdges
                        }

                        edgeTypes={{

                            entityGraphEdge:
                                EntityGraphEdge

                        }}

                        fitView

                        fitViewOptions={{

                            padding:
                                0.15,

                            minZoom:
                                0.25,

                            maxZoom:
                                1.15

                        }}

                        minZoom={
                            0.2
                        }

                        maxZoom={
                            2
                        }

                        defaultEdgeOptions={{

                            type:
                                "entityGraphEdge"

                        }}

                        nodesDraggable={
                            true
                        }

                        nodesConnectable={
                            false
                        }

                        elementsSelectable={
                            true
                        }

                        onNodeClick={

                            (_, node) => {

                                const selected =

                                    uniqueGraphNodes.find(

                                        (item: any) =>

                                            String(

                                                item.id

                                            ) ===

                                            String(

                                                node.id

                                            )

                                    );



                                if (

                                    selected &&

                                    !node.data
                                        ?.relationship

                                ) {

                                    onSelectEntity(

                                        selected

                                    );

                                }

                            }

                        }

                    >

                        <Background

                            gap={
                                24
                            }

                            size={
                                1
                            }

                        />



                        <Controls />



                        <MiniMap

                            nodeColor={

                                (node: any) => {

                                    // Relationship container
                                    if (

                                        node.data
                                            ?.relationship

                                    ) {

                                        return (

                                            node.data
                                                ?.color ??

                                            "#64748b"

                                        );

                                    }



                                    const originalNode =

                                        uniqueGraphNodes.find(

                                            (item: any) =>

                                                String(

                                                    item.id

                                                ) ===

                                                String(

                                                    node.id

                                                )

                                        );



                                    return (

                                        originalNode &&

                                        isSameEntity(

                                            originalNode

                                        )

                                    )

                                        ? "#2563eb"

                                        : "#1f2937";

                                }

                            }

                        />

                    </ReactFlow>

                </div>

            </div>

        </div>

    );

}