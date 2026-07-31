
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef
} from "react";

import type {
    ReactNode
} from "react";

import type {
    CaseItem
} from "./CaseContext";

import {
    entityApi
} from "../api/entityApi";

import {
    caseApi
} from "../api/caseApi";

import {
    relationshipApi
} from "../api/relationshipApi";

import {
    eventApi
} from "../api/eventApi";


// ============================================================
// TYPES
// ============================================================

type GraphCaseItem = CaseItem & {

    nodes?: any[];

    edges?: any[];

    events?: any[];

    name?: string;

    createdAt?: string;

    updatedAt?: string;

};


// ============================================================
// ENTITY
// ============================================================

interface GraphEntity {

    id: string | number;

    name: string;

    type: string;

    category: string;

    icon: string;

    attributes: Record<string, any>;

    createdAt?: string | null;

    updatedAt?: string | null;

}


// ============================================================
// CONTEXT TYPE
// ============================================================

interface GraphContextType {

    // ========================================================
    // GRAPH
    // ========================================================

    nodes: any[];

    setNodes: React.Dispatch<
        React.SetStateAction<any[]>
    >;

    edges: any[];

    setEdges: React.Dispatch<
        React.SetStateAction<any[]>
    >;


    // ========================================================
    // ENTITY REGISTRY
    // ========================================================

    entityRegistry: GraphEntity[];

    registerEntity: (
        entity: any
    ) => Promise<GraphEntity | null>;

    findEntityByName: (
        name: string
    ) => GraphEntity | undefined;


    // ========================================================
    // ADD ENTITY TO GRAPH
    // ========================================================

    addEntityToGraph: (
        entity: any,
        position?: {
            x: number;
            y: number;
        }
    ) => Promise<any>;


    // ========================================================
    // SELECTION
    // ========================================================

    selectedNode: any;

    setSelectedNode: React.Dispatch<
        React.SetStateAction<any>
    >;

    selectedEdge: any;

    setSelectedEdge: React.Dispatch<
        React.SetStateAction<any>
    >;


    // ========================================================
    // CASE
    // ========================================================

    selectedCase: CaseItem | null;

    setSelectedCase: React.Dispatch<
        React.SetStateAction<CaseItem | null>
    >;

    openCase: (
        item: CaseItem
    ) => Promise<void>;

    clearCase: () => void;


    // ========================================================
    // EVENTS
    // ========================================================

    events: any[];

    setEvents: React.Dispatch<
        React.SetStateAction<any[]>
    >;

    addEvent: (
        event: any
    ) => Promise<any>;


    // ========================================================
    // DELETE
    // ========================================================

    deleteNode: (
        id: string
    ) => Promise<void>;

    deleteEdge: (
        id: string
    ) => Promise<void>;


    // ========================================================
    // CASE SAVE
    // ========================================================

    saveCurrentCase: () => Promise<void>;

    refreshCurrentCase: () => Promise<void>;


    // ========================================================
    // SEARCH
    // ========================================================

    searchTerm: string;

    setSearchTerm: React.Dispatch<
        React.SetStateAction<string>
    >;


    // ========================================================
    // API
    // ========================================================

    loading: boolean;

    apiError: string | null;

    loadEntities: () => Promise<void>;

    loadCases: () => Promise<void>;

    loadEvents: () => Promise<void>;

}


// ============================================================
// CONTEXT
// ============================================================

const GraphContext =
    createContext<GraphContextType | null>(
        null
    );


// ============================================================
// HELPERS
// ============================================================

function normalizeIcon(
    value: any
): string {

    if (
        typeof value === "string" &&
        value.trim() !== ""
    ) {

        return value;

    }

    return "❓";

}


