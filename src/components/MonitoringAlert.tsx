interface Props {

    entityName: string;

    onClose: () => void;

}


export default function MonitoringAlert({

    entityName,

    onClose

}: Props) {


    return (

        <div className="monitoring-alert">

            <div className="monitoring-alert-header">

                <span className="monitoring-alert-icon">
                    🚨
                </span>

                <span>
                    MONITORING ALERT
                </span>

            </div>


            <div className="monitoring-alert-body">

                <strong>
                    {entityName}
                </strong>

                <p>
                    A new relationship has been detected
                    involving this monitored entity.
                </p>

            </div>


            <button

                className="monitoring-alert-close"

                onClick={onClose}

            >

                Dismiss

            </button>

        </div>

    );

}