import ToolboxItem from "./ToolboxItem";


export default function Toolbox() {

    const items = [
        {
            type: "Person",
            icon: "👤"
        },
        {
            type: "Vehicle",
            icon: "🚗"
        },
        {
            type: "Location",
            icon: "📍"
        },
        {
            type: "Phone",
            icon: "📱"
        },
        {
            type: "Drug",
            icon: "💊"
        },
        {
            type: "Weapon",
            icon: "🔫"
        },
        {
            type: "Money",
            icon: "💰"
        },
        {
            type: "Organization",
            icon: "🏢"
        },
        {
            type: "Document",
            icon: "📄"
        }
    ];


    return (
        <div className="toolbox">

            <h3>Entities</h3>

            {
                items.map(item => (
                    <ToolboxItem
                        key={item.type}
                        type={item.type}
                        icon={item.icon}
                    />
                ))
            }

        </div>
    );
}