import {
    useState
} from "react";

import {
    useGraph
} from "../../context/GraphContext";


export default function LeftSidebar() {

    const {

        nodes,
        edges,
        entityRegistry

    } = useGraph();


    const [
        openCategory,
        setOpenCategory
    ] = useState<string | null>(null);


    const [
        searchTerm,
        setSearchTerm
    ] = useState("");


    /*
    ============================================================
    ENTITY CATEGORIES
    ============================================================
    */

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


    /*
    ============================================================
    SEARCH REGISTERED ENTITIES
    ============================================================
    */

    const normalizedSearch =
        searchTerm
            .trim()
            .toLowerCase();


    const searchedEntities =

        normalizedSearch.length === 0

            ? []

            : entityRegistry.filter(
                (entity: any) => {

                    const name =
                        String(
                            entity.name ?? ""
                        ).toLowerCase();


                    const type =
                        String(
                            entity.type ?? ""
                        ).toLowerCase();


                    return (
                        name.includes(
                            normalizedSearch
                        )

                        ||

                        type.includes(
                            normalizedSearch
                        )
                    );

                }
            );


    /*
    ============================================================
    DRAG REGISTERED ENTITY
    ============================================================
    */

    const handleEntityDragStart = (

        event: React.DragEvent,

        entity: any

    ) => {

        event.dataTransfer.effectAllowed =
            "copy";


        event.dataTransfer.setData(

            "application/reactflow",

            JSON.stringify({

                entityId:
                    entity.id,

                name:
                    entity.name,

                icon:
                    entity.icon,

                type:
                    entity.type,

                category:
                    entity.category,

                attributes:
                    entity.attributes ?? {},

                entity:
                    entity

            })

        );

    };


    /*
    ============================================================
    DRAG NEW ENTITY TYPE
    ============================================================
    */

    const handleTemplateDragStart = (

        event: React.DragEvent,

        entity: any,

        categoryName: string

    ) => {

        event.dataTransfer.effectAllowed =
            "copy";


        event.dataTransfer.setData(

            "application/reactflow",

            JSON.stringify({

                name:
                    entity.name,

                icon:
                    entity.icon,

                type:
                    entity.type,

                category:
                    categoryName,

                attributes:
                    {}

            })

        );

    };


    /*
    ============================================================
    GRAPH STATISTICS
    ============================================================
    */

    const totalEntities =
        nodes.length;


    const totalRelationships =
        edges.length;


    const categories =
        new Set(

            nodes.map(
                node =>
                    node.data?.type
            )

        ).size;


    /*
    ============================================================
    UI
    ============================================================
    */

    return (

        <aside className="intel-sidebar">


            {/* HEADER */}

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


            {/* SEARCH */}

            <div className="sidebar-search">

                <span>
                    🔍
                </span>


                <input

                    value={
                        searchTerm
                    }

                    onChange={(event) =>
                        setSearchTerm(
                            event.target.value
                        )
                    }

                    placeholder="Search entities..."

                />


                {
                    searchTerm && (

                        <button

                            type="button"

                            onClick={() =>
                                setSearchTerm("")
                            }

                            style={{

                                border: "none",

                                background:
                                    "transparent",

                                color:
                                    "#64748b",

                                cursor:
                                    "pointer",

                                fontSize:
                                    "14px"

                            }}

                        >

                            ×

                        </button>

                    )
                }

            </div>


            {/* SEARCH RESULTS */}

            {
                normalizedSearch.length > 0 && (

                    <section className="entity-search-results">

                        <h4>
                            REGISTERED ENTITIES
                        </h4>


                        {
                            searchedEntities.length === 0 ? (

                                <div className="no-search-results">

                                    <span>
                                        🔎
                                    </span>

                                    <p>
                                        No registered entity found
                                    </p>

                                </div>

                            ) : (

                                <div className="registered-entity-list">

                                    {
                                        searchedEntities.map(
                                            (entity: any) => (

                                                <div

                                                    key={
                                                        entity.id
                                                    }

                                                    className="registered-entity"

                                                    draggable

                                                    onDragStart={(event) =>
                                                        handleEntityDragStart(
                                                            event,
                                                            entity
                                                        )
                                                    }

                                                >

                                                    <div className="registered-icon">

                                                        {
                                                            entity.icon ??
                                                            "❓"
                                                        }

                                                    </div>


                                                    <div className="registered-info">

                                                        <strong>
                                                            {
                                                                entity.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                entity.type
                                                            }
                                                        </span>

                                                    </div>


                                                    <div className="drag-indicator">
                                                        ⠿
                                                    </div>

                                                </div>

                                            )
                                        )
                                    }

                                </div>

                            )
                        }

                    </section>

                )
            }


            {/* ENTITY TYPES */}

            <section>

                <h4>
                    ENTITY TYPES
                </h4>


                <div className="entity-list">

                    {
                        entityCategories.map(
                            category => (

                                <div
                                    key={
                                        category.name
                                    }
                                >

                                    <div

                                        className="entity-item category"

                                        onClick={() =>
                                            setOpenCategory(

                                                openCategory ===
                                                    category.name

                                                    ? null

                                                    : category.name

                                            )
                                        }

                                    >

                                        <span>
                                            {
                                                category.icon
                                            }
                                        </span>


                                        <span>
                                            {
                                                category.name
                                            }
                                        </span>


                                        <b>

                                            {
                                                openCategory ===
                                                    category.name

                                                    ? "▲"

                                                    : "▼"
                                            }

                                        </b>

                                    </div>


                                    {
                                        openCategory ===
                                        category.name && (

                                            <div className="sub-entities">

                                                {
                                                    category.items.map(
                                                        entity => (

                                                            <div

                                                                key={
                                                                    entity.name
                                                                }

                                                                className="entity-child"

                                                                draggable

                                                                onDragStart={(event) =>
                                                                    handleTemplateDragStart(
                                                                        event,
                                                                        entity,
                                                                        category.name
                                                                    )
                                                                }

                                                            >

                                                                <span>
                                                                    {
                                                                        entity.icon
                                                                    }
                                                                </span>


                                                                <span>
                                                                    {
                                                                        entity.name
                                                                    }
                                                                </span>

                                                            </div>

                                                        )
                                                    )
                                                }

                                            </div>

                                        )
                                    }

                                </div>

                            )
                        )
                    }

                </div>

            </section>


            {/* GRAPH INTELLIGENCE */}

            <section className="graph-info">

                <h4>
                    GRAPH INTELLIGENCE
                </h4>


                <div>

                    <span>
                        Entities
                    </span>

                    <strong>
                        {
                            totalEntities
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Relationships
                    </span>

                    <strong>
                        {
                            totalRelationships
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Categories
                    </span>

                    <strong>
                        {
                            categories
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Registry
                    </span>

                    <strong>
                        {
                            entityRegistry.length
                        }
                    </strong>

                </div>

            </section>

        </aside>

    );

}