import { useState } from "react";

import { useGraph } from "../../context/GraphContext";





export default function EntityExplorer() {



    const {

        nodes,

        setSelectedNode


    } = useGraph();






    const [search, setSearch] = useState("");



    const [filter, setFilter] = useState("All");









    const types = [

        "All",

        ...new Set(

            nodes.map(

                node => node.data.type

            )

        )

    ];









    const filteredNodes = nodes.filter(

        node => {


            const matchSearch =

                node.data.label

                    .toLowerCase()

                    .includes(

                        search.toLowerCase()

                    );




            const matchType =

                filter === "All" ||

                node.data.type === filter;




            return (

                matchSearch &&

                matchType

            );


        }

    );









    return (



        <aside className="entity-explorer">






            <h3>

                🧩 Entities

            </h3>







            <input


                placeholder="Search entity..."


                value={search}



                onChange={(e) =>

                    setSearch(

                        e.target.value

                    )

                }


            />








            <select


                value={filter}


                onChange={(e) =>

                    setFilter(

                        e.target.value

                    )

                }


            >



                {

                    types.map(type => (


                        <option

                            key={type}

                            value={type}

                        >

                            {type}

                        </option>



                    ))

                }



            </select>









            <div className="entity-list">





                {

                    filteredNodes.map(node => (



                        <div


                            key={node.id}


                            className="entity-card"



                            onClick={() =>


                                setSelectedNode(node)

                            }


                        >



                            <span>


                                {node.data.type === "Person" && "👤"}

                                {node.data.type === "Vehicle" && "🚗"}

                                {node.data.type === "Location" && "📍"}

                                {node.data.type === "Phone" && "📱"}

                                {![
                                    "Person",
                                    "Vehicle",
                                    "Location",
                                    "Phone"

                                ].includes(node.data.type) && "🧩"}



                            </span>






                            <div>


                                <strong>

                                    {node.data.label}

                                </strong>



                                <small>

                                    {node.data.type}

                                </small>


                            </div>




                        </div>



                    ))

                }






            </div>






        </aside>


    );

}