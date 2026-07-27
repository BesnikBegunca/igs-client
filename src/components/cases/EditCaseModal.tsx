import {
    useState
} from "react";


import {
    useCases
} from "../../context/CaseContext";


import type {
    CaseItem
} from "../../context/CaseContext";






interface Props {


    data: CaseItem;


    close: () => void;


}









export default function EditCaseModal({

    data,

    close

}: Props) {



    const {

        updateCase

    } = useCases();






    const [title, setTitle] =

        useState(
            data.title
        );




    const [description, setDescription] =

        useState(
            data.description
        );




    const [status, setStatus] =

        useState(
            data.status
        );









    function save() {



        updateCase(

            data.id,

            {

                title,

                description,

                status

            }

        );



        close();


    }









    return (


        <div className="modal-overlay">





            <div className="case-modal">





                <div className="modal-header">


                    <div>


                        <h3>

                            Edit Case

                        </h3>


                        <span>

                            Update investigation data

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


                        value={title}


                        onChange={e =>

                            setTitle(
                                e.target.value
                            )

                        }


                    />








                    <label>

                        Description

                    </label>



                    <textarea


                        value={description}


                        onChange={e =>

                            setDescription(
                                e.target.value
                            )

                        }


                    />









                    <label>

                        Status

                    </label>




                    <select


                        value={status}


                        onChange={e =>

                            setStatus(

                                e.target.value as
                                "open" |
                                "closed" |
                                "archived"

                            )

                        }


                    >



                        <option value="open">

                            Open

                        </option>




                        <option value="closed">

                            Closed

                        </option>





                        <option value="archived">

                            Archived

                        </option>



                    </select>





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


                        onClick={save}


                    >

                        Save Changes

                    </button>





                </div>







            </div>





        </div>


    );


}