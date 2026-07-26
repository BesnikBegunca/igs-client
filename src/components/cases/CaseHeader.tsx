import { useGraph } from "../../context/GraphContext";





export default function CaseHeader() {



    const {

        selectedCase,

        nodes,

        edges


    } = useGraph();






    if (!selectedCase) {


        return (

            <div className="case-header empty">

                <h3>

                    📁 No Case Selected

                </h3>


                <p>

                    Open a case to start investigation

                </p>


            </div>

        );


    }








    return (



        <div className="case-header">





            <div className="case-title">


                <h2>

                    📁 {selectedCase.name}

                </h2>



                <span>

                    Status: {selectedCase.status}

                </span>


            </div>









            <div className="case-info">



                <div>

                    <strong>

                        Entities

                    </strong>


                    <p>

                        {nodes.length}

                    </p>


                </div>







                <div>


                    <strong>

                        Relationships

                    </strong>


                    <p>

                        {edges.length}

                    </p>


                </div>







                <div>


                    <strong>

                        Created

                    </strong>


                    <p>

                        {
                            new Date(

                                selectedCase.createdAt

                            ).toLocaleDateString()

                        }

                    </p>


                </div>





            </div>







        </div>


    );

}