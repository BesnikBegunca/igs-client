import PropertyField from "./PropertyField";


interface Props {

    node: any;

}




export default function EntityProfile({

    node

}: Props) {



    return (


        <>

            <div className="property-section-title">

                🧩 Entity Information

            </div>




            <div className="relationship-card">


                <span>
                    Type
                </span>


                <strong>

                    {node.data.icon}

                    {" "}

                    {node.data.type}

                </strong>


            </div>





            <PropertyField

                label="Name"

                value={
                    node.data.label || ""
                }

                placeholder="Entity name"

                onChange={() => { }}

            />





            <PropertyField

                label="Risk"

                value={
                    node.data.risk || ""
                }

                placeholder="Low"

                onChange={() => { }}

            />





            <PropertyField

                label="Description"

                value={
                    node.data.description || ""
                }

                placeholder="Notes..."

                onChange={() => { }}

            />




            <div className="property-section-title">

                📎 Attachments

            </div>



            <div className="attachments-box">


                {
                    node.data.attachments?.length === 0 &&

                    <p>
                        No attachments
                    </p>

                }



            </div>


        </>


    );


}