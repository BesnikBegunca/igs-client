import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath
} from "@xyflow/react";

import { useState } from "react";


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



    const [open, setOpen] = useState(false);


    const relationships = [

        "Owns",
        "Lives At",
        "Calls",
        "Knows",
        "Works For",
        "Sold To"

    ];



    const [label, setLabel] =
        useState(data?.label || "Relationship");



    const [edgePath, labelX, labelY] =
        getBezierPath({

            sourceX,
            sourceY,

            sourcePosition,

            targetX,
            targetY,

            targetPosition

        });





    return (

        <>

            <BaseEdge

                id={id}

                path={edgePath}

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
                        setOpen(!open);
                    }}

                >

                    {label}


                    {
                        open && (

                            <div

                                className="edge-dropdown"

                                onClick={(e) => e.stopPropagation()}

                            >

                                {
                                    relationships.map(item => (

                                        <div

                                            key={item}

                                            onClick={() => {

                                                setLabel(item);
                                                setOpen(false);

                                            }}

                                        >

                                            {item}

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