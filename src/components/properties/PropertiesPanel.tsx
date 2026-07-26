import { useGraph } from "../../context/GraphContext";


interface Props {

    node: any;

}




export default function PropertiesPanel({

    node

}: Props) {



    const {

        setNodes

    } = useGraph();







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









    const updateNode = (

        field: string,

        value: any

    ) => {


        setNodes((nodes) =>

            nodes.map((item) => {


                if (item.id === node.id) {


                    return {


                        ...item,


                        data: {


                            ...item.data,


                            [field]: value


                        }


                    };


                }



                return item;


            })


        );


    };









    return (


        <aside className="properties">





            <h3>
                Entity Profile
            </h3>







            <div className="property-section">


                <label>
                    Name
                </label>


                <input

                    value={
                        node.data.label || ""
                    }


                    onChange={(e) =>

                        updateNode(

                            "label",

                            e.target.value

                        )

                    }

                />


            </div>









            <div className="property-section">


                <label>
                    Entity Type
                </label>


                <select

                    value={
                        node.data.type || ""
                    }


                    onChange={(e) =>

                        updateNode(

                            "type",

                            e.target.value

                        )

                    }

                >

                    <option>
                        Person
                    </option>


                    <option>
                        Vehicle
                    </option>


                    <option>
                        Organization
                    </option>


                    <option>
                        Location
                    </option>


                    <option>
                        Phone
                    </option>


                    <option>
                        Document
                    </option>


                </select>


            </div>









            <div className="property-section">


                <label>
                    Risk Level
                </label>


                <select

                    value={
                        node.data.risk || "Low"
                    }


                    onChange={(e) =>

                        updateNode(

                            "risk",

                            e.target.value

                        )

                    }

                >


                    <option value="Low">
                        Low
                    </option>


                    <option value="Medium">
                        Medium
                    </option>


                    <option value="High">
                        High
                    </option>


                </select>


            </div>









            <div className="property-section">


                <label>
                    Description
                </label>


                <textarea


                    value={
                        node.data.description || ""
                    }


                    onChange={(e) =>

                        updateNode(

                            "description",

                            e.target.value

                        )

                    }


                    placeholder="Entity notes..."


                />


            </div>









            <div className="property-section">


                <label>
                    Tags
                </label>


                <input


                    value={

                        node.data.tags || ""

                    }


                    onChange={(e) =>

                        updateNode(

                            "tags",

                            e.target.value

                        )

                    }


                    placeholder="suspect, witness, VIP..."


                />


            </div>








            <div className="entity-info">


                <p>
                    ID: {node.id}
                </p>


                <p>
                    Type: {node.data.type}
                </p>


            </div>







        </aside>


    );

}