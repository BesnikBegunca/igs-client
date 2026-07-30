import {
    useState
} from "react";


import {
    FiSearch,
    FiArrowRight,
    FiDatabase,
    FiGitBranch,
    FiShield
} from "react-icons/fi";


import {
    useGraph
} from "../context/GraphContext";


import {
    useCases
} from "../context/CaseContext";


import EntityProfile from "../components/intelligence/EntityProfile";

import CaseProfile from "../components/intelligence/CaseProfile";



interface Props {

    goConsole: () => void;

}









export default function LandingPage({

    goConsole

}: Props) {





    const {

        nodes,

        edges

    } = useGraph();






    const {

        cases

    } = useCases();








    const [

        search,

        setSearch

    ] = useState("");








    const [

        selectedResult,

        setSelectedResult

    ] = useState<any>(null);












    /*
        GET ALL ENTITIES FROM ALL CASES

    */


    const allEntities = [


        ...(nodes || []),



        ...(cases || []).flatMap(

            (item: any) =>

                item.nodes || []

        )


    ];












    /*
        REMOVE DUPLICATES

    */


    const uniqueEntities = Array.from(


        new Map(

            allEntities.map(

                (node: any) =>

                    [

                        node.id,

                        node

                    ]

            )

        ).values()


    );













    /*
        SEARCH ENTITIES FIRST

    */


    const entityResults = uniqueEntities

        .filter((node: any) => {


            if (!search.trim())

                return false;



            const text = JSON.stringify(

                node.data || {}

            ).toLowerCase();




            return text.includes(

                search.toLowerCase()

            );


        })


        .map((node: any) => (


            {

                id: node.id,

                data: node.data,

                original: node,

                resultType: "Entity"


            }


        ));














    /*
        SEARCH CASES

    */


    const caseResults = (cases || [])

        .filter((item: any) => {


            if (!search.trim())

                return false;



            const text = JSON.stringify(

                item

            ).toLowerCase();




            return text.includes(

                search.toLowerCase()

            );


        })


        .map((item: any) => (


            {

                id: item.id,

                data: item,

                original: item,

                resultType: "Case"


            }


        ));












    /*
        ENTITIES HAVE PRIORITY

    */


    const results = [


        ...entityResults,


        ...caseResults



    ].slice(0, 10);












    return (



        <div className="landing-page">






            <div className="landing-container">







                <div className="landing-logo">

                    🕵️

                </div>






                
                <h1>

                    IGS

                </h1>








                <h2>

                    Intelligence Graph System

                </h2>








                <p className="landing-description">


                    Investigate entities, discover hidden connections,
                    and analyze complex relationship networks.


                </p>













                <div className="landing-search">



                    <FiSearch />



                    <input



                        value={search}



                        onChange={(e) =>


                            setSearch(

                                e.target.value

                            )


                        }



                        placeholder="Search entity, person, vehicle..."



                    />



                </div>















                {

                    search.trim() && (



                        <div className="landing-results">







                            {


                                results.length === 0


                                    ?



                                    <div className="empty-result">


                                        No results found


                                    </div>



                                    :



                                    results.map(

                                        (item: any, index: number) => (



                                            <div



                                                key={

                                                    item.id ||

                                                    index

                                                }



                                                className="landing-result"



                                                onClick={() => {


                                                    setSelectedResult(item);


                                                }}



                                            >







                                                <div className="result-icon">



                                                    {


                                                        item.data?.icon ||



                                                        (

                                                            item.resultType === "Case"

                                                                ?

                                                                "📁"

                                                                :

                                                                "❓"

                                                        )



                                                    }



                                                </div>








                                                <div>



                                                    <strong>



                                                        {


                                                            item.data?.label ||


                                                            item.data?.name ||


                                                            item.data?.title ||


                                                            "Unknown"



                                                        }



                                                    </strong>








                                                    <small>


                                                        {

                                                            item.resultType

                                                        }


                                                    </small>







                                                </div>







                                            </div>



                                        )

                                    )


                            }







                        </div>



                    )

                }















                {
                    selectedResult && (

                        selectedResult.resultType === "Entity"

                            ?

                            <EntityProfile

                                entity={selectedResult}

                                onClose={() => setSelectedResult(null)}

                                onSelectEntity={(entity) => {

                                    setSelectedResult({

                                        id: entity.id,

                                        data: entity.data,

                                        resultType: "Entity"

                                    });

                                }}

                            />


                            :


                            <CaseProfile

                                caseData={selectedResult.original}

                                onClose={() => setSelectedResult(null)}

                            />


                    )
                }














                <button



                    className="console-btn"



                    onClick={goConsole}



                >



                    Go To Console



                    <FiArrowRight />



                </button>















                <div className="landing-features">







                    <div className="feature-card">


                        <FiDatabase />


                        <h3>

                            Cases

                        </h3>


                        <p>

                            Manage investigations

                        </p>


                    </div>









                    <div className="feature-card">


                        <FiGitBranch />


                        <h3>

                            Graph Analysis

                        </h3>


                        <p>

                            Explore relationships

                        </p>


                    </div>









                    <div className="feature-card">


                        <FiShield />


                        <h3>

                            Intelligence

                        </h3>


                        <p>

                            Connect evidence

                        </p>


                    </div>






                </div>









            </div>






        </div>


    );

}