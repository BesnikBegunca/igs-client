interface Props {
    type: string;
    icon: string;
}


export default function ToolboxItem({ type, icon }: Props) {


    const onDragStart = (
        event: React.DragEvent<HTMLDivElement>,
        nodeType: string
    ) => {

        event.dataTransfer.setData(
            "application/reactflow",
            nodeType
        );

        event.dataTransfer.effectAllowed = "move";
    };



    return (

        <div

            className="toolbox-item"

            draggable={true}

            onDragStart={(event) =>
                onDragStart(event, type)
            }

        >

            <span>
                {icon}
            </span>


            <p>
                {type}
            </p>


        </div>

    );

}