import { useState } from "react";

import {
    getCases,
    saveNewCase,
    deleteCase
} from "../../services/storageService";

import type {
    CaseData
} from "../../services/storageService";

import { useGraph } from "../../context/GraphContext";







export default function CasesPanel() {



    const {

        nodes,

        edges,

        setNodes,

        setEdges,

        setSelectedCase


    } = useGraph();









    const [cases, setCases] = useState<CaseData[]>(

        getCases()

    );






    const [caseName, setCaseName] = useState("");









    const createCase = () => {



        if (!caseName.trim()) {

            return;

        }







        const newCase: CaseData = {



            id: Date.now().toString(),



            name: caseName,



            nodes,



            edges,



            createdAt: new Date().toISOString(),



            status: "Open"



        };








        saveNewCase(

            newCase

        );






        setCases(

            getCases()

        );






        setCaseName("");



    };









    const removeCase = (

        id: string

    ) => {



        deleteCase(id);




        setCases(

            getCases()

        );



    };









    const openCase = (

        item: CaseData

    ) => {



        setNodes(

            item.nodes

        );




        setEdges(

            item.edges

        );





        setSelectedCase(

            item

        );



    };












    return (



        <aside className="cases-panel">






            <h3>

                📁 Cases

            </h3>









            <input


                placeholder="Case name..."


                value={caseName}



                onChange={(e) =>

                    setCaseName(

                        e.target.value

                    )

                }


            />









            <button

                onClick={createCase}

            >

                ➕ New Case

            </button>









            <div className="case-list">





                {

                    cases.map((item) => (




                        <div


                            className="case-card"


                            key={item.id}



                        >





                            <h4>

                                {item.name}

                            </h4>







                            <p>

                                Status: {item.status}

                            </p>







                            <small>

                                {
                                    new Date(

                                        item.createdAt

                                    ).toLocaleDateString()

                                }

                            </small>









                            <div>



                                <button


                                    onClick={() =>


                                        openCase(item)

                                    }


                                >

                                    Open

                                </button>









                                <button


                                    onClick={() =>


                                        removeCase(

                                            item.id

                                        )

                                    }


                                >

                                    Delete

                                </button>





                            </div>








                        </div>




                    ))

                }





            </div>







        </aside>


    );

}