function normalizeEntity(
    entity: any
): GraphEntity {

    return {

        id:
            entity?.id ??
            entity?.entityId ??
            `entity-${Date.now()}`,

        name:
            String(
                entity?.name ??
                entity?.label ??
                "Unnamed Entity"
            ),

        type:
            String(
                entity?.type ??
                "Unknown"
            ),

        category:
            String(
                entity?.category ??
                "Unknown"
            ),

        icon:
            normalizeIcon(
                entity?.icon ??
                entity?.data?.icon
            ),

        attributes:
            entity?.attributes ??
            entity?.data?.attributes ??
            {},

        createdAt:
            entity?.createdAt ??
            null,

        updatedAt:
            entity?.updatedAt ??
            null

    };

}


// ============================================================
// PROVIDER
// ============================================================

export function GraphProvider({

    children

}: {

    children: ReactNode;

}) {


    // ========================================================
    // GRAPH
    // ========================================================

    const [
        nodes,
        setNodes
    ] = useState<any[]>([]);


    const [
        edges,
        setEdges
    ] = useState<any[]>([]);


    // ========================================================
    // SELECTION
    // ========================================================

    const [
        selectedNode,
        setSelectedNode
    ] = useState<any>(null);


    const [
        selectedEdge,
        setSelectedEdge
    ] = useState<any>(null);


    // ========================================================
    // CASE
    // ========================================================

    const [
        selectedCase,
        setSelectedCase
    ] = useState<CaseItem | null>(
        null
    );


    // ========================================================
    // EVENTS
    // ========================================================

    const [
        events,
        setEvents
    ] = useState<any[]>([]);


    // ========================================================
    // ENTITIES
    // ========================================================

    const [
        entityRegistry,
        setEntityRegistry
    ] = useState<GraphEntity[]>([]);


    // ========================================================
    // SEARCH
    // ========================================================

    const [
        searchTerm,
        setSearchTerm
    ] = useState<string>("");


    // ========================================================
    // API STATE
    // ========================================================

    const [
        loading,
        setLoading
    ] = useState<boolean>(false);


    const [
        apiError,
        setApiError
    ] = useState<string | null>(
        null
    );


    // ========================================================
    // SAVE TIMER
    // ========================================================

    const saveTimer =
        useRef<
            ReturnType<typeof setTimeout> | null
        >(null);


    // ========================================================
    // INITIALIZED CASE
    // ========================================================

    const initializedCase =
        useRef<string | null>(null);


    // ========================================================
    // LOAD ENTITIES
    // ========================================================

    const loadEntities =
        useCallback(
            async () => {

                try {

                    setLoading(true);

                    setApiError(null);


                    const data =
                        await entityApi.getAll();


                    if (
                        !Array.isArray(data)
                    ) {

                        setEntityRegistry([]);

                        return;

                    }


                    const normalized =
                        data.map(
                            (
                                entity: any
                            ) =>
                                normalizeEntity(
                                    entity
                                )
                        );


                    setEntityRegistry(
                        normalized
                    );

                }
                catch (error) {

                    console.error(
                        "Failed to load entities:",
                        error
                    );


                    setApiError(
                        "Failed to load entities from SQL Server."
                    );

                }
                finally {

                    setLoading(false);

                }

            },
            []
        );


    // ========================================================
    // LOAD CASES
    // ========================================================

    const loadCases =
        useCallback(
            async () => {

                try {

                    const data =
                        await caseApi.getAll();


                    if (
                        !Array.isArray(data)
                    ) {

                        return;

                    }


                    console.log(
                        "Cases loaded from SQL Server:",
                        data
                    );

                }
                catch (error) {

                    console.error(
                        "Failed to load cases:",
                        error
                    );


                    setApiError(
                        "Failed to load cases from SQL Server."
                    );

                }

            },
            []
        );


    // ========================================================
    // LOAD EVENTS
    // ========================================================

    const loadEvents =
        useCallback(
            async () => {

                try {

                    const data =
                        await eventApi.getAll();


                    if (
                        !Array.isArray(data)
                    ) {

                        setEvents([]);

                        return;

                    }


                    setEvents(
                        data
                    );

                }
                catch (error) {

                    console.error(
                        "Failed to load events:",
                        error
                    );


                    setApiError(
                        "Failed to load investigation events from SQL Server."
                    );

                }

            },
            []
        );


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        void loadEntities();

        void loadCases();

        void loadEvents();

    }, [
        loadEntities,
        loadCases,
        loadEvents
    ]);


    // ========================================================
    // FIND ENTITY
    // ========================================================

    const findEntityByName =
        useCallback(
            (
                name: string
            ) => {

                if (
                    !name?.trim()
                ) {

                    return undefined;

                }


                const normalizedName =
                    name
                        .trim()
                        .toLowerCase();


                return entityRegistry.find(
                    entity =>

                        String(
                            entity.name ?? ""
                        )
                            .trim()
                            .toLowerCase()
                        ===
                        normalizedName
                );

            },
            [
                entityRegistry
            ]
        );


    // ========================================================
    // REGISTER ENTITY
    // ========================================================

    const registerEntity =
        useCallback(
            async (
                entity: any
            ): Promise<GraphEntity | null> => {

                if (
                    !entity
                ) {

                    return null;

                }


                const normalizedInput =
                    normalizeEntity(
                        entity
                    );


                const normalizedName =
                    normalizedInput.name
                        .trim()
                        .toLowerCase();


                const normalizedType =
                    normalizedInput.type
                        .trim()
                        .toLowerCase();


                // ====================================================
                // CHECK LOCAL REGISTRY
                // ====================================================

                const existing =
                    entityRegistry.find(
                        item =>

                            String(
                                item.name ?? ""
                            )
                                .trim()
                                .toLowerCase()
                            ===
                            normalizedName

                            &&

                            String(
                                item.type ?? ""
                            )
                                .trim()
                                .toLowerCase()
                            ===
                            normalizedType
                    );


                if (
                    existing
                ) {

                    return existing;

                }


                // ====================================================
                // CREATE IN SQL SERVER
                // ====================================================

                try {

                    const created =
                        await entityApi.create({

                            name:
                                normalizedInput.name,

                            type:
                                normalizedInput.type,

                            category:
                                normalizedInput.category,

                            icon:
                                normalizedInput.icon,

                            attributes:
                                normalizedInput.attributes

                        });


                    if (
                        !created
                    ) {

                        return null;

                    }


                    const normalizedCreated =
                        normalizeEntity(
                            created
                        );


                    setEntityRegistry(
                        prev => {

                            const alreadyExists =
                                prev.some(
                                    item =>
                                        String(
                                            item.id
                                        )
                                        ===
                                        String(
                                            normalizedCreated.id
                                        )
                                );


                            if (
                                alreadyExists
                            ) {

                                return prev;

                            }


                            return [
                                ...prev,
                                normalizedCreated
                            ];

                        }
                    );


                    return normalizedCreated;

                }
                catch (error) {

                    console.error(
                        "Failed to create entity:",
                        error
                    );


                    setApiError(
                        "Failed to save entity to SQL Server."
                    );


                    return null;

                }

            },
            [
                entityRegistry
            ]
        );


    // ========================================================
    // ADD ENTITY TO GRAPH
    // ========================================================

    const addEntityToGraph =
        useCallback(
            async (
                entity: any,
                position = {
                    x: 100,
                    y: 100
                }
            ) => {

                if (
                    !entity
                ) {

                    return null;

                }


                // ====================================================
                // ENTITY DATA
                // ====================================================

                let masterEntity =
                    normalizeEntity(
                        entity
                    );


                // ====================================================
                // CHECK REGISTRY / CREATE
                // ====================================================

                const existing =
                    entityRegistry.find(
                        item =>

                            String(
                                item.name
                            )
                                .trim()
                                .toLowerCase()
                            ===
                            String(
                                masterEntity.name
                            )
                                .trim()
                                .toLowerCase()

                            &&

                            String(
                                item.type
                            )
                                .trim()
                                .toLowerCase()
                            ===
                            String(
                                masterEntity.type
                            )
                                .trim()
                                .toLowerCase()
                    );


                if (
                    existing
                ) {

                    masterEntity =
                        existing;

                }
                else {

                    const registered =
                        await registerEntity(
                            masterEntity
                        );


                    if (
                        registered
                    ) {

                        masterEntity =
                            registered;

                    }

                }


                // ====================================================
                // PROTECT AGAINST DUPLICATE NODE
                // ====================================================

                const duplicate =
                    nodes.find(
                        node => {

                            const nodeEntityId =
                                node?.data?.entityId ??
                                node?.entityId;

                            return (
                                String(
                                    nodeEntityId
                                )
                                ===
                                String(
                                    masterEntity.id
                                )
                            );

                        }
                    );


                if (
                    duplicate
                ) {

                    setSelectedNode(
                        duplicate
                    );

                    return duplicate;

                }


                // ====================================================
                // CREATE REACTFLOW NODE
                // ====================================================

                const nodeId =
                    `entity-${masterEntity.id}-${Date.now()}`;


                const newNode = {

                    id:
                        nodeId,

                    type:
                        "custom",

                    position: {

                        x:
                            Number(
                                position.x
                            ) || 100,

                        y:
                            Number(
                                position.y
                            ) || 100

                    },

                    data: {

                        id:
                            masterEntity.id,

                        entityId:
                            masterEntity.id,

                        name:
                            masterEntity.name,

                        label:
                            masterEntity.name,

                        type:
                            masterEntity.type,

                        category:
                            masterEntity.category,

                        icon:
                            normalizeIcon(
                                masterEntity.icon
                            ),

                        attributes:
                            masterEntity.attributes,

                        entity:
                            masterEntity

                    }

                };


                // ====================================================
                // ADD TO GRAPH
                // ====================================================

                setNodes(
                    prev => [
                        ...prev,
                        newNode
                    ]
                );


                setSelectedNode(
                    newNode
                );


                console.log(
                    "ENTITY DROPPED INTO GRAPH:",
                    newNode
                );


                return newNode;

            },
            [
                entityRegistry,
                nodes,
                registerEntity
            ]
        );


    // ========================================================
    // REGISTER CASE ENTITIES
    // ========================================================

    const registerCaseEntities =
        useCallback(
            async (
                caseNodes: any[]
            ) => {

                if (
                    !Array.isArray(caseNodes)
                ) {

                    return;

                }


                for (
                    const node
                    of caseNodes
                ) {

                    const data =
                        node?.data ?? {};


                    const name =
                        data.name ??
                        data.label ??
                        node?.label;


                    if (
                        !name
                    ) {

                        continue;

                    }


                    const existing =
                        findEntityByName(
                            name
                        );


                    if (
                        existing
                    ) {

                        /*
                         * Very important:
                         *
                         * Even if entity already exists,
                         * hydrate the node with the master
                         * entity data so icon/type/category
                         * are not lost.
                         */

                        node.data = {

                            ...data,

                            entityId:
                                data.entityId ??
                                existing.id,

                            name:
                                existing.name,

                            label:
                                existing.name,

                            type:
                                data.type ??
                                existing.type,

                            category:
                                data.category ??
                                existing.category,

                            icon:
                                normalizeIcon(
                                    data.icon ??
                                    existing.icon
                                ),

                            attributes:
                                data.attributes ??
                                existing.attributes,

                            entity:
                                existing

                        };


                        continue;

                    }


                    const registered =
                        await registerEntity({

                            id:
                                data.entityId,

                            name,

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


                    if (
                        registered
                    ) {

                        node.data = {

                            ...data,

                            entityId:
                                registered.id,

                            name:
                                registered.name,

                            label:
                                registered.name,

                            type:
                                registered.type,

                            category:
                                registered.category,

                            icon:
                                normalizeIcon(
                                    registered.icon
                                ),

                            attributes:
                                registered.attributes,

                            entity:
                                registered

                        };

                    }

                }

            },
            [
                findEntityByName,
                registerEntity
            ]
        );


    // ========================================================
    // OPEN CASE
    // ========================================================

    const openCase =
        useCallback(
            async (
                item: CaseItem
            ) => {

                if (
                    !item
                ) {

                    return;

                }


                const graphCase =
                    item as GraphCaseItem;


                // ====================================================
                // CASE
                // ====================================================

                setSelectedCase(
                    item
                );


                // ====================================================
                // RAW DATA
                // ====================================================

                const caseNodes =
                    Array.isArray(
                        graphCase.nodes
                    )
                        ? graphCase.nodes
                        : [];


                const caseEdges =
                    Array.isArray(
                        graphCase.edges
                    )
                        ? graphCase.edges
                        : [];


                const caseEvents =
                    Array.isArray(
                        graphCase.events
                    )
                        ? graphCase.events
                        : [];


                // ====================================================
                // COPY NODES
                // ====================================================

                const hydratedNodes =
                    caseNodes.map(
                        node => ({

                            ...node,

                            position: {

                                x:
                                    Number(
                                        node?.position?.x
                                    ) || 0,

                                y:
                                    Number(
                                        node?.position?.y
                                    ) || 0

                            },

                            data: {

                                ...(node?.data ?? {}),

                                icon:
                                    normalizeIcon(
                                        node?.data?.icon
                                    )

                            }

                        })
                    );


                // ====================================================
                // SET GRAPH
                // ====================================================

                setNodes(
                    hydratedNodes
                );


                setEdges(
                    caseEdges
                );


                setEvents(
                    caseEvents
                );


                // ====================================================
                // CASE INITIALIZED
                // ====================================================

                initializedCase.current =
                    String(
                        item.id
                    );


                setSelectedNode(
                    null
                );


                setSelectedEdge(
                    null
                );


                setSearchTerm(
                    ""
                );


                // ====================================================
                // REGISTER / HYDRATE ENTITIES
                // ====================================================

                await registerCaseEntities(
                    hydratedNodes
                );


                // ====================================================
                // UPDATE NODES AFTER HYDRATION
                // ====================================================

                setNodes(
                    prev =>

                        prev.map(
                            node => {

                                const data =
                                    node?.data ?? {};


                                const entity =
                                    entityRegistry.find(
                                        item =>

                                            String(
                                                item.id
                                            )
                                            ===
                                            String(
                                                data.entityId
                                            )
                                    );


                                if (
                                    !entity
                                ) {

                                    return {

                                        ...node,

                                        data: {

                                            ...data,

                                            icon:
                                                normalizeIcon(
                                                    data.icon
                                                )

                                        }

                                    };

                                }


                                return {

                                    ...node,

                                    data: {

                                        ...data,

                                        entityId:
                                            entity.id,

                                        name:
                                            entity.name,

                                        label:
                                            entity.name,

                                        type:
                                            data.type ??
                                            entity.type,

                                        category:
                                            data.category ??
                                            entity.category,

                                        icon:
                                            normalizeIcon(
                                                data.icon ??
                                                entity.icon
                                            ),

                                        attributes:
                                            data.attributes ??
                                            entity.attributes,

                                        entity

                                    }

                                };

                            }
                        )
                );

            },
            [
                registerCaseEntities,
                entityRegistry
            ]
        );


    // ========================================================
    // CLEAR CASE
    // ========================================================

    const clearCase =
        useCallback(
            () => {

                initializedCase.current =
                    null;


                setSelectedCase(
                    null
                );


                setNodes(
                    []
                );


                setEdges(
                    []
                );


                setEvents(
                    []
                );


                setSelectedNode(
                    null
                );


                setSelectedEdge(
                    null
                );


                setSearchTerm(
                    ""
                );

            },
            []
        );


    // ========================================================
    // ADD EVENT
    // ========================================================

    const addEvent =
        useCallback(
            async (
                event: any
            ) => {

                if (
                    !selectedCase?.id
                ) {

                    console.warn(
                        "Cannot create event without an active case."
                    );

                    return null;

                }


                const eventDate =
                    typeof event.date === "string" &&
                        event.date.trim() !== ""

                        ? event.date

                        : new Date().toISOString();


                const temporaryId =
                    `event-${Date.now()}-${Math.random()
                        .toString(36)
                        .substring(2, 8)}`;


                const newEvent = {

                    id:
                        temporaryId,

                    caseId:
                        selectedCase.id,

                    title:
                        typeof event.title === "string" &&
                            event.title.trim() !== ""

                            ? event.title

                            : "Event",

                    type:
                        typeof event.type === "string" &&
                            event.type.trim() !== ""

                            ? event.type

                            : "event",

                    description:
                        typeof event.description === "string"

                            ? event.description

                            : "",

                    date:
                        eventDate

                };


                setEvents(
                    prev => [
                        newEvent,
                        ...prev
                    ]
                );


                try {

                    const backendEvent =
                        await eventApi.create({

                            caseId:
                                selectedCase.id,

                            title:
                                newEvent.title,

                            type:
                                newEvent.type,

                            description:
                                newEvent.description,

                            date:
                                newEvent.date

                        });


                    if (
                        backendEvent
                    ) {

                        setEvents(
                            prev =>
                                prev.map(
                                    item =>

                                        String(
                                            item.id
                                        )
                                            ===
                                            String(
                                                newEvent.id
                                            )

                                            ? {

                                                ...item,

                                                id:
                                                    backendEvent.id,

                                                caseId:
                                                    backendEvent.caseId ??
                                                    selectedCase.id

                                            }

                                            :

                                            item
                                )
                        );

                    }


                    return backendEvent;

                }
                catch (error) {

                    console.error(
                        "Failed to save event:",
                        error
                    );


                    setEvents(
                        prev =>
                            prev.filter(
                                item =>

                                    String(
                                        item.id
                                    )
                                    !==
                                    String(
                                        newEvent.id
                                    )
                            )
                    );


                    return null;

                }

            },
            [
                selectedCase
            ]
        );


    // ========================================================
    // SAVE CURRENT CASE
    // ========================================================

    const saveCurrentCase =
        useCallback(
            async () => {

                if (
                    !selectedCase
                ) {

                    return;

                }


                try {

                    setApiError(
                        null
                    );


                    const graphCase =
                        selectedCase as GraphCaseItem;


                    const payload: any = {

                        id:
                            selectedCase.id,

                        name:
                            graphCase.name ??
                            selectedCase.title ??
                            "Investigation Case",

                        title:
                            selectedCase.title,

                        description:
                            selectedCase.description,

                        status:
                            selectedCase.status,

                        createdAt:
                            graphCase.createdAt,

                        updatedAt:
                            new Date().toISOString(),

                        nodes,

                        edges,

                        events

                    };


                    const updated =
                        await caseApi.update(
                            selectedCase.id,
                            payload
                        );


                    if (
                        updated
                    ) {

                        const updatedAny =
                            updated as any;


                        setSelectedCase(
                            prev => {

                                if (
                                    !prev
                                ) {

                                    return null;

                                }


                                return {

                                    ...prev,

                                    ...updatedAny,

                                    nodes,

                                    edges,

                                    events

                                };

                            }
                        );

                    }

                }
                catch (error) {

                    console.error(
                        "Failed to save case:",
                        error
                    );


                    setApiError(
                        "Failed to save case to SQL Server."
                    );

                }

            },
            [
                selectedCase,
                nodes,
                edges,
                events
            ]
        );


    // ========================================================
    // REFRESH CURRENT CASE
    // ========================================================

    const refreshCurrentCase =
        useCallback(
            async () => {

                if (
                    !selectedCase
                ) {

                    return;

                }


                try {

                    setLoading(
                        true
                    );

                    setApiError(
                        null
                    );


                    const fresh =
                        await caseApi.getById(
                            selectedCase.id
                        );


                    if (
                        !fresh
                    ) {

                        return;

                    }


                    const freshCase =
                        fresh as GraphCaseItem;


                    const freshNodes =
                        Array.isArray(
                            freshCase.nodes
                        )
                            ? freshCase.nodes
                            : [];


                    const freshEdges =
                        Array.isArray(
                            freshCase.edges
                        )
                            ? freshCase.edges
                            : [];


                    const freshEvents =
                        Array.isArray(
                            freshCase.events
                        )
                            ? freshCase.events
                            : [];


                    const hydratedNodes =
                        freshNodes.map(
                            node => ({

                                ...node,

                                data: {

                                    ...(node?.data ?? {}),

                                    icon:
                                        normalizeIcon(
                                            node?.data?.icon
                                        )

                                }

                            })
                        );


                    setSelectedCase(
                        freshCase
                    );


                    setNodes(
                        hydratedNodes
                    );


                    setEdges(
                        freshEdges
                    );


                    setEvents(
                        freshEvents
                    );


                    initializedCase.current =
                        String(
                            freshCase.id
                        );


                    await registerCaseEntities(
                        hydratedNodes
                    );

                }
                catch (error) {

                    console.error(
                        "Failed to refresh case:",
                        error
                    );


                    setApiError(
                        "Failed to load case from SQL Server."
                    );

                }
                finally {

                    setLoading(
                        false
                    );

                }

            },
            [
                selectedCase,
                registerCaseEntities
            ]
        );


    // ========================================================
    // AUTO SAVE
    // ========================================================

    useEffect(() => {

        if (
            !selectedCase
        ) {

            return;

        }


        if (
            initializedCase.current !==
            String(
                selectedCase.id
            )
        ) {

            return;

        }


        if (
            saveTimer.current
        ) {

            clearTimeout(
                saveTimer.current
            );

        }


        saveTimer.current =
            setTimeout(
                () => {

                    void saveCurrentCase();

                },
                700
            );


        return () => {

            if (
                saveTimer.current
            ) {

                clearTimeout(
                    saveTimer.current
                );

            }

        };

    }, [
        nodes,
        edges,
        events,
        selectedCase,
        saveCurrentCase
    ]);


    // ========================================================
    // DELETE NODE
    // ========================================================

    const deleteNode =
        useCallback(
            async (
                id: string
            ) => {

                const node =
                    nodes.find(
                        item =>

                            String(
                                item.id
                            )
                            ===
                            String(id)
                    );


                const entityId =
                    node?.data?.entityId ??
                    node?.data?.entity?.id ??
                    node?.entityId;


                // ====================================================
                // REMOVE NODE
                // ====================================================

                setNodes(
                    prev =>
                        prev.filter(
                            item =>

                                String(
                                    item.id
                                )
                                !==
                                String(id)
                        )
                );


                // ====================================================
                // REMOVE CONNECTED EDGES
                // ====================================================

                setEdges(
                    prev =>
                        prev.filter(
                            edge =>

                                String(
                                    edge.source
                                )
                                !==
                                String(id)

                                &&

                                String(
                                    edge.target
                                )
                                !==
                                String(id)
                        )
                );


                // ====================================================
                // SELECTION
                // ====================================================

                if (
                    selectedNode &&
                    String(
                        selectedNode.id
                    )
                    ===
                    String(id)
                ) {

                    setSelectedNode(
                        null
                    );

                }


                if (
                    selectedEdge &&
                    (
                        String(
                            selectedEdge.source
                        )
                        ===
                        String(id)

                        ||

                        String(
                            selectedEdge.target
                        )
                        ===
                        String(id)
                    )
                ) {

                    setSelectedEdge(
                        null
                    );

                }


                // ====================================================
                // DELETE MASTER ENTITY
                // ====================================================

                const masterEntity =
                    entityRegistry.find(
                        entity =>

                            String(
                                entity.id
                            )
                            ===
                            String(
                                entityId
                            )
                    );


                if (
                    masterEntity?.id
                ) {

                    try {

                        await entityApi.delete(
                            masterEntity.id
                        );


                        setEntityRegistry(
                            prev =>
                                prev.filter(
                                    entity =>

                                        String(
                                            entity.id
                                        )
                                        !==
                                        String(
                                            masterEntity.id
                                        )
                                )
                        );

                    }
                    catch (error) {

                        console.error(
                            "Failed to delete entity:",
                            error
                        );


                        setApiError(
                            "Entity was removed from the graph but could not be deleted from SQL Server."
                        );

                    }

                }


                // ====================================================
                // AUDIT EVENT
                // ====================================================

                try {

                    await addEvent({

                        title:
                            "Entity Deleted",

                        type:
                            "delete",

                        description:
                            `Entity ${node?.data?.name ?? id} was removed from the investigation graph.`,

                        date:
                            new Date().toISOString()

                    });

                }
                catch (error) {

                    console.error(
                        "Failed to create deletion event:",
                        error
                    );

                }

            },
            [
                nodes,
                selectedNode,
                selectedEdge,
                entityRegistry,
                addEvent
            ]
        );


    // ========================================================
    // DELETE EDGE
    // ========================================================

    const deleteEdge =
        useCallback(
            async (
                id: string
            ) => {

                const edge =
                    edges.find(
                        item =>

                            String(
                                item.id
                            )
                            ===
                            String(id)
                    );


                setEdges(
                    prev =>
                        prev.filter(
                            item =>

                                String(
                                    item.id
                                )
                                !==
                                String(id)
                        )
                );


                if (
                    selectedEdge &&
                    String(
                        selectedEdge.id
                    )
                    ===
                    String(id)
                ) {

                    setSelectedEdge(
                        null
                    );

                }


                try {

                    await relationshipApi.delete(
                        id
                    );

                }
                catch (error) {

                    console.error(
                        "Failed to delete relationship:",
                        error
                    );


                    setApiError(
                        "Relationship was removed from the graph but could not be deleted from SQL Server."
                    );

                }


                try {

                    await addEvent({

                        title:
                            "Relationship Deleted",

                        type:
                            "delete",

                        description:
                            `Relationship ${edge?.id ?? id} was removed from the investigation graph.`,

                        date:
                            new Date().toISOString()

                    });

                }
                catch (error) {

                    console.error(
                        "Failed to create relationship deletion event:",
                        error
                    );

                }

            },
            [
                edges,
                selectedEdge,
                addEvent
            ]
        );


    // ========================================================
    // CLEANUP
    // ========================================================

    useEffect(() => {

        return () => {

            if (
                saveTimer.current
            ) {

                clearTimeout(
                    saveTimer.current
                );

            }

        };

    }, []);


    // ========================================================
    // PROVIDER
    // ========================================================

    return (

        <GraphContext.Provider

            value={{

                // ====================================================
                // GRAPH
                // ====================================================

                nodes,

                setNodes,

                edges,

                setEdges,


                // ====================================================
                // ENTITIES
                // ====================================================

                entityRegistry,

                registerEntity,

                findEntityByName,

                addEntityToGraph,


                // ====================================================
                // SELECTION
                // ====================================================

                selectedNode,

                setSelectedNode,

                selectedEdge,

                setSelectedEdge,


                // ====================================================
                // CASE
                // ====================================================

                selectedCase,

                setSelectedCase,

                openCase,

                clearCase,


                // ====================================================
                // EVENTS
                // ====================================================

                events,

                setEvents,

                addEvent,


                // ====================================================
                // DELETE
                // ====================================================

                deleteNode,

                deleteEdge,


                // ====================================================
                // SAVE
                // ====================================================

                saveCurrentCase,

                refreshCurrentCase,


                // ====================================================
                // SEARCH
                // ====================================================

                searchTerm,

                setSearchTerm,


                // ====================================================
                // API
                // ====================================================

                loading,

                apiError,

                loadEntities,

                loadCases,

                loadEvents

            }}

        >

            {children}

        </GraphContext.Provider>

    );

}


// ============================================================
// USE GRAPH
// ============================================================

export function useGraph() {

    const context =
        useContext(
            GraphContext
        );


    if (
        !context
    ) {

        throw new Error(
            "useGraph must be used inside GraphProvider"
        );

    }


    return context;

}

