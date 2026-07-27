import { useGraph } from "../../context/GraphContext";
import PropertyField from "./PropertyField";
import PropertyTextarea from "./PropertyTextarea";
import RelationshipProfile from "./RelationshipProfile";


interface Props {

    node: any;

    edge: any;

}



export default function PropertiesPanel({

    node,

    edge

}: Props) {



    const {

        setNodes,

        setEdges,
        setSelectedEdge

    } = useGraph();







    if (edge && !node) {


        return (

            <aside className="properties">


                <h3>

                    🔗 Relationship Profile

                </h3>



                <RelationshipProfile

                    edge={edge}


                    updateEdge={(field: string, value: any) => {


                        const updatedEdge = {


                            ...edge,


                            data: {


                                ...edge.data,


                                [field]: value


                            }


                        };



                        setSelectedEdge(updatedEdge);



                        setEdges(prev =>

                            prev.map(item =>

                                item.id === edge.id

                                    ? {
                                        ...item,
                                        data: {
                                            ...item.data,
                                            [field]: value
                                        }
                                    }
                                    : item

                            )

                        );


                        setSelectedEdge({

                            ...edge,

                            data: {

                                ...edge.data,

                                [field]: value

                            }

                        });


                    }}


                />


            </aside>

        );


    }





    if (!node) {


        return (

            <aside className="properties">


                <h3>
                    Entity Profile
                </h3>


                <p className="empty-text">

                    Select an entity from graph

                </p>


            </aside>

        );


    }









    const updateData = (

        field: string,

        value: any

    ) => {


        setNodes(nodes =>

            nodes.map(item => {


                if (item.id === node.id) {


                    return {


                        ...item,


                        data: {


                            ...item.data,


                            [field]: value


                        }


                    }


                }


                return item;


            })

        );


    };









    const updateDetail = (

        field: string,

        value: string

    ) => {


        setNodes(nodes =>


            nodes.map(item => {



                if (item.id === node.id) {



                    return {


                        ...item,


                        data: {


                            ...item.data,


                            details: {


                                ...item.data.details,


                                [field]: value


                            }


                        }


                    }


                }



                return item;



            })


        );


    };









    return (


        <aside className="properties">





            <h3>

                {node.data.icon}

                {" "}

                Entity Profile

            </h3>









            <PropertyField

                label="Name"

                value={node.data.label || ""}

                placeholder="Entity name"

                onChange={(value) =>

                    updateData(

                        "label",

                        value

                    )

                }

            />









            <div className="property-field">


                <label>
                    Risk Level
                </label>


                <select

                    value={node.data.risk || "Low"}

                    onChange={(e) =>

                        updateData(

                            "risk",

                            e.target.value

                        )

                    }

                >


                    <option>
                        Low
                    </option>


                    <option>
                        Medium
                    </option>


                    <option>
                        High
                    </option>


                </select>


            </div>













            {
                node.data.type === "Person" &&

                <>


                    <div className="property-section-title">

                        👤 Person Information

                    </div>





                    <PropertyField

                        label="First Name"

                        value={node.data.details?.firstName || ""}

                        placeholder="John"

                        onChange={(value) =>

                            updateDetail(
                                "firstName",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="Last Name"

                        value={node.data.details?.lastName || ""}

                        placeholder="Smith"

                        onChange={(value) =>

                            updateDetail(
                                "lastName",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="Gender"

                        value={node.data.details?.gender || ""}

                        placeholder="Male / Female"

                        onChange={(value) =>

                            updateDetail(
                                "gender",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="Age"

                        value={node.data.details?.age || ""}

                        placeholder="25"

                        onChange={(value) =>

                            updateDetail(
                                "age",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="Occupation"

                        value={node.data.details?.occupation || ""}

                        placeholder="Police Officer"

                        onChange={(value) =>

                            updateDetail(
                                "occupation",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="Nationality"

                        value={node.data.details?.nationality || ""}

                        placeholder="Kosovo"

                        onChange={(value) =>

                            updateDetail(
                                "nationality",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="Phone"

                        value={node.data.details?.phone || ""}

                        placeholder="+383 44 xxx xxx"

                        onChange={(value) =>

                            updateDetail(
                                "phone",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="Email"

                        value={node.data.details?.email || ""}

                        placeholder="email@example.com"

                        onChange={(value) =>

                            updateDetail(
                                "email",
                                value
                            )

                        }

                    />



                </>

            }












            {
                node.data.type === "Organization" &&

                <>


                    <div className="property-section-title">

                        🏢 Organization Information

                    </div>





                    <PropertyField

                        label="Category"

                        value={node.data.details?.category || ""}

                        placeholder="Police / Government / Company"

                        onChange={(value) =>

                            updateDetail(
                                "category",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="Director"

                        value={node.data.details?.director || ""}

                        placeholder="Organization director"

                        onChange={(value) =>

                            updateDetail(
                                "director",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="Address"

                        value={node.data.details?.address || ""}

                        placeholder="Address"

                        onChange={(value) =>

                            updateDetail(
                                "address",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="Website"

                        value={node.data.details?.website || ""}

                        placeholder="https://"

                        onChange={(value) =>

                            updateDetail(
                                "website",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="Contact"

                        value={node.data.details?.contact || ""}

                        placeholder="Phone / Email"

                        onChange={(value) =>

                            updateDetail(
                                "contact",
                                value
                            )

                        }

                    />


                </>

            }









            {
                node.data.type === "Vehicle" &&


                <>


                    <div className="property-section-title">

                        🚗 Vehicle Information

                    </div>





                    <PropertyField

                        label="Plate Number"

                        value={node.data.details?.plate || ""}

                        placeholder="01-ABC-123"

                        onChange={(value) =>

                            updateDetail(
                                "plate",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="Brand"

                        value={node.data.details?.brand || ""}

                        placeholder="BMW"

                        onChange={(value) =>

                            updateDetail(
                                "brand",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="Model"

                        value={node.data.details?.model || ""}

                        placeholder="X5"

                        onChange={(value) =>

                            updateDetail(
                                "model",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="Year"

                        value={node.data.details?.year || ""}

                        placeholder="2024"

                        onChange={(value) =>

                            updateDetail(
                                "year",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="Color"

                        value={node.data.details?.color || ""}

                        placeholder="Black"

                        onChange={(value) =>

                            updateDetail(
                                "color",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="VIN"

                        value={node.data.details?.vin || ""}

                        placeholder="Vehicle identification number"

                        onChange={(value) =>

                            updateDetail(
                                "vin",
                                value
                            )

                        }

                    />





                    <PropertyField

                        label="Owner"

                        value={node.data.details?.owner || ""}

                        placeholder="Vehicle owner"

                        onChange={(value) =>

                            updateDetail(
                                "owner",
                                value
                            )

                        }

                    />



                </>

            }









            <PropertyTextarea

                label="Description"

                value={node.data.description || ""}

                placeholder="Add investigation notes..."

                onChange={(value) =>

                    updateData(
                        "description",
                        value
                    )

                }

            />









            <div className="entity-info">


                <p>
                    Type: {node.data.type}
                </p>


                <p>
                    Category: {node.data.category}
                </p>


            </div>





        </aside>


    );


}