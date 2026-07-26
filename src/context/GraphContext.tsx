import {
    createContext,
    useContext,
    useState,
} from "react";

import type { ReactNode } from "react";





interface GraphContextType {



    nodes: any[];

    setNodes: React.Dispatch<
        React.SetStateAction<any[]>
    >;




    edges: any[];

    setEdges: React.Dispatch<
        React.SetStateAction<any[]>
    >;




    selectedNode: any;

    setSelectedNode: React.Dispatch<
        React.SetStateAction<any>
    >;




    selectedCase: any;

    setSelectedCase: React.Dispatch<
        React.SetStateAction<any>
    >;




    events: any[];

    setEvents: React.Dispatch<
        React.SetStateAction<any[]>
    >;




    addEvent: (

        event: any

    ) => void;





    deleteNode: (

        id: string

    ) => void;


}









const GraphContext =

    createContext<GraphContextType | null>(null);









export function GraphProvider({

    children,

}: {

    children: ReactNode;

}) {








    const [nodes, setNodes] = useState<any[]>([



        {

            id: "1",

            position: {
                x: 100,
                y: 100
            },


            data: {

                label: "Fisteku",

                type: "Person",

                description: "",

                risk: "Low"

            },


            type: "custom"


        },





        {

            id: "2",

            position: {
                x: 450,
                y: 250
            },


            data: {

                label: "BMW X5",

                type: "Vehicle",

                description: "",

                risk: "Low"

            },


            type: "custom"


        }



    ]);









    const [edges, setEdges] = useState<any[]>([



        {

            id: "e1-2",

            source: "1",

            target: "2",

            type: "custom",


            data: {

                label: "Owns"

            }


        }



    ]);









    const [selectedNode, setSelectedNode] =

        useState<any>(null);








    const [selectedCase, setSelectedCase] =

        useState<any>(null);








    // TIMELINE EVENTS

    const [events, setEvents] =

        useState<any[]>([]);









    // ADD TIMELINE EVENT

    const addEvent = (

        event: any

    ) => {


        setEvents((events) => [


            {

                id: Date.now().toString(),

                date: new Date().toISOString(),

                ...event

            },


            ...events


        ]);


    };









    // DELETE NODE + RELATIONSHIPS

    const deleteNode = (

        id: string

    ) => {



        setNodes((nodes) =>


            nodes.filter(

                node => node.id !== id

            )


        );







        setEdges((edges) =>


            edges.filter(

                edge =>

                    edge.source !== id &&

                    edge.target !== id

            )


        );








        addEvent({


            title: "Entity Deleted",


            description:

                `Entity ${id} removed from graph`


        });








        if (selectedNode?.id === id) {


            setSelectedNode(null);


        }


    };












    return (



        <GraphContext.Provider

            value={{



                nodes,

                setNodes,



                edges,

                setEdges,



                selectedNode,

                setSelectedNode,



                selectedCase,

                setSelectedCase,



                events,

                setEvents,



                addEvent,



                deleteNode



            }}

        >


            {children}


        </GraphContext.Provider>


    );

}









export function useGraph() {



    const context = useContext(

        GraphContext

    );






    if (!context) {


        throw new Error(

            "useGraph must be used inside GraphProvider"

        );


    }






    return context;


}