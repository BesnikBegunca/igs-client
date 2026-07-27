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

        setSelectedEdge

    } = useGraph();




    if (!edge) {

        return null;

    }




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


    };







    return (


        <aside className="properties">


            <h3>

                🔗 Relationship Profile

            </h3>





            <RelationshipProfile


                edge={edge}


                updateEdge={updateEdge}


            />



        </aside>


    );


}