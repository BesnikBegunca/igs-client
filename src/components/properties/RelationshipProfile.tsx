import PropertyField from "./PropertyField";
import PropertyTextarea from "./PropertyTextarea";


interface Props {

    edge: any;

    updateEdge: (field: string, value: any) => void;

}



export default function RelationshipProfile({

    edge,

    updateEdge

}: Props) {


    return (

        <>


            <div className="property-section-title">

                🔗 Relationship Information

            </div>




            <PropertyField

                label="Relationship Type"

                value={
                    edge.data?.relationshipType || ""
                }

                placeholder="Owner / Friend / Connected"

                onChange={(value) =>

                    updateEdge(
                        "relationshipType",
                        value
                    )

                }

            />






            <PropertyField

                label="Evidence"

                value={
                    edge.data?.evidence || ""
                }

                placeholder="Document / Photo / Report"

                onChange={(value) =>

                    updateEdge(
                        "evidence",
                        value
                    )

                }

            />







            <PropertyField

                label="Date"

                value={
                    edge.data?.date || ""
                }

                placeholder="2026-07-27"

                onChange={(value) =>

                    updateEdge(
                        "date",
                        value
                    )

                }

            />







            <PropertyTextarea

                label="Description"

                value={
                    edge.data?.description || ""
                }

                placeholder="Relationship notes..."

                onChange={(value) =>

                    updateEdge(
                        "description",
                        value
                    )

                }

            />



        </>

    );

}