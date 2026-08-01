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

    id?: string;

    name?: string;

    title?: string;

    description?: string;

    status?: string;

    createdAt?: string;

    updatedAt?: string;

    nodes?: any[];

    edges?: any[];

    events?: any[];

};


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


interface GraphContextType {

    nodes: any[];

    setNodes: React.Dispatch<
        React.SetStateAction<any[]>
    >;

    edges: any[];

    setEdges: React.Dispatch<
        React.SetStateAction<any[]>
    >;


    entityRegistry: GraphEntity[];

    registerEntity: (
        entity: any
    ) => Promise<GraphEntity | null>;

    findEntityByName: (
        name: string
    ) => GraphEntity | undefined;

    searchEntities: (
        term: string
    ) => GraphEntity[];

    addEntityToGraph: (
        entity: any,
        position?: {
            x: number;
            y: number;
        }
    ) => Promise<any>;


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

    openCase: (
        item: CaseItem
    ) => Promise<void>;

    clearCase: () => void;


    events: any[];

    setEvents: React.Dispatch<
        React.SetStateAction<any[]>
    >;

    addEvent: (
        event: any
    ) => Promise<any>;


    deleteNode: (
        id: string
    ) => Promise<void>;

    deleteEdge: (
        id: string
    ) => Promise<void>;


    saveCurrentCase: () => Promise<void>;

    refreshCurrentCase: () => Promise<void>;


    searchTerm: string;

