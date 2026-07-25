import { Handle, Position } from "@xyflow/react";


interface NodeData {
    label: string;
    type?: string;
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
        Drug: "💊",
        Weapon: "🔫",
        Money: "💰",
        Organization: "🏢",
        Document: "📄"

    };


    return (

        <div className="custom-node">


            <Handle
                type="target"
                position={Position.Top}
            />


            <div className="node-header">

                <span>
                    {icons[data.type || "Person"]}
                </span>

                <strong>
                    {data.type || "Person"}
                </strong>

            </div>



            <div className="node-body">

                <p>
                    {data.label}
                </p>

                <small>
                    ID: 001
                </small>


            </div>



            <Handle
                type="source"
                position={Position.Bottom}
            />


        </div>

    );
}