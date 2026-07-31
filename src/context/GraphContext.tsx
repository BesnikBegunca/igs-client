
import {
    createContext,
    useContext,
    useState,
    useEffect
} from "react";


import type {
    ReactNode
} from "react";


import type {
    CaseItem
} from "./CaseContext";


import {
    useCases
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


    // ==============================
    // ENTITY REGISTRY
    // ==============================

    entityRegistry: any[];

    registerEntity: (entity: any) => any;

    findEntityByName: (name: string) => any;


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


    openCase: (item: CaseItem) => void;

    clearCase: () => void;


    events: any[];

    setEvents: React.Dispatch<
        React.SetStateAction<any[]>
    >;


    addEvent: (event: any) => void;


    deleteNode: (id: string) => void;

    deleteEdge: (id: string) => void;


    // ==============================
    // SEARCH
    // ==============================

    searchTerm: string;

    setSearchTerm: React.Dispatch<
        React.SetStateAction<string>
    >;

}





const GraphContext =
    createContext<GraphContextType | null>(null);







export function GraphProvider({

    children

}: {

    children: ReactNode;

}) {



    // ==============================
    // GRAPH STATE
    // ==============================

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


    const [events, setEvents] =
        useState<any[]>([]);


    // ==============================
    // ENTITY REGISTRY
    // ==============================

    const [entityRegistry, setEntityRegistry] =
        useState<any[]>([]);


    // ==============================
    // SEARCH STATE
    // ==============================

    const [searchTerm, setSearchTerm] =
        useState<string>("");


    const {
        updateCase
    } = useCases();





    // ==============================
    // REGISTER ENTITY
    // ==============================

    const registerEntity = (entity: any) => {


        if (!entity?.name) {

            return null;

        }


        const normalizedName =

            String(entity.name)
                .trim()
                .toLowerCase();


        const normalizedType =

            String(entity.type ?? "")
                .trim()
                .toLowerCase();



        // ==============================
        // CHECK IF ENTITY ALREADY EXISTS
        // ==============================

        const existing = entityRegistry.find(

            item =>

                String(item.name)
                    .trim()
                    .toLowerCase()

                ===

                normalizedName

                &&

                String(item.type ?? "")
                    .trim()
                    .toLowerCase()

                ===

                normalizedType

        );



        if (existing) {

            return existing;

        }



        // ==============================
        // CREATE MASTER ENTITY
        // ==============================

        const newEntity = {


            id:

                entity.id ??

                `entity - ${Date.now()} -${Math.random()
                    .toString(36)
                    .substring(2, 8)
                } `,


            name:

                entity.name,


            type:

                entity.type ?? "Unknown",


            category:

                entity.category ?? "Unknown",


            icon:

                entity.icon ?? "❓",


            attributes:

                entity.attributes ?? {},


            createdAt:

                entity.createdAt ??

                new Date().toISOString()

        };



        setEntityRegistry(prev => [


            ...prev,


            newEntity


        ]);



        return newEntity;

    };





    // ==============================
    // FIND ENTITY
    // ==============================

    const findEntityByName = (

        name: string

    ) => {


        if (!name?.trim()) {

            return undefined;

        }



        const normalizedName =

            name
                .trim()
                .toLowerCase();



        return entityRegistry.find(

            item =>

                String(item.name)
                    .trim()
                    .toLowerCase()

                ===

                normalizedName

        );

    };





    // ==============================
    // REGISTER EXISTING CASE NODES
    // ==============================

    const registerCaseEntities = (

        caseNodes: any[]

    ) => {


        if (!caseNodes?.length) {

            return;

        }



        caseNodes.forEach(node => {


            const data = node?.data ?? {};


            registerEntity({


                id:

                    node.id,


                name:

                    data.label ??
                    data.name ??
                    "Unknown Entity",


                type:

                    data.type ??
                    "Unknown",


                category:

                    data.category ??
                    "Unknown",


                icon:

                    data.icon ??
                    "❓",


                attributes:

                    data.attributes ??
                    {}

            });


        });

    };





    // ==============================
    // OPEN CASE
    // ==============================

    const openCase = (

        item: CaseItem

    ) => {


        setSelectedCase(item);



        const caseNodes =

            item.nodes ?? [];


        const caseEdges =

            item.edges ?? [];


        const caseEvents =

            item.events ?? [];



        setNodes(caseNodes);


        setEdges(caseEdges);


        setEvents(caseEvents);



        // Register all existing entities

        registerCaseEntities(

            caseNodes

        );



        setSelectedNode(null);


        setSelectedEdge(null);


        setSearchTerm("");

    };





    // ==============================
    // CLEAR CASE
    // ==============================

    const clearCase = () => {


        setSelectedCase(null);


        setNodes([]);


        setEdges([]);


        setEvents([]);


        setSelectedNode(null);


        setSelectedEdge(null);


        setSearchTerm("");

    };





    // ==============================
    // ADD EVENT
    // ==============================

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





    // ==============================
    // AUTO SAVE CASE
    // ==============================

    useEffect(() => {


        if (!selectedCase)

            return;



        updateCase(


            selectedCase.id,


            {


                nodes,

                edges,

                events


            }


        );


    }, [


        nodes,

        edges,

        events,

        selectedCase


    ]);





    // ==============================
    // DELETE NODE
    // ==============================

    const deleteNode = (

        id: string

    ) => {


        setNodes(prev =>


            prev.filter(

                node =>

                    String(node.id) !==
                    String(id)

            )


        );



        setEdges(prev =>


            prev.filter(

                edge =>

                    String(edge.source) !==
                    String(id)

                    &&

                    String(edge.target) !==
                    String(id)

            )


        );



        addEvent({


            title:

                "Entity Deleted",


            type:

                "delete",


            description:

                `Entity ${id} removed from graph`


        });



        if (

            selectedNode &&

            String(selectedNode.id) ===
            String(id)

        ) {


            setSelectedNode(null);

        }



        if (

            selectedEdge &&

            (

                String(selectedEdge.source) ===
                String(id)

                ||

                String(selectedEdge.target) ===
                String(id)

            )

        ) {


            setSelectedEdge(null);

        }

    };





    // ==============================
    // DELETE EDGE
    // ==============================

    const deleteEdge = (

        id: string

    ) => {


        setEdges(prev =>


            prev.filter(

                edge =>

                    String(edge.id) !==
                    String(id)

            )


        );



        addEvent({


            title:

                "Relationship Deleted",


            type:

                "delete",


            description:

                `Relationship ${id} removed`


        });



        if (

            selectedEdge &&

            String(selectedEdge.id) ===
            String(id)

        ) {


            setSelectedEdge(null);

        }

    };





    // ==============================
    // PROVIDER
    // ==============================

    return (


        <GraphContext.Provider


            value={{


                nodes,

                setNodes,


                edges,

                setEdges,


                // ENTITY REGISTRY

                entityRegistry,

                registerEntity,

                findEntityByName,


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


                deleteNode,

                deleteEdge,


                searchTerm,

                setSearchTerm


            }}


        >


            {children}


        </GraphContext.Provider>


    );

}





// ==============================
// USE GRAPH
// ==============================

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

