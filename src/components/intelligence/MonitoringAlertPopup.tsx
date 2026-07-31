
import {
    FiAlertTriangle,
    FiX
} from "react-icons/fi";

import {
    useAlerts
} from "../../context/AlertContext";


interface Props {

    onSelectEntity?: (entity: any) => void;

}


export default function MonitoringAlertPopup({

    onSelectEntity

}: Props) {


    const {

        activeAlert,

        closeAlert,

        markRead

    } = useAlerts();


    if (!activeAlert) {

        return null;

    }


    const handleClose = () => {


        markRead(activeAlert.id);

        closeAlert();

    };


    const handleOpenEntity = () => {


        markRead(activeAlert.id);


        if (

            activeAlert.entity &&
            onSelectEntity

        ) {

            onSelectEntity(
                activeAlert.entity
            );

        }


        closeAlert();

    };


    return (


        <div className="monitor-alert-overlay">


            <div className="monitor-alert-popup">


                <button

                    className="monitor-alert-close"

                    onClick={handleClose}

                >

                    <FiX />

                </button>


                <div className="monitor-alert-icon">

                    <FiAlertTriangle />

                </div>


                <div className="monitor-alert-status">

                    MONITORING ALERT

                </div>


                <h2>

                    New Intelligence Activity

                </h2>


                <p className="monitor-alert-message">

                    A monitored entity has established
                    a new relationship.

                </p>


                <div className="monitor-alert-connection">


                    <div>

                        <span>

                            MONITORED ENTITY

                        </span>


                        <strong>

                            {
                                activeAlert.entity
                                    ?.data
                                    ?.label ||
                                "Unknown Entity"
                            }

                        </strong>

                    </div>


                    <div className="monitor-alert-arrow">

                        →

                    </div>


                    <div>

                        <span>

                            CONNECTED TO

                        </span>


                        <strong>

                            {
                                activeAlert.connection ||
                                "Unknown Entity"
                            }

                        </strong>

                    </div>


                </div>


                <div className="monitor-alert-meta">


                    <div>

                        <span>
                            RELATIONSHIP
                        </span>

                        <strong>

                            {
                                activeAlert.relationship ||
                                "New Connection"
                            }

                        </strong>

                    </div>


                    <div>

                        <span>
                            STATUS
                        </span>

                        <strong className="alert-live">

                            ● LIVE

                        </strong>

                    </div>


                </div>


                <div className="monitor-alert-actions">


                    <button

                        className="monitor-alert-ok"

                        onClick={handleClose}

                    >

                        OK

                    </button>


                    {

                        activeAlert.entity && (

                            <button

                                className="monitor-alert-view"

                                onClick={handleOpenEntity}

                            >

                                VIEW ENTITY

                            </button>

                        )

                    }


                </div>


            </div>


        </div>

    );

}

