import {
    FiBell,
    FiX,
    FiAlertTriangle
} from "react-icons/fi";


import {
    useAlerts
} from "../../context/AlertContext";




interface Props {

    onSelectEntity: (entity: any) => void;

}







export default function AlertPanel({

    onSelectEntity

}: Props) {





    const {

        alerts,

        markRead

    } = useAlerts();








    return (


        <div className="alert-panel">






            <div className="alert-header">


                <h2>

                    <FiBell />

                    Intelligence Alerts

                </h2>



                <span>

                    {alerts.length}

                </span>


            </div>








            <div className="alert-list">






                {

                    alerts.length === 0

                        ?


                        <p className="no-alert">

                            No alerts detected

                        </p>



                        :



                        alerts.map((alert: any) => (




                            <div


                                key={alert.id}


                                className={

                                    alert.read

                                        ?

                                        "alert-card"

                                        :

                                        "alert-card unread"

                                }



                                onClick={() => {


                                    markRead(alert.id);



                                    if (alert.entity) {

                                        onSelectEntity(

                                            alert.entity

                                        );

                                    }


                                }}



                            >





                                <FiAlertTriangle />





                                <div>



                                    <strong>

                                        New Connection

                                    </strong>



                                    <p>


                                        {

                                            alert.entity?.data?.label

                                        }


                                        {" connected with "}



                                        {

                                            alert.connection

                                        }



                                    </p>



                                    <small>


                                        Relationship:

                                        {" "}

                                        {

                                            alert.relationship

                                        }


                                    </small>



                                </div>





                            </div>




                        ))

                }






            </div>







        </div>



    );



}