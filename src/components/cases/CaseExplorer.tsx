import {
    useState
} from "react";

import {
    getCases,
    deleteCase
} from "../../services/storageService";

import type {
    CaseData
} from "../../services/storageService";

import {
    useGraph
} from "../../context/GraphContext";



export default function CaseExplorer() {


    const {

        setNodes,
        setEdges,
        selectedCase,
        setSelectedCase

    } = useGraph();



    const [cases, setCases] =
        useState<CaseData[]>(
            getCases()
        );





    const createCase = () => {


        const newCase: CaseData = {

            id: Date.now().toString(),

            name:
                `New Investigation ${cases.length + 1}`,

            nodes: [],

            edges: [],

            status: "Open",

            createdAt:
                new Date().toISOString()

        };



        localStorage.setItem(

            "cases",

            JSON.stringify([
                ...cases,
                newCase
            ])

        );


        setCases([
            ...cases,
            newCase
        ]);


        setSelectedCase(newCase);


    };






    const openCase = (item: CaseData) => {


        setNodes(item.nodes);

        setEdges(item.edges);

        setSelectedCase(item);

    };







    const removeCase = (id: string) => {


        deleteCase(id);


        setCases(
            getCases()
        );


    };






    return (


        <section className="case-explorer">



            <div className="case-header">


                <div>

                    <h4>
                        CASE MANAGEMENT
                    </h4>

                    <span>
                        Investigation Workspace
                    </span>

                </div>



                <button

                    onClick={createCase}

                >

                    +
                </button>


            </div>








            {
                cases.length === 0 ?


                    (

                        <div className="empty-case">


                            <div className="empty-icon">

                                📁

                            </div>


                            <h3>

                                No Active Cases

                            </h3>


                            <p>

                                Create a new investigation
                                workspace

                            </p>



                            <button

                                onClick={createCase}

                            >

                                Create Case

                            </button>


                        </div>


                    )

                    :


                    (

                        <div className="case-grid">


                            {
                                cases.map(item => (


                                    <div


                                        key={item.id}


                                        className={

                                            selectedCase?.id === item.id

                                                ?

                                                "case-card active"

                                                :

                                                "case-card"

                                        }



                                        onClick={() => openCase(item)}

                                    >



                                        <div className="case-title">


                                            <span>

                                                📂

                                            </span>


                                            <strong>

                                                {item.name}

                                            </strong>


                                        </div>




                                        <span className="status">


                                            {item.status}


                                        </span>





                                        <div className="case-stats">


                                            <div>

                                                👤
                                                {item.nodes.length}

                                            </div>


                                            <div>

                                                🔗
                                                {item.edges.length}

                                            </div>


                                        </div>





                                        <small>

                                            {
                                                new Date(
                                                    item.createdAt
                                                )
                                                    .toLocaleDateString()
                                            }

                                        </small>




                                        <button

                                            onClick={(e) => {

                                                e.stopPropagation();

                                                removeCase(item.id);

                                            }}

                                        >

                                            Delete

                                        </button>



                                    </div>


                                ))

                            }


                        </div>


                    )


            }



        </section>


    );

}