interface Props {

    node: any;

    setNodes: React.Dispatch<
        React.SetStateAction<any[]>
    >;

}





export default function PropertiesPanel({

    node,

    setNodes

}: Props) {




    if (!node) {


        return (

            <aside className="properties">


                <h3>
                    Properties
                </h3>


                <p className="empty-text">
                    Select an entity from graph
                </p>


            </aside>

        );

    }







    const updateNode = (

        field: string,

        value: string

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
                Properties
            </h3>







            <div className="property-section">


                <label>
                    Entity Type
                </label>


                <input

                    type="text"

                    value={
                        node.data.type || ""
                    }


                    onChange={(e) =>

                        updateNode(

                            "type",

                            e.target.value

                        )

                    }

                />


            </div>








            <div className="property-section">


                <label>
                    Name
                </label>


                <input

                    type="text"

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
                    Description
                </label>


                <textarea

                    placeholder="Notes about entity..."

                />


            </div>








            <div className="property-section">


                <label>
                    Risk Level
                </label>


                <select>


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






        </aside>

    );

}