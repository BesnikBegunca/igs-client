import PropertyField from "./PropertyField";
import PropertyTextarea from "./PropertyTextarea";
import { relationships } from "../../data/relationships";


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




            <div className="property-field">

                <label>
                    Relationship Type
                </label>


                <div className="relationship-select">


                    <select

                        value={
                            edge.data?.relationshipType || "Related"
                        }

                        onChange={(e) =>

                            updateEdge(
                                "relationshipType",
                                e.target.value
                            )

                        }

                    >

                        {
                            relationships.map(item => (

                                <option

                                    key={item.name}

                                    value={item.name}

                                >

                                    {item.name}

                                </option>

                            ))
                        }


                    </select>




                    <div className="current-relationship-color">


                        <span

                            className="relationship-dot"

                            style={{

                                background:

                                    relationships.find(

                                        item =>

                                            item.name ===
                                            (edge.data?.relationshipType || "Related")

                                    )?.color

                            }}

                        />


                        {
                            edge.data?.relationshipType || "Related"
                        }


                    </div>


                </div>
            </div>






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