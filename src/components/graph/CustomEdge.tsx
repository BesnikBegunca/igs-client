import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath
} from "@xyflow/react";

import {
    useState,
    useCallback
} from "react";

import {
    useGraph
} from "../../context/GraphContext";


// ============================================================
// RELATIONSHIP TYPES
// ============================================================

const relationships = [

    {
        name: "Related",
        color: "#94a3b8"
    },

    {
        name: "Owner",
        color: "#22c55e"
    },

    {
        name: "Owns",
        color: "#22c55e"
    },

    {
        name: "Friend",
        color: "#3b82f6"
    },

    {
        name: "Family",
        color: "#f97316"
    },

    {
        name: "Works For",
        color: "#a855f7"
    },

    {
        name: "Suspect",
        color: "#ef4444"
    },

    {
        name: "Witness",
        color: "#eab308"
    },

    {
        name: "Partner",
        color: "#ec4899"
    },

    {
        name: "Located At",
        color: "#06b6d4"
    },

    {
        name: "Driver",
        color: "#14b8a6"
    }

];


// ============================================================
// COMPONENT
// ============================================================

export default function CustomEdge(
    props: any
) {

    const {

        id,

        sourceX,
        sourceY,

        targetX,
        targetY,

        sourcePosition,
        targetPosition,

        data

    } = props;


    const {

        setEdges,
        addEvent

    } = useGraph();


    const [
        open,
        setOpen
    ] = useState(false);


    // ========================================================
    // BEZIER PATH
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
        targetPosition

    });


    // ========================================================
    // IMPORTANT
    //
    // Relationship can come from:
    //
    // data.relationshipType
    // data.relationship
    // data.label
    // props.relationshipType
    // props.relationship
    // props.label
    //
    // This prevents the edge from becoming "Related"
    // after loading the case.
    // ========================================================

    const relationshipType =

        data?.relationshipType ??

        data?.relationship ??

        data?.label ??

        props?.relationshipType ??

        props?.relationship ??

        props?.label ??

        "Related";


    // ========================================================
    // RELATIONSHIP COLOR
    // ========================================================

    const getRelationshipColor = (
        type: string
    ) => {

        const relation =
            relationships.find(
                item =>
                    item.name === type
            );


        return (
            relation?.color ??
            "#94a3b8"
        );

    };


    // ========================================================
    // UPDATE RELATIONSHIP
    // ========================================================

    const updateRelationship =
        useCallback(

            async (
                value: string
            ) => {

                // ==================================================
                // UPDATE EDGE
                // ==================================================

                setEdges(
                    currentEdges =>

                        currentEdges.map(
                            edge => {

                                if (
                                    String(
                                        edge.id
                                    ) !==
                                    String(
                                        id
                                    )
                                ) {

                                    return edge;

                                }


                                return {

                                    ...edge,


                                    // =================================
                                    // KEEP RELATIONSHIP ALSO TOP LEVEL
                                    // =================================

                                    relationshipType:
                                        value,


                                    relationship:
                                        value,


                                    label:
                                        value,


                                    // =================================
                                    // KEEP IT INSIDE DATA
                                    // =================================

                                    data: {

                                        ...(edge.data ?? {}),


                                        relationshipType:
                                            value,


                                        relationship:
                                            value,


                                        label:
                                            value

                                    }

                                };

                            }

                        )

                );


                // ==================================================
                // EVENT
                // ==================================================

                try {

                    await addEvent({

                        title:
                            "Relationship Updated",

                        type:
                            "relationship",

                        description:
                            `Relationship changed to ${value}`,

                        date:
                            new Date().toISOString()

                    });

                }
                catch (
                error
                ) {

                    console.error(
                        "Failed to create relationship event:",
                        error
                    );

                }


                // ==================================================
                // CLOSE DROPDOWN
                // ==================================================

                setOpen(false);

            },

            [
                id,
                setEdges,
                addEvent
            ]

        );


    // ========================================================
    // CURRENT COLOR
    // ========================================================

    const relationshipColor =
        getRelationshipColor(
            relationshipType
        );


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <>

            <BaseEdge

                id={id}

                path={edgePath}

                style={{

                    stroke:
                        relationshipColor,

                    strokeWidth:
                        1.5

                }}

            />


            <EdgeLabelRenderer>

                <div

                    className="edge-label nodrag nopan"

                    style={{

                        transform:
                            `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,

                        pointerEvents:
                            "all"

                    }}

                >

                    {/* ==========================================
                        CURRENT RELATIONSHIP
                    ========================================== */}

                    <div

                        onClick={(
                            e
                        ) => {

                            e.stopPropagation();

                            setOpen(
                                previous =>
                                    !previous
                            );

                        }}

                    >

                        {relationshipType}

                    </div>


                    {/* ==========================================
                        DROPDOWN
                    ========================================== */}

                    {

                        open && (

                            <div

                                className="edge-dropdown"

                                onClick={(
                                    e
                                ) => {

                                    e.stopPropagation();

                                }}

                            >

                                {

                                    relationships.map(
                                        item => (

                                            <div

                                                key={
                                                    item.name
                                                }

                                                className="edge-option"

                                                onClick={(
                                                    e
                                                ) => {

                                                    e.stopPropagation();


                                                    void updateRelationship(
                                                        item.name
                                                    );

                                                }}

                                            >

                                                <span

                                                    className="relationship-dot"

                                                    style={{

                                                        background:
                                                            item.color

                                                    }}

                                                />

                                                {item.name}

                                            </div>

                                        )
                                    )

                                }

                            </div>

                        )

                    }

                </div>

            </EdgeLabelRenderer>

        </>

    );

}