import {
    createContext,
    useContext,
    useState
} from "react";


const AlertContext = createContext<any>(null);



export function AlertProvider({

    children

}: any) {


    const [alerts, setAlerts] = useState<any[]>([]);





    const addAlert = (alert: any) => {


        setAlerts(prev => [

            {

                id: Date.now(),

                read: false,

                createdAt: new Date(),

                ...alert

            },

            ...prev

        ]);

    };







    const markRead = (id: number) => {


        setAlerts(prev =>

            prev.map(item =>

                item.id === id

                    ?

                    {

                        ...item,

                        read: true

                    }

                    :

                    item

            )

        );


    };







    return (

        <AlertContext.Provider

            value={{

                alerts,

                addAlert,

                markRead

            }}

        >

            {children}


        </AlertContext.Provider>


    );


}






export function useAlerts() {

    return useContext(AlertContext);

}