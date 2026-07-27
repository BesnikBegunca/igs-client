import {
    createContext,
    useContext,
    useState
} from "react";


import type {
    ReactNode
} from "react";


import type {
    CaseItem
} from "./CaseContext";







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






    selectedEdge: any;

    setSelectedEdge: React.Dispatch<
        React.SetStateAction<any>
    >;








    selectedCase: CaseItem | null;


    setSelectedCase: React.Dispatch<
        React.SetStateAction<CaseItem | null>
    >;







    openCase:

    (

        item: CaseItem

    ) => void;







    clearCase:

    () => void;








    events: any[];

    setEvents: React.Dispatch<
        React.SetStateAction<any[]>
    >;







    addEvent:

    (

        event: any

    ) => void;








    deleteNode:

    (

        id: string

    ) => void;



}









const GraphContext =

    createContext<GraphContextType | null>(null);











export function GraphProvider({

    children

}: {

    children: ReactNode;

}) {







    const [nodes, setNodes] =

        useState<any[]>([]);







    const [edges, setEdges] =

        useState<any[]>([]);








    const [selectedNode, setSelectedNode] =

        useState<any>(null);








    const [selectedEdge, setSelectedEdge] =

        useState<any>(null);








    const [selectedCase, setSelectedCase] =

        useState<CaseItem | null>(null);













    // OPEN CASE

    const openCase = (

        item: CaseItem

    ) => {



        setSelectedCase(item);



        setNodes(

            item.nodes ?? []

        );



        setEdges(

            item.edges ?? []

        );



        setSelectedNode(null);


        setSelectedEdge(null);



    };












    // CLEAR CASE

    const clearCase = () => {


        setSelectedCase(null);


        setNodes([]);


        setEdges([]);


        setSelectedNode(null);


        setSelectedEdge(null);



    };














    // TIMELINE EVENTS

    const [events, setEvents] =

        useState<any[]>([]);









    const addEvent = (

        event: any

    ) => {



        setEvents(prev => [


            {

                id:

                    Date.now().toString(),


                date:

                    new Date().toISOString(),


                ...event


            },


            ...prev


        ]);



    };














    // DELETE NODE

    const deleteNode = (

        id: string

    ) => {



        // remove node

        setNodes(prev =>


            prev.filter(

                node =>

                    node.id !== id

            )


        );






        // remove connected relationships

        setEdges(prev =>


            prev.filter(

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







        if (

            selectedEdge?.source === id ||

            selectedEdge?.target === id

        ) {


            setSelectedEdge(null);


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



                selectedEdge,

                setSelectedEdge,



                selectedCase,

                setSelectedCase,



                openCase,



                clearCase,



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


    const context =

        useContext(GraphContext);





    if (!context) {


        throw new Error(

            "useGraph must be used inside GraphProvider"

        );


    }






    return context;



}