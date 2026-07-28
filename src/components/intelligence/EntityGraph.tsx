import {
    FiX
} from "react-icons/fi";


import {
    ReactFlow,
    Background,
    Controls,
    MiniMap
} from "@xyflow/react";


import "@xyflow/react/dist/style.css";






interface Props {


    entity: any;


    nodes: any[];


    edges: any[];


    onClose: () => void;


}









export default function EntityGraph({

    entity,

    nodes,

    edges,

    onClose

}: Props) {





    const entityId = String(entity.id);








    /*
        GET CONNECTIONS
    */


    const graphEdges = edges.filter(


        (edge: any) =>


            String(edge.source) === entityId ||


            String(edge.target) === entityId


    );









    /*
        COLLECT NODE IDS
    */


    const nodeIds = new Set<string>();


    nodeIds.add(entityId);





    graphEdges.forEach((edge: any) => {



        nodeIds.add(

            String(edge.source)

        );



        nodeIds.add(

            String(edge.target)

        );


    });














    /*
        CREATE GRAPH NODES
    */


    const graphNodes = nodes

        .filter(

            (node: any) =>

                nodeIds.has(

                    String(node.id)

                )

        )


        .map(

            (node: any, index: number) => {



                const isMain =

                    String(node.id) === entityId;




                const otherIndex =

                    index - 1;






                return {



                    id:

                        String(node.id),






                    position: {




                        x:

                            isMain


                                ?


                                450



                                :



                                100 + (otherIndex * 250),






                        y:


                            isMain


                                ?


                                100



                                :



                                450



                    },







                    data: {


                        label:



                            `${node.data?.icon || "❓"

                            }

                            ${node.data?.label || "Unknown"

                            }`,




                        original:


                            node.data



                    },








                    style: {



                        width: 180,




                        background:


                            isMain


                                ?


                                "#2563eb"



                                :



                                "#111827",






                        color: "white",






                        border:



                            isMain


                                ?


                                "2px solid #60a5fa"



                                :



                                "1px solid #2563eb",







                        borderRadius: "12px",






                        padding: "15px",






                        textAlign: "center" as const,






                        fontWeight: 700



                    }




                };



            }

        );














    /*
        CREATE RELATIONSHIPS
    */


    const finalEdges = graphEdges.map(


        (edge: any) => ({






            id:

                String(edge.id),






            source:


                String(edge.source),






            target:


                String(edge.target),







            label:


                edge.data?.relationshipType || "Related",






            animated: true,





            style: {


                strokeWidth: 2


            }





        })

    );














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

                            entity.data?.label


                        }

                        {" "}network analysis



                    </p>



                </div>













                <div className="graph-container">






                    <ReactFlow



                        nodes={graphNodes}



                        edges={finalEdges}



                        fitView



                        fitViewOptions={{

                            padding: 0.3

                        }}



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