    setSearchTerm: React.Dispatch<
        React.SetStateAction<string>
    >;


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
// STORAGE
// ============================================================
//
// IMPORTANT:
// localStorage stores ONLY active case ID.
// Graph itself is stored in SQL Server.
// ============================================================

const ACTIVE_CASE_STORAGE_KEY =
    "igs-active-case-id";


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


// ============================================================
// NORMALIZE ENTITY
// ============================================================

function normalizeEntity(
    entity: any
): GraphEntity {

    const resolvedName =
        entity?.name ??
        entity?.entityName ??
        entity?.label ??
        entity?.data?.name ??
        entity?.data?.entityName ??
        entity?.data?.label ??
        entity?.attributes?.name ??
        entity?.data?.attributes?.name ??
        "Unnamed Entity";


    const resolvedType =
        entity?.type ??
        entity?.entityType ??
        entity?.data?.type ??
        entity?.data?.entityType ??
        "Unknown";


    const resolvedCategory =
        entity?.category ??
        entity?.data?.category ??
        "Unknown";


    const resolvedAttributes =
        entity?.attributes ??
        entity?.data?.attributes ??
        {};


    return {

        id:
            entity?.id ??
            entity?.entityId ??
            entity?.data?.id ??
            entity?.data?.entityId ??
            `entity-${Date.now()}`,

        name:
            String(
                resolvedName
            ),

        type:
            String(
                resolvedType
            ),

        category:
            String(
                resolvedCategory
            ),

        icon:
            normalizeIcon(
                entity?.icon ??
                entity?.data?.icon
            ),

        attributes:
            resolvedAttributes,

        createdAt:
            entity?.createdAt ??
            entity?.data?.createdAt ??
            null,

        updatedAt:
            entity?.updatedAt ??
            entity?.data?.updatedAt ??
            null

    };

}


// ============================================================
// HYDRATE NODE
// ============================================================
//
// This is the IMPORTANT part.
//
// DB graph node:
// data.entityId
//
// gets matched against:
//
// Entity.id
//
// Then the node receives:
// name
// label
// type
// category
// icon
// attributes
// entity
// ============================================================

function hydrateSingleNode(
    node: any,
    allEntities: GraphEntity[]
) {

    const nodeData =
        node?.data ?? {};


    // ========================================================
    // ENTITY ID FROM GRAPH
    // ========================================================

    const entityId =
        nodeData?.entityId ??
        nodeData?.entity?.id ??
        node?.entityId;


    // ========================================================
    // FIND ENTITY BY ID
    // ========================================================

    let masterEntity =
        allEntities.find(
            entity =>
                entityId !== undefined &&
                entityId !== null &&
                String(entity.id) ===
                String(entityId)
        );


    // ========================================================
    // FALLBACK BY NAME
    // ========================================================

    if (!masterEntity) {

        const possibleName =
            nodeData?.name ??
            nodeData?.label ??
            node?.label;


        if (
            possibleName &&
            String(possibleName).trim() !== ""
        ) {

            const normalizedName =
                String(
                    possibleName
                )
                    .trim()
                    .toLowerCase();


            masterEntity =
                allEntities.find(
                    entity =>
                        String(
                            entity.name ?? ""
                        )
                            .trim()
                            .toLowerCase()
                        ===
                        normalizedName
                );

        }

    }


    // ========================================================
    // BASE NODE
    // ========================================================

    const normalizedNode = {

        ...node,

        id:
            String(
                node?.id ??
                `node-${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 8)}`
            ),

        position: {

            x:
                Number(
                    node?.position?.x
                ) || 0,

            y:
                Number(
                    node?.position?.y
                ) || 0

        }

    };


    // ========================================================
    // ENTITY FOUND
    // ========================================================

    if (masterEntity) {

        return {

            ...normalizedNode,

            data: {

                ...nodeData,

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

    }


    // ========================================================
    // ENTITY NOT FOUND
    // ========================================================
    //
    // IMPORTANT:
    // DO NOT DESTROY EXISTING NODE DATA.
    //
    // If DB entity lookup fails but node already contains
    // name/type/category/icon, keep those values.
    // ========================================================

    console.warn(
        "ENTITY NOT FOUND FOR GRAPH NODE:",
        {
            nodeId:
                node?.id,

            entityId,

            nodeData
        }
    );


    return {

        ...normalizedNode,

        data: {

            ...nodeData,

            entityId:
                entityId ??
                nodeData?.entityId,

            name:
                nodeData?.name ??
                nodeData?.label ??
                "Unknown",

            label:
                nodeData?.label ??
                nodeData?.name ??
                "Unknown",

            type:
                nodeData?.type ??
                nodeData?.entityType ??
                "Unknown",

            category:
                nodeData?.category ??
                "Unknown",

            icon:
                normalizeIcon(
                    nodeData?.icon
                ),

            attributes:
                nodeData?.attributes ??
                {}

        }

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
    ] = useState("");


    // ========================================================
    // API STATE
    // ========================================================

    const [
        loading,
        setLoading
    ] = useState(false);


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
    // ACTIVE CASE REF
    // ========================================================

    const activeCaseIdRef =
        useRef<string | null>(
            null
        );


    // ========================================================
    // INITIALIZED CASE
    // ========================================================

    const initializedCase =
        useRef<string | null>(
            null
        );


    // ========================================================
    // SAVE VERSION
    // ========================================================

    const saveVersion =
        useRef(0);


    // ========================================================
    // CURRENT STATE REFS
    // ========================================================
    //
    // These prevent saveCurrentCase from using stale React
    // state when switching cases.
    // ========================================================

    const nodesRef =
        useRef<any[]>([]);

    const edgesRef =
        useRef<any[]>([]);

    const eventsRef =
        useRef<any[]>([]);

    const selectedCaseRef =
        useRef<CaseItem | null>(
            null
        );


    useEffect(() => {

        nodesRef.current =
            nodes;

    }, [
        nodes
    ]);


    useEffect(() => {

        edgesRef.current =
            edges;

    }, [
        edges
    ]);


    useEffect(() => {

        eventsRef.current =
            events;

    }, [
        events
    ]);


    useEffect(() => {

        selectedCaseRef.current =
            selectedCase;

    }, [
        selectedCase
    ]);


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


                    console.log(
                        "ENTITIES LOADED:",
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
                        "CASES LOADED:",
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
    // FIND ENTITY BY NAME
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
    // SEARCH ENTITIES
    // ========================================================

    const searchEntities =
        useCallback(
            (
                term: string
            ): GraphEntity[] => {

                const normalizedTerm =
                    String(
                        term ?? ""
                    )
                        .trim()
                        .toLowerCase();


                if (
                    !normalizedTerm
                ) {

                    return entityRegistry;

                }


                return entityRegistry.filter(
                    entity => {

                        const name =
                            String(
                                entity?.name ?? ""
                            )
                                .toLowerCase();


                        const type =
                            String(
                                entity?.type ?? ""
                            )
                                .toLowerCase();


                        const category =
                            String(
                                entity?.category ?? ""
                            )
                                .toLowerCase();


                        let attributesText = "";


                        try {

                            attributesText =
                                JSON.stringify(
                                    entity?.attributes ?? {}
                                )
                                    .toLowerCase();

                        }
                        catch {

                            attributesText =
                                "";

                        }


                        return (

                            name.includes(
                                normalizedTerm
                            )

                            ||

                            type.includes(
                                normalizedTerm
                            )

                            ||

                            category.includes(
                                normalizedTerm
                            )

                            ||

                            attributesText.includes(
                                normalizedTerm
                            )

                        );

                    }
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


                let masterEntity =
                    normalizeEntity(
                        entity
                    );


                // ====================================================
                // FIND EXISTING ENTITY
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
                // DUPLICATE NODE CHECK
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
                // CREATE NODE
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


                setNodes(
                    prev => [

                        ...prev,

                        newNode

                    ]
                );


                setSelectedNode(
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
    // SAVE CURRENT CASE
    // ========================================================
    //
    // IMPORTANT:
    // This function is BEFORE openCase.
    //
    // Therefore:
    // saveCurrentCase is declared before it is used.
    // ========================================================

    const saveCurrentCase =
        useCallback(
            async () => {

                const currentCase =
                    selectedCaseRef.current;


                if (
                    !currentCase?.id
                ) {

                    console.warn(
                        "SAVE SKIPPED: No selected case."
                    );

                    return;

                }


                const caseId =
                    String(
                        currentCase.id
                    );


                // ====================================================
                // DO NOT SAVE INTO ANOTHER CASE
                // ====================================================

                if (
                    activeCaseIdRef.current &&
                    activeCaseIdRef.current !==
                    caseId
                ) {

                    console.warn(
                        "SAVE SKIPPED: Case is no longer active.",
                        {

                            active:
                                activeCaseIdRef.current,

                            requested:
                                caseId

                        }
                    );

                    return;

                }


                try {

                    setApiError(null);


                    saveVersion.current += 1;


                    const currentVersion =
                        saveVersion.current;


                    const graphCase =
                        currentCase as GraphCaseItem;


                    // ==================================================
                    // COPY CURRENT GRAPH FROM REFS
                    // ==================================================

                    const nodesToSave =
                        JSON.parse(
                            JSON.stringify(
                                nodesRef.current
                            )
                        );


                    const edgesToSave =
                        JSON.parse(
                            JSON.stringify(
                                edgesRef.current
                            )
                        );


                    const eventsToSave =
                        JSON.parse(
                            JSON.stringify(
                                eventsRef.current
                            )
                        );


                    // ==================================================
                    // PAYLOAD
                    // ==================================================

                    const payload = {

                        id:
                            caseId,

                        name:
                            graphCase.name ??
                            graphCase.title ??
                            "Investigation Case",

                        title:
                            graphCase.title ??
                            graphCase.name ??
                            "Investigation Case",

                        description:
                            graphCase.description ??
                            "",

                        status:
                            graphCase.status ??
                            "Open",

                        createdAt:
                            graphCase.createdAt,

                        updatedAt:
                            new Date().toISOString(),

                        nodes:
                            nodesToSave,

                        edges:
                            edgesToSave,

                        events:
                            eventsToSave

                    };


                    // ==================================================
                    // DEBUG
                    // ==================================================

                    console.log(
                        "===================================="
                    );

                    console.log(
                        "SAVING CASE TO DATABASE"
                    );

                    console.log(
                        "CASE ID:",
                        caseId
                    );

                    console.log(
                        "NODE COUNT:",
                        nodesToSave.length
                    );

                    console.log(
                        "EDGE COUNT:",
                        edgesToSave.length
                    );

                    console.log(
                        "EVENT COUNT:",
                        eventsToSave.length
                    );

                    console.log(
                        "NODES:",
                        nodesToSave
                    );

                    console.log(
                        "EDGES:",
                        edgesToSave
                    );

                    console.log(
                        "EVENTS:",
                        eventsToSave
                    );

                    console.log(
                        "PAYLOAD:",
                        payload
                    );

                    console.log(
                        "===================================="
                    );


                    // ==================================================
                    // DATABASE UPDATE
                    // ==================================================

                    const updated =
                        await caseApi.update(
                            caseId,
                            payload
                        );


                    // ==================================================
                    // IGNORE OLD RESPONSE
                    // ==================================================

                    if (
                        currentVersion !==
                        saveVersion.current
                    ) {

                        console.warn(
                            "OLD SAVE RESPONSE IGNORED."
                        );

                        return;

                    }


                    // ==================================================
                    // UPDATE CASE METADATA ONLY
                    // ==================================================
                    //
                    // DO NOT replace graph with backend response.
                    // ==================================================

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

                                    id:
                                        prev.id,

                                    nodes:
                                        nodesToSave,

                                    edges:
                                        edgesToSave,

                                    events:
                                        eventsToSave

                                };

                            }
                        );


                        console.log(
                            "CASE SAVED SUCCESSFULLY:",
                            caseId
                        );

                    }

                }
                catch (error) {

                    console.error(
                        "===================================="
                    );

                    console.error(
                        "FAILED TO SAVE CASE:",
                        error
                    );

                    console.error(
                        "CASE ID:",
                        caseId
                    );

                    console.error(
                        "===================================="
                    );


                    setApiError(
                        "Failed to save case to SQL Server."
                    );

                }

            },
            []
        );


    // ========================================================
    // HYDRATE CASE NODES
    // ========================================================

    const hydrateCaseNodes =
        useCallback(
            async (
                caseNodes: any[]
            ) => {

                if (
                    !Array.isArray(caseNodes)
                ) {

                    return [];

                }


                // ==================================================
                // ALWAYS GET FRESH ENTITIES FROM DATABASE
                // ==================================================

                let allEntities:
                    GraphEntity[] = [];


                try {

                    const entityData =
                        await entityApi.getAll();


                    if (
                        Array.isArray(entityData)
                    ) {

                        allEntities =
                            entityData.map(
                                (
                                    entity: any
                                ) =>
                                    normalizeEntity(
                                        entity
                                    )
                            );


                        // Update registry too
                        setEntityRegistry(
                            allEntities
                        );

                    }

                }
                catch (error) {

                    console.error(
                        "Failed to load entities for graph hydration:",
                        error
                    );


                    // fallback to current registry
                    allEntities =
                        entityRegistry;

                }


                console.log(
                    "ENTITIES USED FOR HYDRATION:",
                    allEntities
                );


                // ==================================================
                // HYDRATE NODES
                // ==================================================

                const hydratedNodes =
                    caseNodes.map(
                        node =>
                            hydrateSingleNode(
                                node,
                                allEntities
                            )
                    );


                console.log(
                    "HYDRATED NODES:",
                    hydratedNodes
                );


                return hydratedNodes;

            },
            [
                entityRegistry
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
                    !item?.id
                ) {

                    return;

                }


                const requestedCaseId =
                    String(
                        item.id
                    );


                // ==================================================
                // SAVE PREVIOUS CASE BEFORE SWITCHING
                // ==================================================

                if (
                    activeCaseIdRef.current &&
                    activeCaseIdRef.current !==
                    requestedCaseId
                ) {

                    try {

                        await saveCurrentCase();

                    }
                    catch (error) {

                        console.error(
                            "Failed to save previous case before switching:",
                            error
                        );

                    }

                }


                // ==================================================
                // CANCEL AUTOSAVE
                // ==================================================

                if (
                    saveTimer.current
                ) {

                    clearTimeout(
                        saveTimer.current
                    );

                    saveTimer.current =
                        null;

                }


                try {

                    setLoading(true);

                    setApiError(null);


                    // ==================================================
                    // GET FRESH CASE FROM DATABASE
                    // ==================================================

                    const freshCase =
                        await caseApi.getById(
                            requestedCaseId
                        );


                    if (
                        !freshCase
                    ) {

                        throw new Error(
                            "Case was not found."
                        );

                    }


                    const graphCase =
                        freshCase as GraphCaseItem;


                    // ==================================================
                    // GET GRAPH
                    // ==================================================

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


                    console.log(
                        "RAW CASE FROM DATABASE:",
                        graphCase
                    );


                    console.log(
                        "RAW NODES FROM DATABASE:",
                        caseNodes
                    );


                    // ==================================================
                    // IMPORTANT:
                    // HYDRATE BEFORE setNodes
                    // ==================================================

                    const hydratedNodes =
                        await hydrateCaseNodes(
                            caseNodes
                        );


                    // ==================================================
                    // SET ACTIVE CASE
                    // ==================================================

                    activeCaseIdRef.current =
                        requestedCaseId;


                    initializedCase.current =
                        requestedCaseId;


                    localStorage.setItem(
                        ACTIVE_CASE_STORAGE_KEY,
                        requestedCaseId
                    );


                    // ==================================================
                    // SET CASE
                    // ==================================================

                    setSelectedCase(
                        graphCase
                    );


                    // ==================================================
                    // SET GRAPH
                    // ==================================================

                    setNodes(
                        hydratedNodes
                    );


                    setEdges(
                        caseEdges
                    );


                    setEvents(
                        caseEvents
                    );


                    // ==================================================
                    // CLEAR SELECTION
                    // ==================================================

                    setSelectedNode(
                        null
                    );

                    setSelectedEdge(
                        null
                    );

                    setSearchTerm(
                        ""
                    );


                    console.log(
                        "===================================="
                    );

                    console.log(
                        "CASE OPENED:",
                        requestedCaseId
                    );

                    console.log(
                        "HYDRATED NODES:",
                        hydratedNodes
                    );

                    console.log(
                        "EDGES:",
                        caseEdges
                    );

                    console.log(
                        "EVENTS:",
                        caseEvents
                    );

                    console.log(
                        "===================================="
                    );

                }
                catch (error) {

                    console.error(
                        "Failed to open case:",
                        error
                    );


                    setApiError(
                        "Failed to load case from SQL Server."
                    );

                }
                finally {

                    setLoading(false);

                }

            },
            [
                saveCurrentCase,
                hydrateCaseNodes
            ]
        );


    // ========================================================
    // RESTORE ACTIVE CASE
    // ========================================================

    useEffect(() => {

        const restoreActiveCase =
            async () => {

                const savedCaseId =
                    localStorage.getItem(
                        ACTIVE_CASE_STORAGE_KEY
                    );


                if (
                    !savedCaseId
                ) {

                    return;

                }


                if (
                    initializedCase.current
                ) {

                    return;

                }


                try {

                    setLoading(true);


                    // ==================================================
                    // GET CASE FROM DATABASE
                    // ==================================================

                    const savedCase =
                        await caseApi.getById(
                            String(
                                savedCaseId
                            )
                        );


                    if (
                        !savedCase
                    ) {

                        localStorage.removeItem(
                            ACTIVE_CASE_STORAGE_KEY
                        );

                        return;

                    }


                    await openCase(
                        savedCase as CaseItem
                    );

                }
                catch (error) {

                    console.error(
                        "Failed to restore active case:",
                        error
                    );

                }
                finally {

                    setLoading(false);

                }

            };


        void restoreActiveCase();

    }, [
        openCase
    ]);


    // ========================================================
    // CLEAR CASE
    // ========================================================

    const clearCase =
        useCallback(
            () => {

                if (
                    saveTimer.current
                ) {

                    clearTimeout(
                        saveTimer.current
                    );

                    saveTimer.current =
                        null;

                }


                initializedCase.current =
                    null;


                activeCaseIdRef.current =
                    null;


                selectedCaseRef.current =
                    null;


                nodesRef.current =
                    [];

                edgesRef.current =
                    [];

                eventsRef.current =
                    [];


                localStorage.removeItem(
                    ACTIVE_CASE_STORAGE_KEY
                );


                setSelectedCase(
                    null
                );

                setNodes([]);

                setEdges([]);

                setEvents([]);

                setSelectedNode(
                    null
                );

                setSelectedEdge(
                    null
                );

                setSearchTerm("");

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

                const currentCase =
                    selectedCaseRef.current;


                if (
                    !currentCase?.id
                ) {

                    console.warn(
                        "Cannot create event without an active case."
                    );

                    return null;

                }


                const eventDate =
                    typeof event?.date === "string" &&
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
                        currentCase.id,

                    title:
                        typeof event?.title === "string" &&
                            event.title.trim() !== ""

                            ? event.title

                            : "Event",

                    type:
                        typeof event?.type === "string" &&
                            event.type.trim() !== ""

                            ? event.type

                            : "event",

                    description:
                        typeof event?.description === "string"

                            ? event.description

                            : "",

                    date:
                        eventDate

                };


                // ==================================================
                // OPTIMISTIC UI
                // ==================================================

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
                                String(
                                    currentCase.id
                                ),

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
                                    eventItem =>

                                        String(
                                            eventItem.id
                                        )
                                            ===
                                            String(
                                                newEvent.id
                                            )

                                            ? {

                                                ...eventItem,

                                                id:
                                                    backendEvent.id,

                                                caseId:
                                                    backendEvent.caseId ??
                                                    currentCase.id

                                            }

                                            :

                                            eventItem
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
                                eventItem =>

                                    String(
                                        eventItem.id
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
            []
        );


    // ========================================================
    // REFRESH CURRENT CASE
    // ========================================================

    const refreshCurrentCase =
        useCallback(
            async () => {

                const currentCase =
                    selectedCaseRef.current;


                if (
                    !currentCase?.id
                ) {

                    return;

                }


                try {

                    setLoading(true);

                    setApiError(null);


                    // ==================================================
                    // GET FRESH CASE
                    // ==================================================

                    const fresh =
                        await caseApi.getById(
                            String(
                                currentCase.id
                            )
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


                    // ==================================================
                    // HYDRATE
                    // ==================================================

                    const hydratedNodes =
                        await hydrateCaseNodes(
                            freshNodes
                        );


                    // ==================================================
                    // SET STATE
                    // ==================================================

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


                    // ==================================================
                    // ACTIVE CASE
                    // ==================================================

                    activeCaseIdRef.current =
                        String(
                            freshCase.id
                        );


                    initializedCase.current =
                        String(
                            freshCase.id
                        );


                    localStorage.setItem(
                        ACTIVE_CASE_STORAGE_KEY,
                        String(
                            freshCase.id
                        )
                    );


                    console.log(
                        "CASE REFRESHED FROM DATABASE:",
                        freshCase.id
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

                    setLoading(false);

                }

            },
            [
                hydrateCaseNodes
            ]
        );


    // ========================================================
    // AUTO SAVE
    // ========================================================

    useEffect(() => {

        if (
            !selectedCase?.id
        ) {

            return;

        }


        const caseId =
            String(
                selectedCase.id
            );


        // ==================================================
        // MUST BE ACTIVE CASE
        // ==================================================

        if (
            activeCaseIdRef.current !==
            caseId
        ) {

            return;

        }


        // ==================================================
        // MUST BE INITIALIZED
        // ==================================================

        if (
            initializedCase.current !==
            caseId
        ) {

            return;

        }


        // ==================================================
        // CLEAR OLD TIMER
        // ==================================================

        if (
            saveTimer.current
        ) {

            clearTimeout(
                saveTimer.current
            );

        }


        // ==================================================
        // SAVE AFTER 700ms
        // ==================================================

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

                saveTimer.current =
                    null;

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


                // ==================================================
                // REMOVE NODE
                // ==================================================

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


                // ==================================================
                // REMOVE CONNECTED EDGES
                // ==================================================

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


                // ==================================================
                // CLEAR NODE SELECTION
                // ==================================================

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


                // ==================================================
                // CLEAR EDGE SELECTION
                // ==================================================

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


                // ==================================================
                // DELETE MASTER ENTITY
                // ==================================================

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

                    }

                }


                // ==================================================
                // CREATE EVENT
                // ==================================================

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


                // ==================================================
                // REMOVE FROM GRAPH
                // ==================================================

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


                // ==================================================
                // CLEAR SELECTION
                // ==================================================

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


                // ==================================================
                // DELETE RELATIONSHIP FROM DATABASE
                // ==================================================

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

                }


                // ==================================================
                // CREATE EVENT
                // ==================================================

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

                saveTimer.current =
                    null;

            }

        };

    }, []);


    // ========================================================
    // PROVIDER
    // ========================================================

    return (

        <GraphContext.Provider

            value={{

                // ============================================
                // GRAPH
                // ============================================

                nodes,

                setNodes,

                edges,

                setEdges,


                // ============================================
                // ENTITIES
                // ============================================

                entityRegistry,

                registerEntity,

                findEntityByName,

                searchEntities,

                addEntityToGraph,


                // ============================================
                // SELECTION
                // ============================================

                selectedNode,

                setSelectedNode,

                selectedEdge,

                setSelectedEdge,


                // ============================================
                // CASE
                // ============================================

                selectedCase,

                setSelectedCase,

                openCase,

                clearCase,


                // ============================================
                // EVENTS
                // ============================================

                events,

                setEvents,

                addEvent,


                // ============================================
                // DELETE
                // ============================================

                deleteNode,

                deleteEdge,


                // ============================================
                // SAVE / REFRESH
                // ============================================

                saveCurrentCase,

                refreshCurrentCase,


                // ============================================
                // SEARCH
                // ============================================

                searchTerm,

                setSearchTerm,


                // ============================================
                // API STATE
                // ============================================

                loading,

                apiError,


                // ============================================
                // LOAD
                // ============================================

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