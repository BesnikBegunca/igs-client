import { Handle, Position } from "@xyflow/react";


interface NodeData {

    label: string;

    type?: string;

    risk?: string;

}


interface Props {

    data: NodeData;

}






export default function CustomNode({

    data

}: Props) {





    const icons: any = {


        Person: "👤",

        Vehicle: "🚗",

        Location: "📍",

        Phone: "📱",

        Drug: "💊",

        Weapon: "🔫",

        Money: "💰",

        Organization: "🏢",

        Document: "📄"


    };








    const riskClass =

        data.risk === "High"

            ? "risk-high"

            :

            data.risk === "Medium"

                ? "risk-medium"

                :

                "risk-low";








    return (



        <div className={`custom-node ${riskClass}`}>




            <Handle

                type="target"

                position={Position.Top}

            />







            <div className="node-header">


                <span>

                    {
                        icons[data.type || "Person"]
                    }

                </span>



                <strong>

                    {
                        data.type || "Person"
                    }

                </strong>


            </div>







            <div className="node-body">


                <p>

                    {
                        data.label
                    }

                </p>



                <small>

                    Risk: {data.risk || "Low"}

                </small>



            </div>







            <Handle

                type="source"

                position={Position.Bottom}

            />



        </div>



    );

}