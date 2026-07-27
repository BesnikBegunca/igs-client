import { useState } from "react";
import { useGraph } from "../../context/GraphContext";


export default function LeftSidebar() {


    const {
        nodes,
        edges
    } = useGraph();



    const [openCategory, setOpenCategory] =

        useState<string | null>(null);



    const entityCategories = [


        {
            icon: "👤",
            name: "Persons",

            items: [

                {
                    name: "Male",
                    icon: "👨",
                    type: "Person"
                },

                {
                    name: "Female",
                    icon: "👩",
                    type: "Person"
                },

                {
                    name: "Unknown Person",
                    icon: "🧑",
                    type: "Person"
                },

                {
                    name: "Police Officer",
                    icon: "👮",
                    type: "Person"
                },

                {
                    name: "Judge",
                    icon: "⚖️",
                    type: "Person"
                },

                {
                    name: "Government Official",
                    icon: "🧑‍💼",
                    type: "Person"
                }

            ]

        },



        {
            icon: "🏢",
            name: "Organizations",

            items: [

                {
                    name: "Police Department",
                    icon: "👮",
                    type: "Organization"
                },

                {
                    name: "Fire Department",
                    icon: "🚒",
                    type: "Organization"
                },

                {
                    name: "Municipality",
                    icon: "🏛️",
                    type: "Organization"
                },

                {
                    name: "Government",
                    icon: "🏛️",
                    type: "Organization"
                },

                {
                    name: "Bank",
                    icon: "🏦",
                    type: "Organization"
                },

                {
                    name: "Hospital",
                    icon: "🏥",
                    type: "Organization"
                },

                {
                    name: "Company",
                    icon: "🏭",
                    type: "Organization"
                }

            ]

        },



        {
            icon: "🚗",
            name: "Vehicles",

            items: [

                {
                    name: "Car",
                    icon: "🚗",
                    type: "Vehicle"
                },

                {
                    name: "Truck",
                    icon: "🚚",
                    type: "Vehicle"
                },

                {
                    name: "Motorcycle",
                    icon: "🏍️",
                    type: "Vehicle"
                },

                {
                    name: "Police Vehicle",
                    icon: "🚓",
                    type: "Vehicle"
                },

                {
                    name: "Bus",
                    icon: "🚌",
                    type: "Vehicle"
                }

            ]

        },




        {
            icon: "🏠",
            name: "Objects",

            items: [

                {
                    name: "Factory",
                    icon: "🏭",
                    type: "Object"
                },

                {
                    name: "Shop",
                    icon: "🏪",
                    type: "Object"
                },

                {
                    name: "House",
                    icon: "🏠",
                    type: "Object"
                },

                {
                    name: "Building",
                    icon: "🏢",
                    type: "Object"
                },

                {
                    name: "Hotel",
                    icon: "🏨",
                    type: "Object"
                },

                {
                    name: "Warehouse",
                    icon: "📦",
                    type: "Object"
                }

            ]

        },




        {
            icon: "📍",
            name: "Locations",

            items: [

                {
                    name: "City",
                    icon: "🏙️",
                    type: "Location"
                },

                {
                    name: "Street",
                    icon: "🛣️",
                    type: "Location"
                },

                {
                    name: "Border Point",
                    icon: "🛃",
                    type: "Location"
                },

                {
                    name: "Crime Scene",
                    icon: "🚨",
                    type: "Location"
                }

            ]

        },





        {
            icon: "📱",
            name: "Digital",

            items: [

                {
                    name: "Phone",
                    icon: "📱",
                    type: "Phone"
                },

                {
                    name: "Computer",
                    icon: "💻",
                    type: "Device"
                },

                {
                    name: "Email Account",
                    icon: "📧",
                    type: "Email"
                },

                {
                    name: "IP Address",
                    icon: "🌐",
                    type: "IP"
                },

                {
                    name: "Social Media",
                    icon: "🔗",
                    type: "Social"
                }

            ]

        },






        {
            icon: "📄",
            name: "Evidence",

            items: [

                {
                    name: "Document",
                    icon: "📄",
                    type: "Document"
                },

                {
                    name: "Photo",
                    icon: "📸",
                    type: "Evidence"
                },

                {
                    name: "Video",
                    icon: "🎥",
                    type: "Evidence"
                },

                {
                    name: "Audio",
                    icon: "🔊",
                    type: "Evidence"
                },

                {
                    name: "Financial Record",
                    icon: "💳",
                    type: "Evidence"
                }

            ]

        }



    ];





    const totalEntities = nodes.length;


    const totalRelationships = edges.length;



    const categories = new Set(

        nodes.map(
            node => node.data.type
        )

    ).size;







    return (

        <aside className="intel-sidebar">



            <div className="intel-header">


                <div className="brand">

                    IGS

                </div>



                <div>

                    <h3>
                        Intelligence Graph
                    </h3>


                    <span>
                        ANALYSIS SYSTEM
                    </span>


                </div>


            </div>





            <div className="sidebar-search">


                🔍


                <input

                    placeholder="Search entities..."

                />


            </div>






            <section>


                <h4>
                    ENTITIES
                </h4>



                <div className="entity-list">



                    {
                        entityCategories.map(category => (


                            <div key={category.name}>


                                <div

                                    className="entity-item category"


                                    onClick={() =>

                                        setOpenCategory(

                                            openCategory === category.name

                                                ?

                                                null

                                                :

                                                category.name

                                        )

                                    }

                                >


                                    <span>

                                        {category.icon}

                                    </span>



                                    <span>

                                        {category.name}

                                    </span>



                                    <b>

                                        {
                                            openCategory === category.name

                                                ?

                                                "▲"

                                                :

                                                "▼"
                                        }

                                    </b>


                                </div>





                                {
                                    openCategory === category.name &&


                                    <div className="sub-entities">


                                        {
                                            category.items.map(entity => (



                                                <div


                                                    key={entity.name}


                                                    className="entity-child"


                                                    draggable



                                                    onDragStart={(event) => {


                                                        event.dataTransfer.setData(

                                                            "application/reactflow",

                                                            JSON.stringify({

                                                                name: entity.name,

                                                                icon: entity.icon,

                                                                type: entity.type,

                                                                category: category.name

                                                            })

                                                        );


                                                    }}



                                                >



                                                    <span>

                                                        {entity.icon}

                                                    </span>



                                                    <span>

                                                        {entity.name}

                                                    </span>



                                                </div>



                                            ))

                                        }



                                    </div>

                                }




                            </div>


                        ))

                    }



                </div>


            </section>









            <section className="graph-info">


                <h4>
                    GRAPH INTELLIGENCE
                </h4>



                <div>

                    <span>
                        Entities
                    </span>

                    <strong>
                        {totalEntities}
                    </strong>

                </div>



                <div>

                    <span>
                        Relationships
                    </span>

                    <strong>
                        {totalRelationships}
                    </strong>

                </div>



                <div>

                    <span>
                        Categories
                    </span>

                    <strong>
                        {categories}
                    </strong>

                </div>



            </section>





        </aside>

    );

}