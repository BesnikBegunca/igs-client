import { Handle, Position } from "@xyflow/react";


interface NodeData {

    label: string;

    type?: string;

    icon?: string;

    category?: string;

    risk?: string;

}


interface Props {

    data: NodeData;

}



export default function CustomNode({ data }: Props) {



    const icons: any = {


        Person: "👤",

        Vehicle: "🚗",

        Location: "📍",

        Phone: "📱",

        Device: "💻",

        Email: "📧",

        Organization: "🏢",

        Object: "🏠",

        Document: "📄",

        Evidence: "📸",

        Money: "💰",

        Drug: "💊"


    };





    const icon =

        data.icon ||

        icons[data.type || "Person"] ||

        "❓";







    return (


        <div className="simple-node">



            <Handle

                type="target"

                position={Position.Top}

            />





            <div className="big-node-icon">

                {icon}

            </div>




            <div className="node-name">

                {data.label}

            </div>










            <Handle

                type="source"

                position={Position.Bottom}

            />



        </div>


    );

}