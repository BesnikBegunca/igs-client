import {
    useCases
} from "../../context/CaseContext";


import {
    useGraph
} from "../../context/GraphContext";



export default function TopHeader() {



    const {
        activeCase
    } = useCases();



    const {
        nodes,
        edges
    } = useGraph();





    return (


        <header className="top-header">



            {/* LEFT */}

            <div className="header-left">


                <div className="header-logo">

                    I

                </div>



                <div className="header-title">


                    <strong>

                        IGS

                    </strong>


                    <span>

                        Intelligence Graph System

                    </span>


                </div>


            </div>








            {/* CENTER */}


            <div className="header-case">


                {
                    activeCase

                    ?

                    <>


                    <div>


                        <strong>

                            {activeCase.title}

                        </strong>


                        <span>

                            Case Workspace

                        </span>


                    </div>



                    <span

                    className="case-status"

                    >

                        {activeCase.status}

                    </span>


                    </>


                    :


                    <span className="no-case">

                        No active case

                    </span>


                }



            </div>









            {/* RIGHT */}


            <div className="header-actions">



                <div className="graph-stats">


                    <span>

                        Nodes

                    </span>


                    <b>

                        {nodes.length}

                    </b>


                </div>





                <div className="graph-stats">


                    <span>

                        Relations

                    </span>


                    <b>

                        {edges.length}

                    </b>


                </div>






                <button

                className="header-button"

                >

                    🔍

                </button>




                <button

                className="header-button"

                >

                    ⚙

                </button>



            </div>




        </header>


    );

}