import {
    Handle,
    Position
} from "@xyflow/react";


import {
    useGraph
} from "../../context/GraphContext";



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







export default function CustomNode({

    data

}: Props) {



    const {

        searchTerm

    } = useGraph();









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









    const search =

        searchTerm.toLowerCase();








    const isMatch =


        search === "" ||


        data.label

            ?.toLowerCase()

            .includes(search)

        ||


        data.type

            ?.toLowerCase()

            .includes(search);









    const riskClass =


        data.risk

            ?.toLowerCase()

        ||

        "low";









    return (



        <div



            className={

                `simple-node ${riskClass}`

            }



            style={{




                opacity:

                    isMatch

                        ? 1

                        : 0.25,





                transform:

                    isMatch && searchTerm

                        ? "scale(1.08)"

                        : "scale(1)",





                boxShadow:

                    isMatch && searchTerm

                        ?

                        "0 0 20px rgba(255,138,0,.45)"

                        :

                        "none"



            }}



        >






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