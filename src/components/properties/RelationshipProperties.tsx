import RelationshipProfile from "./RelationshipProfile";
import { useGraph } from "../../context/GraphContext";


interface Props {

    edge: any;

}



export default function RelationshipProperties({

    edge

}: Props) {



    const {

        setEdges,

        setSelectedEdge,

        nodes,

        addEvent

    } = useGraph();






    if (!edge) {

        return null;

    }






    const sourceNode = nodes.find(

        node =>

            node.id === edge.source

    );





    const targetNode = nodes.find(

        node =>

            node.id === edge.target

    );








    const updateEdge = (

        field: string,

        value: any

    ) => {


        const updatedEdge = {

            ...edge,

            data: {

                ...edge.data,

                [field]: value

            }

        };



        setSelectedEdge(updatedEdge);



        setEdges(edges =>

            edges.map(item =>

                item.id === edge.id

                    ? updatedEdge

                    : item

            )

        );




        if (field === "relationshipType") {


            addEvent({

                title: "Relationship Updated",

                description:

                    `${sourceNode?.data?.label} relationship changed to ${value}`

            });


        }


    };









    return (



        <aside className="properties">





            <h3>

                🔗 Relationship Profile

            </h3>








            <div className="relationship-info">





                <div className="relationship-card">


                    <span>

                        FROM

                    </span>


                    <strong>

                        {sourceNode?.data?.icon}

                        {" "}

                        {sourceNode?.data?.label}

                    </strong>


                </div>








                <div className="relationship-arrow">

                    ↓

                </div>








                <div className="relationship-card">


                    <span>

                        TO

                    </span>


                    <strong>

                        {targetNode?.data?.icon}

                        {" "}

                        {targetNode?.data?.label}

                    </strong>


                </div>





            </div>









            <RelationshipProfile


                edge={edge}


                updateEdge={updateEdge}


            />






        </aside>



    );


}