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

    role?: string | null;

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

const ACTIVE_CASE_STORAGE_KEY =
    "igs-active-case-id";


// ============================================================
// HELPERS
// ============================================================

function isValidValue(
    value: any
): boolean {

    return (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    );

}


function normalizeIcon(
    value: any
): string {

    if (
        isValidValue(value)
    ) {

        return String(value);

    }

    return "❓";

}


function normalizeAttributes(
    value: any
): Record<string, any> {

    if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
    ) {

        return value;

    }


    if (
        typeof value === "string"
    ) {

        try {

            const parsed =
                JSON.parse(value);

            if (
                parsed &&
                typeof parsed === "object"
            ) {

                return parsed;

            }

        }
        catch {

            // Ignore invalid JSON

        }

    }


    return {};

}


// ============================================================
// GET VALUE FROM ENTITY / NODE
// ============================================================
//
// This is the important fix.
//
// Excel/import data can arrive as:
//
// entity.name
// entity.entityName
// entity.entityType
//
// OR:
//
// entity.data.name
// entity.data.entityName
// entity.data.entityType
//
// OR:
//
// entity.data.properties.name
//
// We always resolve the real value before falling back.
// ============================================================

function getEntityName(
    entity: any
): string {

    const data =
        entity?.data ?? {};

    const properties =
        data?.properties ??
        entity?.properties ??
        {};


    const value =

        entity?.name ??

        entity?.entityName ??

        data?.name ??

        data?.entityName ??

        properties?.name ??

        properties?.entityName ??

        entity?.attributes?.name ??

        data?.attributes?.name ??

        "Unnamed Entity";


    return String(value);

}


function getEntityType(
    entity: any
): string {

    const data =
        entity?.data ?? {};

    const properties =
        data?.properties ??
        entity?.properties ??
        {};


    const value =

        entity?.entityType ??

        entity?.type ??

        data?.entityType ??

        data?.type ??

        properties?.entityType ??

        properties?.type ??

        "Unknown";


    return String(value);

}


function getEntityCategory(
    entity: any
): string {

    const data =
        entity?.data ?? {};

    const properties =
        data?.properties ??
        entity?.properties ??
        {};


    const value =

        entity?.category ??

        data?.category ??

        properties?.category ??

        "Unknown";


    return String(value);

}


function getEntityIcon(
    entity: any
): string {

    const data =
        entity?.data ?? {};

    const properties =
        data?.properties ??
        entity?.properties ??
        {};


    return normalizeIcon(

        entity?.icon ??

        data?.icon ??

        properties?.icon

    );

}


function getEntityRole(
    entity: any
): string | null {

    const data =
        entity?.data ?? {};

    const properties =
        data?.properties ??
        entity?.properties ??
        {};


    const value =

        entity?.role ??

        data?.role ??

        properties?.role ??

        null;


    return isValidValue(value)
        ? String(value)
        : null;

}


function getEntityId(
    entity: any
): string | number | undefined {

    const data =
        entity?.data ?? {};

    const value =

        entity?.entityId ??

        entity?.entityID ??

        data?.entityId ??

        data?.entityID ??

        entity?.id ??

        data?.id;


    if (
        !isValidValue(value)
    ) {

        return undefined;

    }


    return value;

}


// ============================================================
// NORMALIZE ENTITY
// ============================================================

