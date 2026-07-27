import {
    useState
} from "react";


import type {
    CaseItem
} from "../../context/CaseContext";


import EditCaseModal from "./EditCaseModal";





interface Props {


    data: CaseItem;


    onDelete:
    (
        id: string
    ) => void;



    onOpen:
    (
        data: CaseItem
    ) => void;


}






export default function CaseCard({

    data,

    onDelete,

    onOpen


}: Props) {



    const [edit, setEdit] = useState(false);





    return (


        <>


            <div className="case-card">



                <div className="case-card-header">


                    <h4>

                        {data.title}

                    </h4>



                    <span className={
                        `status ${data.status}`
                    }>

                        {data.status}

                    </span>


                </div>





                <p>

                    {data.description ||
                        "No description"}

                </p>






                <div className="case-info">


                    <span>

                        Created:

                    </span>



                    <b>

                        {
                            new Date(
                                data.createdAt
                            )
                                .toLocaleDateString()
                        }

                    </b>


                </div>







                <div className="case-actions">



                    <button

                        onClick={() => onOpen(data)}

                    >

                        Open

                    </button>





                    <button

                        onClick={() => setEdit(true)}

                    >

                        Edit

                    </button>






                    <button

                        className="danger"

                        onClick={() =>
                            onDelete(data.id)
                        }

                    >

                        Delete

                    </button>



                </div>



            </div>





            {
                edit &&

                <EditCaseModal

                    data={data}

                    close={() => setEdit(false)}

                />

            }



        </>


    );


}