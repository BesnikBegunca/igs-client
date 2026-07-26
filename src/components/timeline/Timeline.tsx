import { useGraph } from "../../context/GraphContext";





export default function Timeline() {


    const {

        events


    } = useGraph();






    return (

        <aside className="timeline-panel">


            <h3>

                📅 Timeline

            </h3>




            {
                events.length === 0 &&

                <p>

                    No events yet

                </p>

            }







            {
                events.map(event => (


                    <div

                        className="timeline-card"

                        key={event.id}

                    >


                        <strong>

                            {event.title}

                        </strong>



                        <p>

                            {event.description}

                        </p>



                        <small>

                            {
                                new Date(

                                    event.date

                                ).toLocaleString()

                            }

                        </small>



                    </div>


                ))

            }





        </aside>

    );

}