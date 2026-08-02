import {
    FiX
} from "react-icons/fi";


import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    Position
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
// SAME COLORS AS CustomEdge
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
// GET NODE CENTER
// ============================================================

const getNodeCenter = (

    node: any

) => {

    const width =

        Number(

            node?.style?.width ??

            node?.measured?.width ??

            node?.width ??

            180

        );



    const height =

        Number(

            node?.measured?.height ??

            node?.height ??

            80

        );



    const x =

        Number(

            node?.position?.x ?? 0

        );



    const y =

        Number(

            node?.position?.y ?? 0

        );



    return {

        x: x + width / 2,

        y: y + height / 2

    };

};



// ============================================================
// GET STRUCTURAL DIRECTION
//
// IMPORTANT:
//
// This function determines the PHYSICAL direction of the
// relationship based on where the nodes actually are.
//
// It does NOT care which node was originally source/target.
//
// Example:
//
// database:
//      source = Ardi
//      target = Besnik
//
// visual:
//
//      Besnik
//        |
//        |
//       Ardi
//
// result:
//
//      source = Besnik
//      target = Ardi
//
//      Bottom -> Top
// ============================================================

const getStructuralConnection = (

    firstNode: any,

    secondNode: any

) => {

    if (!firstNode || !secondNode) {

        return {

            sourceNode: firstNode,

            targetNode: secondNode,

            sourcePosition:
                Position.Bottom,

            targetPosition:
                Position.Top

        };

    }



    const firstCenter =

        getNodeCenter(firstNode);



    const secondCenter =

        getNodeCenter(secondNode);



    const dx =

        secondCenter.x -

        firstCenter.x;



    const dy =

        secondCenter.y -

        firstCenter.y;



    // ========================================================
    // IMPORTANT:
    //
    // Y POSITION HAS PRIORITY.
    //
    // If the nodes are on different vertical levels,
    // ALWAYS connect:
    //
    // ABOVE NODE  -> Bottom
    // BELOW NODE  -> Top
    //
    // We DON'T compare absX with absY anymore.
    // ========================================================

    const verticalDifference =

        Math.abs(dy);



    // ========================================================
    // DIFFERENT VERTICAL LEVELS
    // ========================================================

    if (verticalDifference > 20) {

        // ====================================================
        // FIRST NODE IS ABOVE SECOND NODE
        // ====================================================

        if (dy > 0) {

            return {

                sourceNode:
                    firstNode,

                targetNode:
                    secondNode,

                sourcePosition:
                    Position.Bottom,

                targetPosition:
                    Position.Top

            };

        }



        // ====================================================
        // SECOND NODE IS ABOVE FIRST NODE
        // ====================================================

        return {

            sourceNode:
                secondNode,

            targetNode:
                firstNode,

            sourcePosition:
                Position.Bottom,

            targetPosition:
                Position.Top

        };

    }



    // ========================================================
    // SAME VERTICAL LEVEL
    //
    // Now and ONLY now use horizontal connections.
    // ========================================================

    if (dx > 0) {

        return {

            sourceNode:
                firstNode,

            targetNode:
                secondNode,

            sourcePosition:
                Position.Right,

            targetPosition:
                Position.Left

        };

    }



    return {

        sourceNode:
            secondNode,

        targetNode:
            firstNode,

        sourcePosition:
            Position.Right,

        targetPosition:
            Position.Left

    };





    // ========================================================
    // HORIZONTAL CONNECTION
    // ========================================================

    if (dx > 0) {

        return {

            sourceNode:
                firstNode,

            targetNode:
                secondNode,

            sourcePosition:
                Position.Right,

            targetPosition:
                Position.Left

        };

    }



    return {

        sourceNode:
            secondNode,

        targetNode:
            firstNode,

        sourcePosition:
            Position.Right,

        targetPosition:
            Position.Left

    };

};



