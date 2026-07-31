import {
    createContext,
    useContext,
    useState
} from "react";


const MonitorContext = createContext<any>(null);


export function MonitorProvider({

    children

}: any) {


    const [monitoredEntities, setMonitoredEntities] =
        useState<any[]>([]);


    const toggleMonitor = (entity: any) => {

        setMonitoredEntities(prev => {

            const exists = prev.some(

                item =>
                    item.id === entity.id

            );


            if (exists) {

                return prev.filter(

                    item =>
                        item.id !== entity.id

                );

            }


            return [

                ...prev,

                entity

            ];

        });

    };


    return (

        <MonitorContext.Provider

            value={{

                monitoredEntities,
                toggleMonitor

            }}

        >

            {children}

        </MonitorContext.Provider>

    );

}


export function useMonitor() {

    return useContext(MonitorContext);

}