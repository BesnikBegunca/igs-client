import { useState } from "react";

import { useGraph } from "../../context/GraphContext";





export default function RelationshipExplorer() {



    const {

        nodes,

        edges


    } = useGraph();






    const [search, setSearch] = useState("");









    const relationships = edges.filter(edge => {



        const sourceNode = nodes.find(

            node => node.id === edge.source

        );



        const targetNode = nodes.find(

            node => node.id === edge.target

        );



        if (!sourceNode || !targetNode) {

            return false;

        }



        const text =

            `${sourceNode.data.label}

            ${targetNode.data.label}

            ${edge.data?.label || ""}`

                .toLowerCase();




        return text.includes(

            search.toLowerCase()

        );


    });









    return (



        <aside className="relationship-explorer">





            <h3>

                🔗 Relationships

            </h3>








            <input

                placeholder="Search relationship..."

                value={search}


                onChange={(e) =>

                    setSearch(

                        e.target.value

                    )

                }

            />









            <div className="relationship-list">



                {

                    relationships.map(edge => {



                        const source = nodes.find(

                            node => node.id === edge.source

                        );



                        const target = nodes.find(

                            node => node.id === edge.target

                        );






                        return (



                            <div

                                className="relationship-card"

                                key={edge.id}

                            >





                                <div>


                                    <strong>

                                        {source?.data.label}

                                    </strong>


                                    <span>

                                        →

                                    </span>


                                    <strong>

                                        {target?.data.label}

                                    </strong>


                                </div>








                                <small>

                                    {edge.data?.label || "Relationship"}

                                </small>






                            </div>



                        );



                    })


                }





                {

                    relationships.length === 0 &&

                    <p>

                        No relationships found

                    </p>

                }



            </div>






        </aside>


    );

}