// ============================================================
// CUSTOM GRAPH EDGE
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

}: any) {


    const relationship =

        data?.relationshipType ||

        "Related";


    const color =

        getRelationshipColor(

            relationship

        );


    const curveIndex =

        Number(

            data?.curveIndex || 0

        );



    // ========================================================
    // DETERMINE IF THIS IS A VERTICAL CONNECTION
    // ========================================================

    const isVertical =

        (

            sourcePosition ===

            Position.Top ||

            sourcePosition ===

            Position.Bottom

        ) &&

        (

            targetPosition ===

            Position.Top ||

            targetPosition ===

            Position.Bottom

        );



    // ========================================================
    // VERTICAL CONNECTIONS
    //
    // Keep them structurally straight.
    //
    // This means:
    //
    // Bottom -> Top
    //
    // instead of making unnecessary curves.
    // ========================================================

    let curvature = 0;



    if (!isVertical) {

        const curvePattern = [

            0.15,

            0.3,

            0.45,

            0.6,

            0.75,

            0.9

        ];



        const patternIndex =

            Math.abs(

                curveIndex

            ) %

            curvePattern.length;



        curvature =

            curvePattern[

            patternIndex

            ];



        if (

            curveIndex % 2 !== 0

        ) {

            curvature *= -1;

        }

    }



    // ========================================================
    // CREATE BEZIER PATH
    // ========================================================

    const [

        edgePath,

        labelX,

        labelY

    ] = getBezierPath({

        sourceX,

        sourceY,

        sourcePosition,

        targetX,

        targetY,

        targetPosition,

        curvature

    });



    return (

        <>

            <BaseEdge

                id={id}

                path={edgePath}

                style={{

                    stroke:
                        color,

                    strokeWidth:
                        2,

                    opacity:
                        0.95

                }}

            />



            <EdgeLabelRenderer>

                <div

                    className="entity-graph-edge-label nodrag nopan"

                    style={{

                        position:
                            "absolute",

                        transform:
                            `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,

                        background:
                            "#0b0b0b",

                        border:
                            `1px solid ${color}`,

                        color:
                            color,

                        padding:
                            "4px 9px",

                        borderRadius:
                            "7px",

                        fontSize:
                            "11px",

                        fontWeight:
                            700,

                        whiteSpace:
                            "nowrap",

                        pointerEvents:
                            "none",

                        boxShadow:
                            `0 0 8px ${color}33`

                    }}

                >

                    {relationship}

                </div>

            </EdgeLabelRenderer>

        </>

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



    // ============================================================
    // MAIN ENTITY INFORMATION
    // ============================================================

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



    // ============================================================
    // HELPERS
    // ============================================================

    const getNodeName = (node: any) =>

        String(

            node?.data?.label ??
            node?.data?.name ??
            node?.label ??
            node?.name ??
            ""

        )
            .trim()
            .toLowerCase();



    const getNodeType = (node: any) =>

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



        // ========================================================
        // FIRST CHECK ID
        // ========================================================

        if (

            mainEntityId &&

            nodeId ===

            mainEntityId

        ) {

            return true;

        }



        // ========================================================
        // THEN CHECK REAL ENTITY IDENTITY
        // ========================================================

        const nodeName =

            getNodeName(

                node

            );


        const nodeType =

            getNodeType(

                node

            );



        if (

            !mainName ||

            !nodeName

        ) {

            return false;

        }



        if (

            nodeName !==

            mainName

        ) {

            return false;

        }



        if (

            mainType &&

            nodeType

        ) {

            return (

                nodeType ===

                mainType

            );

        }



        return true;

    };



    // ============================================================
    // FIND ALL VERSIONS OF THE ENTITY
    // ACROSS ALL CASES
    // ============================================================

    const entityNodes =

        nodes.filter(

            (node: any) =>

                isSameEntity(

                    node

                )

        );



    // ============================================================
    // ALL ENTITY INSTANCE IDS
    // ============================================================

    const entityIds =

        new Set<string>(

            entityNodes.map(

                (node: any) =>

                    String(

                        node.id

                    )

            )

        );



    if (mainEntityId) {

        entityIds.add(

            mainEntityId

        );

    }



    // ============================================================
    // FIND ALL CONNECTIONS
    // FROM ALL CASES
    // ============================================================

    const graphEdges =

        edges.filter(

            (edge: any) => {

                const source =

                    String(

                        edge.source

                    );


                const target =

                    String(

                        edge.target

                    );



                return (

                    entityIds.has(

                        source

                    ) ||

                    entityIds.has(

                        target

                    )

                );

            }

        );



    // ============================================================
    // COLLECT ALL NODE IDS
    // ============================================================

    const nodeIds =

        new Set<string>();



    entityNodes.forEach(

        (node: any) => {

            nodeIds.add(

                String(

                    node.id

                )

            );

        }

    );



    graphEdges.forEach(

        (edge: any) => {

            nodeIds.add(

                String(

                    edge.source

                )

            );


            nodeIds.add(

                String(

                    edge.target

                )

            );

        }

    );



    // ============================================================
    // GET ALL GRAPH NODES
    // ============================================================

    const rawGraphNodes =

        nodes.filter(

            (node: any) =>

                nodeIds.has(

                    String(

                        node.id

                    )

                )

        );



    // ============================================================
    // REMOVE DUPLICATE VISUAL ENTITIES
    // ============================================================

    const visualNodeMap =

        new Map<string, any>();



    rawGraphNodes.forEach(

        (node: any) => {

            const nodeName =

                getNodeName(

                    node

                );


            const nodeType =

                getNodeType(

                    node

                );



            let key: string;



            if (

                isSameEntity(

                    node

                )

            ) {

                key =

                    "__MAIN_ENTITY__";

            }

            else {

                key =

                    `${nodeName}::${nodeType}`;

            }



            if (

                !visualNodeMap.has(

                    key

                )

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



    // ============================================================
    // MAP ORIGINAL NODE IDS -> VISUAL NODE IDS
    // ============================================================

    const originalToVisualId =

        new Map<string, string>();



    uniqueGraphNodes.forEach(

        (node: any) => {

            const nodeName =

                getNodeName(

                    node

                );


            const nodeType =

                getNodeType(

                    node

                );



            let key: string;



            if (

                isSameEntity(

                    node

                )

            ) {

                key =

                    "__MAIN_ENTITY__";

            }

            else {

                key =

                    `${nodeName}::${nodeType}`;

            }



            const visualNode =

                visualNodeMap.get(

                    key

                );



            if (visualNode) {

                rawGraphNodes

                    .filter(

                        (rawNode: any) => {

                            const rawName =

                                getNodeName(

                                    rawNode

                                );


                            const rawType =

                                getNodeType(

                                    rawNode

                                );



                            if (

                                isSameEntity(

                                    rawNode

                                ) &&

                                isSameEntity(

                                    node

                                )

                            ) {

                                return true;

                            }



                            return (

                                rawName ===

                                nodeName &&

                                rawType ===

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

        }

    );



    // ============================================================
    // CREATE GRAPH NODES
    // ============================================================

    const otherNodes =

        uniqueGraphNodes.filter(

            (item: any) =>

                !isSameEntity(

                    item

                )

        );



    const graphNodes =

        uniqueGraphNodes.map(

            (node: any) => {

                const isMain =

                    isSameEntity(

                        node

                    );



                const otherIndex =

                    otherNodes.findIndex(

                        (item: any) =>

                            String(

                                item.id

                            ) ===

                            String(

                                node.id

                            )

                    );



                let x = 100;

                let y = 450;



                if (isMain) {

                    x = 500;

                    y = 100;

                }

                else {

                    const columns = 4;

                    const column =

                        otherIndex %

                        columns;

                    const row =

                        Math.floor(

                            otherIndex /

                            columns

                        );



                    x =

                        100 +

                        column *

                        250;



                    y =

                        400 +

                        row *

                        180;

                }



                return {

                    id:

                        String(

                            node.id

                        ),



                    position: {

                        x,

                        y

                    },



                    data: {

                        label:

                            `${node.data?.icon || "❓"} ${node.data?.label || node.data?.name || "Unknown"}`,

                        original:

                            node.data

                    },



                    style: {

                        width: 180,

                        background:

                            isMain

                                ? "#2563eb"

                                : "#111827",

                        color:
                            "white",

                        border:

                            isMain

                                ? "2px solid #60a5fa"

                                : "1px solid #2563eb",

                        borderRadius:
                            "12px",

                        padding:
                            "15px",

                        textAlign:
                            "center" as const,

                        fontWeight:
                            700

                    }

                };

            }

        );



    // ============================================================
    // CREATE UNIQUE RELATIONSHIPS
    // ============================================================

    const relationshipKeys =

        new Set<string>();



    const pairCurveCounters =

        new Map<string, number>();



    const finalEdges =

        graphEdges

            .map(

                (edge: any) => {

                    const originalSourceId =

                        String(

                            edge.source

                        );


                    const originalTargetId =

                        String(

                            edge.target

                        );



                    const sourceVisualId =

                        originalToVisualId.get(

                            originalSourceId

                        );



                    const targetVisualId =

                        originalToVisualId.get(

                            originalTargetId

                        );



                    if (

                        !sourceVisualId ||

                        !targetVisualId

                    ) {

                        return null;

                    }



                    // ====================================================
                    // DON'T CREATE SELF RELATIONSHIPS
                    // ====================================================

                    if (

                        sourceVisualId ===

                        targetVisualId

                    ) {

                        return null;

                    }



                    const relationship =

                        String(

                            edge.data?.relationshipType ??

                            "Related"

                        ).trim() ||

                        "Related";



                    // ====================================================
                    // EXACT DUPLICATE CHECK
                    // ====================================================

                    const duplicateKey =

                        [

                            sourceVisualId,

                            targetVisualId,

                            relationship

                        ]

                            .sort()

                            .join("::");



                    if (

                        relationshipKeys.has(

                            duplicateKey

                        )

                    ) {

                        return null;

                    }



                    relationshipKeys.add(

                        duplicateKey

                    );



                    // ====================================================
                    // PAIR KEY
                    // ====================================================

                    const pairKey =

                        [

                            sourceVisualId,

                            targetVisualId

                        ]

                            .sort()

                            .join("::");



                    const currentCurveIndex =

                        pairCurveCounters.get(

                            pairKey

                        ) || 0;



                    pairCurveCounters.set(

                        pairKey,

                        currentCurveIndex + 1

                    );



                    // ====================================================
                    // FIND ACTUAL VISUAL NODES
                    // ====================================================

                    const firstNode =

                        graphNodes.find(

                            (node: any) =>

                                String(

                                    node.id

                                ) ===

                                sourceVisualId

                        );



                    const secondNode =

                        graphNodes.find(

                            (node: any) =>

                                String(

                                    node.id

                                ) ===

                                targetVisualId

                        );



                    if (

                        !firstNode ||

                        !secondNode

                    ) {

                        return null;

                    }



                    // ====================================================
                    // NORMALIZE EDGE DIRECTION
                    //
                    // THIS IS THE IMPORTANT PART.
                    //
                    // The original database direction is NOT used
                    // for visual routing.
                    //
                    // We determine which node is physically above,
                    // below, left or right.
                    // ====================================================

                    const structural =

                        getStructuralConnection(

                            firstNode,

                            secondNode

                        );



                    const visualSourceId =

                        String(

                            structural.sourceNode.id

                        );


                    const visualTargetId =

                        String(

                            structural.targetNode.id

                        );



                    // ====================================================
                    // RELATIONSHIP COLOR
                    // ====================================================

                    const color =

                        getRelationshipColor(

                            relationship

                        );



                    return {

                        id:

                            `${String(edge.id)}-structural`,



                        // IMPORTANT:
                        // Use the STRUCTURAL source/target,
                        // not the original database direction.

                        source:

                            visualSourceId,



                        target:

                            visualTargetId,



                        type:

                            "entityGraphEdge",



                        sourcePosition:

                            structural.sourcePosition,



                        targetPosition:

                            structural.targetPosition,



                        data: {

                            relationshipType:
                                relationship,

                            curveIndex:
                                currentCurveIndex

                        },



                        style: {

                            stroke:
                                color,

                            strokeWidth:
                                2

                        }

                    };

                }

            )

            .filter(

                Boolean

            ) as any[];



    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div className="graph-page-overlay">


            <div className="graph-page">


                <button

                    className="graph-close"

                    onClick={onClose}

                >

                    <FiX />

                </button>



                <div className="graph-header">

                    <h2>

                        🔗 Connection Map

                    </h2>



                    <p>

                        {

                            entity?.data?.label ??

                            entity?.data?.name ??

                            entity?.label ??

                            entity?.name ??

                            "Entity"

                        }

                        {" "}network analysis

                    </p>

                </div>



                <div className="graph-container">

                    <ReactFlow

                        nodes={graphNodes}

                        edges={finalEdges}

                        edgeTypes={{

                            entityGraphEdge:

                                EntityGraphEdge

                        }}

                        fitView

                        fitViewOptions={{

                            padding: 0.3

                        }}



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



                                if (selected) {

                                    onSelectEntity(

                                        selected

                                    );

                                }

                            }

                        }

                    >

                        <Background />

                        <Controls />

                        <MiniMap />

                    </ReactFlow>

                </div>



            </div>

        </div>

    );

}