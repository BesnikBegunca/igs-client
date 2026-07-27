import {
    useGraph
} from "../../context/GraphContext";



export default function Timeline() {



    const {

        events

    } = useGraph();





    return (


        <div className="timeline">





            <div className="property-section-title">

                📅 Investigation Timeline

            </div>








            {
                (!events || events.length === 0) &&


                <p className="empty-text">

                    No events yet

                </p>

            }









            {
                events?.map(event => (



                    <div

                        key={event.id}

                        className="timeline-item"

                    >





                        <div className="timeline-dot">

                        </div>









                        <div className="timeline-content">





                            <h4>

                                {event.title || "Event"}

                            </h4>






                            <p>

                                {
                                    event.description ||
                                    "No description"
                                }

                            </p>









                            <small>

                                {

                                    event.date

                                        ?

                                        new Date(

                                            event.date

                                        )
                                            .toLocaleString()

                                        :

                                        "Unknown date"

                                }

                            </small>





                        </div>





                    </div>



                ))

            }





        </div>


    );

}