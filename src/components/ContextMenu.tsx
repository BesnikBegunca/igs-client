import "../styles/app.css";

interface Props {

    x: number;

    y: number;

    onDelete: () => void;

    onClose: () => void;

}



export default function ContextMenu({

    x,

    y,

    onDelete,

    onClose

}: Props) {



    return (

        <div

            className="context-menu"

            style={{

                top: y,

                left: x

            }}

            onMouseLeave={onClose}

        >


            <div className="menu-item">

                ✏️ Edit

            </div>


            <div

                className="menu-item delete"

                onClick={onDelete}

            >

                🗑 Delete

            </div>


            <div className="menu-item">

                🔗 Add Relationship

            </div>


            <div className="menu-item">

                👁 View Details

            </div>


        </div>

    );

}