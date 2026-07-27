import {
    useState
} from "react";


import {
    useCases
} from "../../context/CaseContext";


import {
    useGraph
} from "../../context/GraphContext";


import CaseCard from "./CaseCard";


import CreateCaseModal from "./CreateCaseModal";






export default function CasesPanel() {



    const {

        cases,

        deleteCase

    } = useCases();




    const {

        openCase

    } = useGraph();





    const [search, setSearch] = useState("");



    const [showCreate, setShowCreate] = useState(false);






    const filteredCases =

        cases.filter(c =>


            (c.title ?? "")

                .toLowerCase()

                .includes(

                    search.toLowerCase()

                )


        );








    return (



        <div className="cases-panel">





            <div className="cases-header">


                <input

                    placeholder="Search cases..."

                    value={search}

                    onChange={e =>

                        setSearch(
                            e.target.value
                        )

                    }

                />





                <button

                    onClick={() =>

                        setShowCreate(true)

                    }

                >

                    +

                </button>



            </div>







            <div className="cases-list">


                {

                    filteredCases.length === 0

                        ?

                        <p className="empty-text">

                            No cases found

                        </p>


                        :

                        filteredCases.map(c => (


                            <CaseCard

                                key={c.id}

                                data={c}

                                onDelete={deleteCase}

                                onOpen={openCase}


                            />


                        ))


                }



            </div>








            {

                showCreate &&


                <CreateCaseModal

                    close={() => setShowCreate(false)}

                />


            }



        </div>



    );



}