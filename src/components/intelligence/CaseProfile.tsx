import {
    FiX,
    FiUsers,
    FiLink,
    FiActivity
} from "react-icons/fi";


interface Props {

    caseData: any;

    onClose: () => void;

}



export default function CaseProfile({

    caseData,

    onClose

}: Props) {



    const nodes = caseData.nodes || [];

    const edges = caseData.edges || [];





    const relations: any = {};



    edges.forEach((edge: any) => {



        const type =

            edge.data?.relationshipType ||

            "Related";



        relations[type] =

            (relations[type] || 0) + 1;



    });








    return (



        <div className="entity-overlay">





            <div className="entity-profile">





                <button

                    className="profile-close"

                    onClick={onClose}

                >

                    <FiX />

                </button>









                <div className="entity-main">





                    <div className="big-icon">

                        📁

                    </div>





                    <div>


                        <h1>


                            {

                                caseData.name ||

                                caseData.title ||

                                "Investigation"


                            }


                        </h1>





                        <span>

                            Case

                        </span>



                    </div>





                </div>














                <div className="stats">





                    <div>


                        <FiUsers />


                        <strong>

                            {nodes.length}

                        </strong>


                        <small>

                            Entities

                        </small>



                    </div>







                    <div>


                        <FiLink />


                        <strong>

                            {edges.length}

                        </strong>


                        <small>

                            Connections

                        </small>



                    </div>







                    <div>


                        <FiActivity />


                        <strong>

                            {

                                Object.keys(relations).length

                            }

                        </strong>


                        <small>

                            Relations

                        </small>



                    </div>





                </div>












                <section>


                    <h3>

                        👥 Entities

                    </h3>






                    <div className="case-grid">


                        {


                            nodes.map((node: any) => (


                                <div

                                    className="info-card"

                                    key={node.id}

                                >


                                    {

                                        node.data?.icon ||

                                        "❓"

                                    }


                                    {" "}


                                    {

                                        node.data?.label ||

                                        "Unknown"

                                    }



                                </div>



                            ))


                        }



                    </div>




                </section>












                <section>


                    <h3>

                        🔗 Relationships

                    </h3>






                    {


                        Object.entries(relations)

                            .map(([key, value]: any) => (



                                <div

                                    className="connection-card"

                                    key={key}

                                >



                                    <b>

                                        {key}

                                    </b>




                                    <span>

                                        {value}

                                    </span>




                                </div>



                            ))



                    }





                </section>









            </div>





        </div>


    );


}