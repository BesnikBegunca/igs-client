import {
    useState
} from "react";

import {
    useCases
} from "../../context/CaseContext";


interface Props {

    close: () => void;

}



export default function CreateCaseModal({

    close

}: Props) {



    const {
        addCase
    } = useCases();




    const [title, setTitle] = useState("");

    const [description, setDescription] = useState("");






    function submit() {



        if (!title.trim())

            return;



        addCase({

            title,

            description,

            status: "open"

        });



        close();

    }






    return (

        <div className="modal-overlay">


            <div className="case-modal">



                <div className="modal-header">


                    <div>

                        <h3>
                            Create New Case
                        </h3>

                        <span>
                            Investigation Management
                        </span>

                    </div>



                    <button

                        className="modal-close"

                        onClick={close}

                    >

                        ×

                    </button>


                </div>






                <div className="modal-content">


                    <label>
                        Case Title
                    </label>


                    <input

                        placeholder="Enter case title..."

                        value={title}

                        onChange={
                            e => setTitle(
                                e.target.value
                            )
                        }

                    />





                    <label>
                        Description
                    </label>



                    <textarea

                        placeholder="Enter investigation description..."

                        value={description}

                        onChange={
                            e => setDescription(
                                e.target.value
                            )
                        }

                    />



                </div>







                <div className="modal-actions">


                    <button

                        className="cancel-btn"

                        onClick={close}

                    >

                        Cancel

                    </button>




                    <button

                        className="create-btn"

                        onClick={submit}

                    >

                        Create Case

                    </button>


                </div>




            </div>


        </div>

    );

}