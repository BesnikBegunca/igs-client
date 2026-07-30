import {
    FiBell,
    FiAlertTriangle
} from "react-icons/fi";


import {
    useState
} from "react";


import {
    useAlerts
} from "../../context/AlertContext";





interface Props {

    onSelectEntity: (entity: any) => void;

}







export default function AlertNotification({

    onSelectEntity

}: Props) {





    const {

        alerts,

        markRead

    } = useAlerts();






    const [open, setOpen] = useState(false);






    const unread = alerts.filter(

        (item: any) => !item.read

    ).length;









    return (

        <div className="alert-wrapper">





            <button

                className="alert-button"

                onClick={() => setOpen(!open)}

                title="Alerts"

            >


                <FiBell />


                {
                    unread > 0 && (

                        <span className="alert-badge">

                            {unread}

                        </span>

                    )
                }


            </button>









            {
                open && (


                    <div className="alert-menu">



                        <h3>

                            🚨 Intelligence Alerts

                        </h3>






                        {
                            alerts.length === 0 ? (


                                <p className="no-alert">

                                    No alerts

                                </p>


                            ) : (


                                alerts.map((alert: any) => (



                                    <div

                                        key={alert.id}

                                        className={

                                            alert.read

                                                ?

                                                "alert-item"

                                                :

                                                "alert-item active"

                                        }



                                        onClick={() => {


                                            markRead(

                                                alert.id

                                            );



                                            if (alert.entity) {

                                                onSelectEntity(

                                                    alert.entity

                                                );

                                            }


                                        }}


                                    >



                                        <FiAlertTriangle />




                                        <div>



                                            <b>

                                                New Connection

                                            </b>





                                            <p>

                                                {
                                                    alert.entity?.data?.label
                                                }


                                                {" → "}


                                                {
                                                    alert.connection
                                                }


                                            </p>





                                            <small>

                                                {
                                                    alert.relationship
                                                }

                                            </small>




                                        </div>




                                    </div>



                                ))

                            )
                        }





                    </div>


                )
            }







        </div>

    );

}