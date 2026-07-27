import { useGraph } from "../../context/GraphContext";


export default function ActiveCaseHeader() {


    const {
        selectedCase,
        nodes,
        edges
    } = useGraph();



    if (!selectedCase)
        return null;



    return (

        <div className="active-case-header">


            <div className="case-main-info">


                <div className="case-icon">
                    📁
                </div>



                <div>


                    <div className="case-title-row">

                        <h2>
                            {selectedCase.title}
                        </h2>


                        <span className="case-status-badge">
                            {selectedCase.status}
                        </span>


                    </div>



                    <p>
                        {selectedCase.description ||
                            "No description"}
                    </p>


                </div>


            </div>





            <div className="case-metrics">


                <div>
                    <span>Entities</span>
                    <b>{nodes.length}</b>
                </div>


                <div>
                    <span>Relations</span>
                    <b>{edges.length}</b>
                </div>


                <div>
                    <span>Created</span>
                    <b>
                        {
                            new Date(
                                selectedCase.createdAt
                            )
                                .toLocaleDateString()
                        }
                    </b>
                </div>


            </div>



        </div>

    );

}