function normalizeEntity(
    entity: any
): GraphEntity {

    const attributes = normalizeAttributes(

        entity?.attributes ??

        entity?.data?.attributes ??

        entity?.properties ??

        entity?.data?.properties ??

        entity?.attributesJson ??

        entity?.data?.attributesJson

    );


    const id =
        getEntityId(entity);


    return {

        id:
            id ??
            `temporary-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 8)}`,

        name:
            getEntityName(
                entity
            ),

        type:
            getEntityType(
                entity
            ),

        category:
            getEntityCategory(
                entity
            ),

        icon:
            getEntityIcon(
                entity
            ),

        role:
            getEntityRole(
                entity
            ),

        attributes,

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
// GET REAL NODE ENTITY ID
// ============================================================

function getNodeEntityId(
    node: any
): string | number | undefined {

    const data =
        node?.data ?? {};


    const entity =
        data?.entity ??
        node?.entity;


    const value =

        data?.entityId ??

        data?.entityID ??

        entity?.id ??

        entity?.entityId ??

        node?.entityId;


    if (
        !isValidValue(value)
    ) {

        return undefined;

    }


    return value;

}


// ============================================================
// GET NODE DATA
// ============================================================

function getNodeData(
    node: any
): any {

    return (
        node?.data &&
        typeof node.data === "object"
    )
        ? node.data
        : {};

}


// ============================================================
// HYDRATE NODE
// ============================================================
//
// IMPORTANT:
//
// Never use node.id as entityId.
//
// node.id = ReactFlow node ID
//
// entityId = database Entity ID
//
// They are two different things.
// ============================================================

function hydrateSingleNode(
    node: any,
    allEntities: GraphEntity[]
) {

    const data =
        getNodeData(node);


    const entityId =
        getNodeEntityId(node);


    let masterEntity:
        GraphEntity | undefined;


    // ========================================================
    // FIRST: FIND BY ENTITY ID
    // ========================================================

    if (
        entityId !== undefined
    ) {

        masterEntity =
            allEntities.find(
                entity =>

                    String(
                        entity.id
                    )
                    ===
                    String(
                        entityId
                    )
            );

    }


    // ========================================================
    // SECOND: FIND BY NAME
    // ========================================================

    if (
        !masterEntity
    ) {

        const nodeName =

            data?.name ??

            data?.label ??

            node?.name ??

            node?.label;


        if (
            isValidValue(nodeName)
        ) {

            const normalizedName =
                String(nodeName)
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
    // POSITION
    // ========================================================

    const x =

        Number(
            node?.position?.x
        );

    const y =

        Number(
            node?.position?.y
        );


    const safeX =
        Number.isFinite(x)
            ? x
            : (
                Number.isFinite(
                    Number(node?.x)
                )
                    ? Number(node.x)
                    : 0
            );


    const safeY =
        Number.isFinite(y)
            ? y
            : (
                Number.isFinite(
                    Number(node?.y)
                )
                    ? Number(node.y)
                    : 0
            );


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
                safeX,

            y:
                safeY

        }

    };


    // ========================================================
    // ENTITY FOUND
    // ========================================================

    if (
        masterEntity
    ) {

        return {

            ...normalizedNode,

            data: {

                ...data,

                entityId:
                    masterEntity.id,

                name:
                    masterEntity.name,

                label:
                    masterEntity.name,

                type:
                    masterEntity.type,

                entityType:
                    masterEntity.type,

                category:
                    masterEntity.category,

                icon:
                    normalizeIcon(
                        masterEntity.icon
                    ),

                role:
                    masterEntity.role ?? null,

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
    // DO NOT CREATE UNKNOWN.
    //
    // Preserve whatever is already in the case.
    // ========================================================

    console.warn(
        "ENTITY NOT FOUND FOR NODE",
        {
            nodeId: node?.id,
            entityId,
            data
        }
    );


    return {

        ...normalizedNode,

        data: {

            ...data,

            entityId:
                entityId,

            name:
                data?.name ??
                data?.label ??
                node?.name ??
                node?.label ??
                "",

            label:
                data?.label ??
                data?.name ??
                node?.label ??
                node?.name ??
                "",

            type:
                data?.type ??
                data?.entityType ??
                node?.type ??
                "",

            entityType:
                data?.entityType ??
                data?.type ??
                "",

            category:
                data?.category ??
                "",

            icon:
                normalizeIcon(
                    data?.icon
                ),

            role:
                data?.role ??
                null,

            attributes:
                normalizeAttributes(
                    data?.attributes
                )

        }

    };

}


// ============================================================
// SERIALIZE NODE FOR DATABASE
// ============================================================
//
// ReactFlow:
//
// node.position.x
// node.position.y
// node.data.name
// node.data.entityId
//
// Database:
//
// x
// y
// name
// entityId
//
// This function converts one into the other.
// ============================================================

function serializeNodeForDatabase(
    node: any
) {

    const data =
        getNodeData(node);


    const entity =
        data?.entity ??
        node?.entity ??
        null;


    const entityId =

        data?.entityId ??

        data?.entityID ??

        entity?.id ??

        node?.entityId;


    const name =

        data?.name ??

        data?.label ??

        entity?.name ??

        node?.name;


    const label =

        data?.label ??

        data?.name ??

        entity?.name ??

        node?.label;


    const entityType =

        data?.entityType ??

        data?.type ??

        entity?.type;


    const category =

        data?.category ??

        entity?.category;


    const icon =

        data?.icon ??

        entity?.icon;


    const role =

        data?.role ??

        entity?.role ??
        null;


    const attributes =

        normalizeAttributes(

            data?.attributes ??

            entity?.attributes ??

            {}

        );


    const x =
        Number(
            node?.position?.x
        );


    const y =
        Number(
            node?.position?.y
        );


    const safeX =
        Number.isFinite(x)
            ? x
            : 0;


    const safeY =
        Number.isFinite(y)
            ? y
            : 0;


    return {

        // ReactFlow node ID
        id:
            String(
                node?.id
            ),

        // REAL DATABASE ENTITY ID
        entityId:
            entityId !== undefined &&
                entityId !== null
                ? String(entityId)
                : null,

        // ReactFlow type
        type:
            node?.type ??
            "custom",

        // REAL CANVAS POSITION
        x:
            safeX,

        y:
            safeY,

        // Properties
        label:
            label ?? "",

        name:
            name ?? "",

        entityType:
            entityType ?? "",

        category:
            category ?? "",

        icon:
            normalizeIcon(icon),

        role,

        attributesJson:
            JSON.stringify(
                attributes
            ),

        // Keep original ReactFlow data too
        data: {

            ...data,

            entityId:
                entityId,

            name:
                name ?? "",

            label:
                label ?? "",

            type:
                entityType ?? "",

            entityType:
                entityType ?? "",

            category:
                category ?? "",

            icon:
                normalizeIcon(icon),

            role,

            attributes

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
    // REFS
    // ========================================================

    const saveTimer =
        useRef<
            ReturnType<typeof setTimeout> | null
        >(null);


    const activeCaseIdRef =
        useRef<string | null>(
            null
        );


    const initializedCase =
        useRef<string | null>(
            null
        );


    const saveVersion =
        useRef(0);


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
                        data
                            .map(
                                (
                                    entity: any
                                ) =>
                                    normalizeEntity(
                                        entity
                                    )
                            )
                            .filter(
                                entity =>
                                    isValidValue(
                                        entity.name
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


                        let attributesText =
                            "";


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


                // ====================================================
                // NEVER SAVE UNKNOWN ENTITY
                // ====================================================

                if (
                    !isValidValue(
                        normalizedInput.name
                    ) ||

                    normalizedInput.name
                        .trim()
                        .toLowerCase()
                    ===
                    "unknown"
                ) {

                    console.error(
                        "BLOCKED ENTITY SAVE:",
                        normalizedInput
                    );

                    setApiError(
                        "Entity has no valid name."
                    );

                    return null;

                }


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

                    const payload = {

                        name:
                            normalizedInput.name,

                        type:
                            normalizedInput.type,

                        category:
                            normalizedInput.category,

                        icon:
                            normalizedInput.icon,

                        role:
                            normalizedInput.role ?? null,

                        attributes:
                            normalizedInput.attributes

                    };


                    console.log(
                        "CREATING REAL ENTITY:",
                        payload
                    );


                    const created =
                        await entityApi.create(
                            payload
                        );


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


                console.log(
                    "ADDING ENTITY TO GRAPH:",
                    entity
                );


                let masterEntity =
                    normalizeEntity(
                        entity
                    );


                // ====================================================
                // DO NOT ACCEPT UNKNOWN
                // ====================================================

                if (
                    !isValidValue(
                        masterEntity.name
                    ) ||

                    masterEntity.name
                        .trim()
                        .toLowerCase()
                    ===
                    "unknown"
                ) {

                    console.error(
                        "INVALID ENTITY PASSED TO GRAPH:",
                        entity
                    );

                    return null;

                }


                // ====================================================
                // FIND EXISTING ENTITY BY ID
                // ====================================================

                const incomingId =
                    getEntityId(
                        entity
                    );


                let existing:
                    GraphEntity | undefined;


                if (
                    incomingId !== undefined
                ) {

                    existing =
                        entityRegistry.find(
                            item =>

                                String(
                                    item.id
                                )
                                ===
                                String(
                                    incomingId
                                )
                        );

                }


                // ====================================================
                // FIND BY NAME + TYPE
                // ====================================================

                if (
                    !existing
                ) {

                    existing =
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

                }


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
                        !registered
                    ) {

                        return null;

                    }


                    masterEntity =
                        registered;

                }


                // ====================================================
                // DUPLICATE NODE CHECK
                // ====================================================

                const duplicate =
                    nodes.find(
                        node => {

                            const nodeEntityId =
                                getNodeEntityId(
                                    node
                                );


                            return (

                                nodeEntityId !==
                                undefined &&

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
                    `node-${Date.now()}-${Math.random()
                        .toString(36)
                        .substring(2, 8)}`;


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

                        // IMPORTANT
                        // This is REAL ENTITY ID
                        entityId:
                            masterEntity.id,

                        id:
                            masterEntity.id,

                        name:
                            masterEntity.name,

                        label:
                            masterEntity.name,

                        type:
                            masterEntity.type,

                        entityType:
                            masterEntity.type,

                        category:
                            masterEntity.category,

                        icon:
                            normalizeIcon(
                                masterEntity.icon
                            ),

                        role:
                            masterEntity.role ?? null,

                        attributes:
                            masterEntity.attributes,

                        entity:
                            masterEntity

                    }

                };


                console.log(
                    "NEW GRAPH NODE:",
                    newNode
                );


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


                if (
                    activeCaseIdRef.current &&
                    activeCaseIdRef.current !==
                    caseId
                ) {

                    console.warn(
                        "SAVE SKIPPED: Case is no longer active."
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
                    // SERIALIZE NODES
                    // ==================================================

                    const nodesToSave =
                        nodesRef.current.map(
                            node =>
                                serializeNodeForDatabase(
                                    node
                                )
                        );


                    // ==================================================
                    // EDGES
                    // ==================================================

                    const edgesToSave =
                        JSON.parse(
                            JSON.stringify(
                                edgesRef.current
                            )
                        );


                    // ==================================================
                    // EVENTS
                    // ==================================================

                    const eventsToSave =
                        JSON.parse(
                            JSON.stringify(
                                eventsRef.current
                            )
                        );


                    // ==================================================
                    // DEBUG
                    // ==================================================

                    console.log(
                        "===================================="
                    );

                    console.log(
                        "SAVING CASE"
                    );

                    console.log(
                        "CASE:",
                        caseId
                    );

                    console.log(
                        "NODES TO SAVE:",
                        nodesToSave
                    );

                    console.log(
                        "EDGES TO SAVE:",
                        edgesToSave
                    );

                    console.log(
                        "EVENTS TO SAVE:",
                        eventsToSave
                    );

                    console.log(
                        "===================================="
                    );


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


                    console.log(
                        "FINAL CASE PAYLOAD:",
                        payload
                    );


                    const updated =
                        await caseApi.update(
                            caseId,
                            payload
                        );


                    if (
                        currentVersion !==
                        saveVersion.current
                    ) {

                        return;

                    }


                    if (
                        updated
                    ) {

                        setSelectedCase(
                            prev => {

                                if (
                                    !prev
                                ) {

                                    return null;

                                }


                                return {

                                    ...prev,

                                    ...(updated as any),

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

                    }


                    console.log(
                        "CASE SAVED SUCCESSFULLY:",
                        caseId
                    );

                }
                catch (error) {

                    console.error(
                        "FAILED TO SAVE CASE:",
                        error
                    );

                    setApiError(
                        "Failed to save case to SQL Server."
                    );

                }

            },
            []
        );


    // ========================================================
    // HYDRATE CASE
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


                let allEntities:
                    GraphEntity[] = [];


                try {

                    const entityData =
                        await entityApi.getAll();


                    if (
                        Array.isArray(
                            entityData
                        )
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


                        setEntityRegistry(
                            allEntities
                        );

                    }

                }
                catch (error) {

                    console.error(
                        "Failed to load entities:",
                        error
                    );


                    allEntities =
                        entityRegistry;

                }


                const hydratedNodes =
                    caseNodes.map(
                        node => {

                            // ========================================
                            // Backend flat node → ReactFlow node
                            // ========================================

                            const reactFlowNode = {

                                ...node,

                                id:
                                    String(
                                        node?.id
                                    ),

                                type:
                                    node?.type ??
                                    "custom",

                                position: {

                                    x:
                                        Number(
                                            node?.x
                                        ) || 0,

                                    y:
                                        Number(
                                            node?.y
                                        ) || 0

                                },

                                data: {

                                    ...(node?.data ?? {}),

                                    entityId:
                                        node?.entityId ??
                                        node?.data?.entityId,

                                    name:
                                        node?.name ??
                                        node?.label ??
                                        node?.data?.name ??
                                        node?.data?.label ??
                                        "",

                                    label:
                                        node?.label ??
                                        node?.name ??
                                        node?.data?.label ??
                                        node?.data?.name ??
                                        "",

                                    type:
                                        node?.entityType ??
                                        node?.data?.entityType ??
                                        node?.data?.type ??
                                        "",

                                    entityType:
                                        node?.entityType ??
                                        node?.data?.entityType ??
                                        node?.data?.type ??
                                        "",

                                    category:
                                        node?.category ??
                                        node?.data?.category ??
                                        "",

                                    icon:
                                        normalizeIcon(
                                            node?.icon ??
                                            node?.data?.icon
                                        ),

                                    role:
                                        node?.role ??
                                        node?.data?.role ??
                                        null,

                                    attributes:
                                        normalizeAttributes(
                                            node?.data?.attributes ??
                                            node?.attributesJson ??
                                            node?.attributes
                                        )

                                }

                            };


                            return hydrateSingleNode(
                                reactFlowNode,
                                allEntities
                            );

                        }
                    );


                console.log(
                    "HYDRATED CASE NODES:",
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
                            "Failed saving previous case:",
                            error
                        );

                    }

                }


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
                        "RAW CASE:",
                        graphCase
                    );


                    console.log(
                        "RAW NODES:",
                        caseNodes
                    );


                    const hydratedNodes =
                        await hydrateCaseNodes(
                            caseNodes
                        );


                    activeCaseIdRef.current =
                        requestedCaseId;


                    initializedCase.current =
                        requestedCaseId;


                    localStorage.setItem(
                        ACTIVE_CASE_STORAGE_KEY,
                        requestedCaseId
                    );


                    setSelectedCase(
                        graphCase
                    );


                    setNodes(
                        hydratedNodes
                    );


                    setEdges(
                        caseEdges
                    );


                    setEvents(
                        caseEvents
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


                    console.log(
                        "CASE OPENED:",
                        requestedCaseId
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

        const restore =
            async () => {

                const savedCaseId =
                    localStorage.getItem(
                        ACTIVE_CASE_STORAGE_KEY
                    );


                if (
                    !savedCaseId ||
                    initializedCase.current
                ) {

                    return;

                }


                try {

                    await openCase({

                        id:
                            savedCaseId

                    } as CaseItem);

                }
                catch (error) {

                    console.error(
                        "Failed to restore case:",
                        error
                    );

                }

            };


        void restore();

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
    // REFRESH CASE
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


                    const hydratedNodes =
                        await hydrateCaseNodes(
                            freshNodes
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


        if (
            activeCaseIdRef.current !==
            caseId
        ) {

            return;

        }


        if (
            initializedCase.current !==
            caseId
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
                    getNodeEntityId(
                        node
                    );


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


                // NOTE:
                // Deleting graph node does NOT automatically
                // delete master entity.
                //
                // This prevents destroying the master entity
                // just because a node was removed from a case.

                try {

                    await addEvent({

                        title:
                            "Entity Removed From Graph",

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

                nodes,

                setNodes,

                edges,

                setEdges,

                entityRegistry,

                registerEntity,

                findEntityByName,

                searchEntities,

                addEntityToGraph,

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

                saveCurrentCase,

                refreshCurrentCase,

                searchTerm,

                setSearchTerm,

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