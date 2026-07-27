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




export default function CustomEdge(props: any) {


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





    const [open, setOpen] = useState(false);






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
        }


    ];







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










    const updateRelationship = useCallback(

        (value: string) => {


            setEdges(edges =>


                edges.map(edge =>


                    edge.id === id


                        ?

                        {

                            ...edge,


                            data: {

                                ...edge.data,

                                relationshipType: value

                            }

                        }


                        :

                        edge


                )


            );



            addEvent({

                title: "Relationship Updated",

                description:
                    `Relationship changed to ${value}`

            });



            setOpen(false);



        },

        [

            id,

            setEdges,

            addEvent

        ]

    );









    const label =

        data?.relationshipType ||

        "Related";









    const getRelationshipColor = (

        type: string

    ) => {


        const relation = relationships.find(

            item => item.name === type

        );



        return relation?.color || "#94a3b8";


    };









    return (


        <>


            <BaseEdge

                id={id}

                path={edgePath}


                style={{


                    stroke: getRelationshipColor(label),


                    strokeWidth: 1.5


                }}

            />






            <EdgeLabelRenderer>


                <div


                    className="edge-label nodrag nopan"


                    style={{


                        transform:

                            `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,


                        pointerEvents: "all"


                    }}



                    onClick={(e) => {


                        e.stopPropagation();


                        setOpen(prev => !prev);


                    }}



                >




                    {label}






                    {

                        open && (


                            <div


                                className="edge-dropdown"


                                onClick={(e) =>


                                    e.stopPropagation()

                                }


                            >




                                {

                                    relationships.map(item => (


                                        <div


                                            key={item.name}


                                            className="edge-option"


                                            onClick={() =>


                                                updateRelationship(

                                                    item.name

                                                )


                                            }


                                        >



                                            <span


                                                className="relationship-dot"


                                                style={{


                                                    background: item.color


                                                }}



                                            />



                                            {item.name}



                                        </div>


                                    ))

                                }




                            </div>


                        )

                    }




                </div>



            </EdgeLabelRenderer>



        </>


    );


}