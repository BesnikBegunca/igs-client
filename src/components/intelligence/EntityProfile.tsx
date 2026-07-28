import {
    FiX,
    FiLink,
    FiFolder,
    FiUsers,
    FiActivity
} from "react-icons/fi";


import {
    useState
} from "react";


import {
    useCases
} from "../../context/CaseContext";


import EntityGraph from "./EntityGraph";





interface Props {

    entity: any;

    onClose: () => void;

    onSelectEntity: (entity: any) => void;

}









export default function EntityProfile({

    entity,

    onClose,

    onSelectEntity

}: Props) {




    const {

        cases

    } = useCases();





    const [showGraph, setShowGraph] = useState(false);





    const entityId = entity.id;






    /*
        COLLECT ALL GRAPH DATA
    */


    const allNodes = (cases || [])

        .flatMap(

            (item: any) =>

                item.nodes || []

        );





    const allEdges = (cases || [])

        .flatMap(

            (item: any) =>

                item.edges || []

        );









    /*
        CONNECTIONS
    */


    const connections = allEdges.filter(

        (edge: any) =>

            edge.source === entityId ||

            edge.target === entityId

    );









    /*
        CONNECTED ENTITIES
    */


    const connectedEntities = connections.map(

        (edge: any) => {


            const connectedId =

                edge.source === entityId

                    ?

                    edge.target

                    :

                    edge.source;




            const node = allNodes.find(

                (n: any) =>

                    n.id === connectedId

            );





            return {

                node,

                relationship:

                    edge.data?.relationshipType || "Related"

            };



        }

    )

        .filter(

            (item: any) =>

                item.node

        );









    /*
        RELATED CASES
    */


    const relatedCases = (cases || [])

        .filter(

            (item: any) =>

                (item.nodes || [])

                    .some(

                        (node: any) =>

                            node.id === entityId

                    )

        );









    /*
        RELATION STATISTICS
    */


    const relationStats: any = {};



    connections.forEach(

        (edge: any) => {


            const type =

                edge.data?.relationshipType ||

                "Related";




            relationStats[type] =

                (relationStats[type] || 0) + 1;


        }

    );









    return (



        <div className="entity-overlay">





            <div className="entity-profile">






                <button

                    className="profile-close"

                    onClick={onClose}

                >

                    <FiX />

                </button>









                <div className="entity-main">



                    <div className="big-icon">

                        {

                            entity.data?.icon ||

                            "❓"

                        }

                    </div>





                    <div>


                        <h1>

                            {

                                entity.data?.label ||

                                "Unknown"

                            }

                        </h1>



                        <span>

                            {

                                entity.data?.type ||

                                "Entity"

                            }

                        </span>


                    </div>



                </div>









                <button

                    className="generate-graph-btn"

                    onClick={() => setShowGraph(true)}

                >

                    🔗 Generate Connection Graph

                </button>









                <div className="stats">



                    <div>

                        <FiFolder />

                        <strong>

                            {relatedCases.length}

                        </strong>

                        <small>

                            Cases

                        </small>

                    </div>







                    <div>

                        <FiLink />

                        <strong>

                            {connections.length}

                        </strong>

                        <small>

                            Connections

                        </small>

                    </div>







                    <div>

                        <FiUsers />

                        <strong>

                            {connectedEntities.length}

                        </strong>

                        <small>

                            Entities

                        </small>

                    </div>



                </div>









                <section>


                    <h3>

                        📁 Cases Involved

                    </h3>



                    <div className="case-grid">


                        {

                            relatedCases.length === 0

                                ?

                                <p>

                                    No cases found

                                </p>


                                :


                                relatedCases.map((item: any) => (


                                    <div

                                        className="info-card"

                                        key={item.id}

                                    >

                                        📂

                                        {" "}

                                        {

                                            item.name ||

                                            item.title ||

                                            "Investigation"

                                        }


                                    </div>


                                ))

                        }


                    </div>


                </section>









                <section>


                    <h3>

                        🔗 Connected Entities

                    </h3>






                    {


                        connectedEntities.length === 0


                            ?


                            <p>

                                No connections found

                            </p>



                            :



                            connectedEntities.map(

                                (item: any, index: number) => (


                                    <div

                                        className="connection-card"

                                        key={index}

                                        onClick={() =>


                                            onSelectEntity(

                                                item.node

                                            )

                                        }

                                    >




                                        <div>


                                            <span>

                                                {

                                                    item.node.data?.icon ||

                                                    "❓"

                                                }

                                            </span>



                                            <b>

                                                {

                                                    item.node.data?.label

                                                }

                                            </b>



                                            <small>

                                                {

                                                    item.node.data?.type

                                                }

                                            </small>



                                        </div>





                                        <strong>

                                            {

                                                item.relationship

                                            }

                                        </strong>



                                    </div>


                                )

                            )


                    }



                </section>









                <section>


                    <h3>

                        📊 Relationship Analysis

                    </h3>



                    {


                        Object.entries(

                            relationStats

                        )

                            .map(

                                ([key, value]: any) => (


                                    <div

                                        className="detail-row"

                                        key={key}

                                    >

                                        <b>

                                            {key}

                                        </b>


                                        <span>

                                            {value}

                                        </span>


                                    </div>


                                )


                            )


                    }



                </section>









                <section>


                    <h3>

                        ⚠️ Risk

                    </h3>




                    <div className="detail-row">


                        <b>

                            Level

                        </b>


                        <span>

                            {

                                entity.data?.risk ||

                                "Low"

                            }

                        </span>


                    </div>



                </section>









                <section>


                    <h3>

                        👤 Details

                    </h3>



                    {


                        Object.entries(

                            entity.data?.details || {}

                        )

                            .map(

                                ([key, value]: any) => (


                                    <div

                                        className="detail-row"

                                        key={key}

                                    >

                                        <b>

                                            {key}

                                        </b>


                                        <span>

                                            {String(value)}

                                        </span>


                                    </div>


                                )

                            )


                    }



                </section>









                {

                    showGraph && (


                        <EntityGraph

                            entity={entity}

                            nodes={allNodes}

                            edges={allEdges}

                            onClose={() => setShowGraph(false)}

                        />


                    )

                }







            </div>



        </div>


    );


}