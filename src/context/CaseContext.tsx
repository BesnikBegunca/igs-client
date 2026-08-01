import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback
} from "react";

import type {
    ReactNode
} from "react";

import {
    caseApi
} from "../api/caseApi";


// ============================================================
// CASE ITEM
// ============================================================

export interface CaseItem {

    id: string;

    name: string;

    title: string;

    description: string;

    status:
    | "open"
    | "closed"
    | "archived"
    | "active";

    createdAt: string;

    updatedAt?: string;

    // ========================================================
    // GRAPH
    // ========================================================

    nodes: any[];

    edges: any[];

    events: any[];

    // ========================================================
    // OPTIONAL
    // ========================================================

    entities?: any[];

    relationships?: any[];

    evidence?: any[];

    documents?: any[];

    locations?: any[];

    communications?: any[];

    notes?: any[];

}


// ============================================================
// CONTEXT TYPE
// ============================================================

interface CaseContextType {

    cases: CaseItem[];

    activeCase: CaseItem | null;

    addCase: (
        data: Omit<
            CaseItem,
            | "id"
            | "createdAt"
            | "updatedAt"
            | "nodes"
            | "edges"
            | "events"
        >
    ) => Promise<void>;

    deleteCase: (
        id: string
    ) => Promise<void>;

    updateCase: (
        id: string,
        data: Partial<CaseItem>
    ) => Promise<void>;

    openCase: (
        id: string
    ) => Promise<void>;

    refreshCases: () => Promise<void>;

}


// ============================================================
// CONTEXT
// ============================================================

const CaseContext =
    createContext<CaseContextType | null>(
        null
    );


// ============================================================
// STORAGE
// ============================================================

const ACTIVE_CASE_STORAGE_KEY =
    "igs-active-case-id";


// ============================================================
// SAFE ARRAY
// ============================================================

function safeArray(
    value: any
): any[] {

    return Array.isArray(value)
        ? value
        : [];

}


// ============================================================
// NORMALIZE STATUS
// ============================================================

function normalizeStatus(
    value: any
): CaseItem["status"] {

    const status =
        String(
            value ?? "open"
        )
            .trim()
            .toLowerCase();

    switch (status) {

        case "closed":
            return "closed";

        case "archived":
            return "archived";

        case "active":
            return "active";

        case "open":
        default:
            return "open";
    }
}


// ============================================================
// NORMALIZE NODE FROM BACKEND
//
// Backend returns:
// {
//   id,
//   type,
//   x,
//   y,
//   label,
//   name,
//   entityType,
//   category,
//   icon,
//   role,
//   attributesJson
// }
//
// ReactFlow needs:
// {
//   id,
//   type,
//   position,
//   data
// }
// ============================================================

function normalizeNode(
    node: any
): any {

    const id =
        String(
            node?.id ??
            ""
        );

    const label =
        node?.label ??
        node?.name ??
        "Unknown";

    const entityType =
        node?.entityType ??
        node?.type ??
        "Unknown";

    const category =
        node?.category ??
        "Unknown";

    const icon =
        node?.icon ??
        "❓";

    let attributes: any = {};

    if (
        node?.attributes
    ) {

        attributes =
            node.attributes;

    }
    else if (
        node?.attributesJson
    ) {

        try {

            attributes =
                typeof node.attributesJson === "string"
                    ? JSON.parse(
                        node.attributesJson
                    )
                    : node.attributesJson;

        }
        catch {

            attributes = {};

        }

    }

    return {

        id,

        type:
            node?.type === "custom"
                ? "custom"
                : "custom",

        position: {

            x:
                Number(
                    node?.x ??
                    node?.position?.x ??
                    0
                ),

            y:
                Number(
                    node?.y ??
                    node?.position?.y ??
                    0
                )

        },

        data: {

            label,

            name:
                node?.name ??
                label,

            type:
                entityType,

            entityType,

            category,

            icon,

            role:
                node?.role ??
                "",

            attributes

        }

    };

}


// ============================================================
// NORMALIZE EDGE FROM BACKEND
// ============================================================

function normalizeEdge(
    edge: any
): any {

    return {

        id:
            String(
                edge?.id ??
                crypto.randomUUID()
            ),

        source:
            String(
                edge?.source ??
                ""
            ),

        target:
            String(
                edge?.target ??
                ""
            ),

        type:
            edge?.type ??
            "default",

        data: {

            label:
                edge?.label ??
                edge?.relationshipType ??
                "related",

            relationshipType:
                edge?.relationshipType ??
                edge?.label ??
                "related",

            description:
                edge?.description ??
                "",

            evidence:
                edge?.evidence ??
                "",

            date:
                edge?.date ??
                null,

            monitored:
                edge?.monitored ??
                false

        }

    };

}


// ============================================================
// REACTFLOW NODE -> BACKEND DTO
//
// THIS IS THE IMPORTANT FIX.
// ============================================================

function serializeNode(
    node: any
): any {

    const data =
        node?.data ??
        {};

    let attributesJson =
        null;

    if (
        data?.attributesJson
    ) {

        attributesJson =
            data.attributesJson;

    }
    else if (
        data?.attributes
    ) {

        try {

            attributesJson =
                JSON.stringify(
                    data.attributes
                );

        }
        catch {

            attributesJson =
                null;

        }

    }

    return {

        id:
            String(
                node?.id ??
                ""
            ),

        type:
            node?.type ??
            "default",

        x:
            node?.position?.x ??
            0,

        y:
            node?.position?.y ??
            0,

        label:
            data?.label ??
            data?.name ??
            node?.label ??
            "Unknown",

        name:
            data?.name ??
            data?.label ??
            node?.name ??
            "Unknown",

        entityType:
            data?.entityType ??
            data?.type ??
            node?.entityType ??
            "Unknown",

        category:
            data?.category ??
            "Unknown",

        icon:
            data?.icon ??
            null,

        role:
            data?.role ??
            null,

        attributesJson

    };

}


// ============================================================
// REACTFLOW EDGE -> BACKEND DTO
// ============================================================

function serializeEdge(
    edge: any
): any {

    const data =
        edge?.data ??
        {};

    return {

        id:
            String(
                edge?.id ??
                crypto.randomUUID()
            ),

        source:
            String(
                edge?.source ??
                ""
            ),

        target:
            String(
                edge?.target ??
                ""
            ),

        type:
            edge?.type ??
            "default",

        label:
            data?.label ??
            edge?.label ??
            data?.relationshipType ??
            "related",

        relationshipType:
            data?.relationshipType ??
            data?.label ??
            edge?.label ??
            "related",

        description:
            data?.description ??
            edge?.description ??
            null,

        evidence:
            data?.evidence ??
            edge?.evidence ??
            null,

        date:
            data?.date ??
            edge?.date ??
            null,

        monitored:
            data?.monitored ??
            edge?.monitored ??
            false

    };

}


// ============================================================
// NORMALIZE CASE
// ============================================================

function normalizeCase(
    item: any
): CaseItem {

    return {

        id:
            String(
                item?.id ??
                ""
            ),

        name:
            item?.name ??
            item?.title ??
            "",

        title:
            item?.title ??
            item?.name ??
            "",

        description:
            item?.description ??
            "",

        status:
            normalizeStatus(
                item?.status
            ),

        createdAt:
            item?.createdAt ??
            new Date().toISOString(),

        updatedAt:
            item?.updatedAt ??
            undefined,

        // ====================================================
        // GRAPH
        // ====================================================

        nodes:
            safeArray(
                item?.nodes
            )
                .map(
                    normalizeNode
                ),

        edges:
            safeArray(
                item?.edges
            )
                .map(
                    normalizeEdge
                ),

        events:
            safeArray(
                item?.events
            ),

        // ====================================================
        // OPTIONAL
        // ====================================================

        entities:
            safeArray(
                item?.entities
            ),

        relationships:
            safeArray(
                item?.relationships
            ),

        evidence:
            safeArray(
                item?.evidence
            ),

        documents:
            safeArray(
                item?.documents
            ),

        locations:
            safeArray(
                item?.locations
            ),

        communications:
            safeArray(
                item?.communications
            ),

        notes:
            safeArray(
                item?.notes
            )

    };

}


// ============================================================
// PROVIDER
// ============================================================

export function CaseProvider({

    children

}: {

    children: ReactNode;

}) {

    const [
        cases,
        setCases
    ] = useState<CaseItem[]>([]);

    const [
        activeCase,
        setActiveCase
    ] = useState<CaseItem | null>(
        null
    );


    // ========================================================
    // REFRESH
    // ========================================================

    const refreshCases =
        useCallback(
            async () => {

                try {

                    const data =
                        await caseApi.getAll();

                    if (
                        !Array.isArray(data)
                    ) {

                        setCases([]);

                        return;

                    }

                    const normalizedCases =
                        data.map(
                            normalizeCase
                        );

                    setCases(
                        normalizedCases
                    );

                    const savedCaseId =
                        localStorage.getItem(
                            ACTIVE_CASE_STORAGE_KEY
                        );

                    if (
                        savedCaseId
                    ) {

                        const restored =
                            normalizedCases.find(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(
                                        savedCaseId
                                    )
                            );

                        if (
                            restored
                        ) {

                            setActiveCase(
                                restored
                            );

                        }
                        else {

                            localStorage.removeItem(
                                ACTIVE_CASE_STORAGE_KEY
                            );

                            setActiveCase(
                                null
                            );

                        }

                    }

                }
                catch (error) {

                    console.error(
                        "Failed to load cases:",
                        error
                    );

                }

            },
            []
        );


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(
        () => {

            void refreshCases();

        },
        [
            refreshCases
        ]
    );


    // ========================================================
    // ADD CASE
    // ========================================================

    const addCase =
        useCallback(
            async (

                data: Omit<
                    CaseItem,
                    | "id"
                    | "createdAt"
                    | "updatedAt"
                    | "nodes"
                    | "edges"
                    | "events"
                >

            ) => {

                const payload = {

                    name:
                        data.name ??
                        data.title ??
                        "",

                    title:
                        data.title ??
                        data.name ??
                        "",

                    description:
                        data.description ??
                        "",

                    status:
                        data.status ??
                        "open",

                    nodes: [],

                    edges: [],

                    events: []

                };

                try {

                    const created =
                        await caseApi.create(
                            payload as any
                        );

                    if (
                        !created
                    ) {

                        throw new Error(
                            "Backend did not return created case."
                        );

                    }

                    const newCase =
                        normalizeCase(
                            created
                        );

                    setCases(
                        previous => [

                            ...previous,

                            newCase

                        ]
                    );

                    setActiveCase(
                        newCase
                    );

                    localStorage.setItem(
                        ACTIVE_CASE_STORAGE_KEY,
                        newCase.id
                    );

                }
                catch (error) {

                    console.error(
                        "Failed to create case:",
                        error
                    );

                    throw error;

                }

            },
            []
        );


    // ========================================================
    // UPDATE CASE
    // ========================================================

    const updateCase =
        useCallback(
            async (

                id: string,

                data: Partial<CaseItem>

            ) => {

                try {

                    const current =
                        cases.find(
                            item =>
                                String(
                                    item.id
                                ) ===
                                String(
                                    id
                                )
                        );

                    if (
                        !current
                    ) {

                        console.warn(
                            "Case not found:",
                            id
                        );

                        return;

                    }


                    // ==================================================
                    // MERGE
                    // ==================================================

                    const updatedLocal: CaseItem = {

                        ...current,

                        ...data,

                        id:
                            current.id,

                        nodes:
                            data.nodes ??
                            current.nodes ??
                            [],

                        edges:
                            data.edges ??
                            current.edges ??
                            [],

                        events:
                            data.events ??
                            current.events ??
                            [],

                        updatedAt:
                            new Date().toISOString()

                    };


                    // ==================================================
                    // IMPORTANT:
                    // REACTFLOW -> BACKEND
                    // ==================================================

                    const backendNodes =
                        updatedLocal.nodes
                            .map(
                                serializeNode
                            )
                            .filter(
                                node =>
                                    node.id
                            );


                    const backendEdges =
                        updatedLocal.edges
                            .map(
                                serializeEdge
                            )
                            .filter(
                                edge =>
                                    edge.source &&
                                    edge.target
                            );


                    // ==================================================
                    // DEBUG
                    // ==================================================

                    console.log(
                        "================================="
                    );

                    console.log(
                        "SAVING CASE:",
                        id
                    );

                    console.log(
                        "REACTFLOW NODES:",
                        updatedLocal.nodes
                    );

                    console.log(
                        "BACKEND NODES:",
                        backendNodes
                    );

                    console.log(
                        "REACTFLOW EDGES:",
                        updatedLocal.edges
                    );

                    console.log(
                        "BACKEND EDGES:",
                        backendEdges
                    );

                    console.log(
                        "================================="
                    );


                    // ==================================================
                    // BACKEND PAYLOAD
                    // ==================================================

                    const payload = {

                        id:
                            updatedLocal.id,

                        name:
                            updatedLocal.name ??
                            updatedLocal.title ??
                            "",

                        title:
                            updatedLocal.title ??
                            updatedLocal.name ??
                            "",

                        description:
                            updatedLocal.description ??
                            "",

                        status:
                            updatedLocal.status,

                        nodes:
                            backendNodes,

                        edges:
                            backendEdges,

                        events:
                            updatedLocal.events ?? []

                    };


                    // ==================================================
                    // UPDATE SQL SERVER
                    // ==================================================

                    const backendCase =
                        await caseApi.update(
                            String(id),
                            payload
                        );


                    if (
                        !backendCase
                    ) {

                        throw new Error(
                            "Backend returned empty case."
                        );

                    }


                    // ==================================================
                    // NORMALIZE RESPONSE
                    // ==================================================

                    const finalCase =
                        normalizeCase(
                            backendCase
                        );


                    // ==================================================
                    // UPDATE CASE LIST
                    // ==================================================

                    setCases(
                        previous =>
                            previous.map(
                                item =>

                                    String(
                                        item.id
                                    ) ===
                                        String(
                                            id
                                        )

                                        ? finalCase

                                        : item
                            )
                    );


                    // ==================================================
                    // UPDATE ACTIVE CASE
                    // ==================================================

                    setActiveCase(
                        previous => {

                            if (
                                !previous
                            ) {

                                return previous;

                            }

                            if (
                                String(
                                    previous.id
                                ) !==
                                String(
                                    id
                                )
                            ) {

                                return previous;

                            }

                            return finalCase;

                        }
                    );


                    localStorage.setItem(
                        ACTIVE_CASE_STORAGE_KEY,
                        String(id)
                    );

                }
                catch (error) {

                    console.error(
                        "Failed to update case:",
                        error
                    );

                    throw error;

                }

            },
            [
                cases
            ]
        );


    // ========================================================
    // DELETE
    // ========================================================

    const deleteCase =
        useCallback(
            async (
                id: string
            ) => {

                try {

                    await caseApi.delete(
                        String(id)
                    );

                    setCases(
                        previous =>
                            previous.filter(
                                item =>
                                    String(
                                        item.id
                                    ) !==
                                    String(
                                        id
                                    )
                            )
                    );

                    setActiveCase(
                        previous => {

                            if (
                                previous &&
                                String(
                                    previous.id
                                ) ===
                                String(
                                    id
                                )
                            ) {

                                localStorage.removeItem(
                                    ACTIVE_CASE_STORAGE_KEY
                                );

                                return null;

                            }

                            return previous;

                        }
                    );

                }
                catch (error) {

                    console.error(
                        "Failed to delete case:",
                        error
                    );

                    throw error;

                }

            },
            []
        );


    // ========================================================
    // OPEN CASE
    // ========================================================

    const openCase =
        useCallback(
            async (
                id: string
            ) => {

                try {

                    const item =
                        await caseApi.getById(
                            String(id)
                        );

                    if (
                        !item
                    ) {

                        throw new Error(
                            "Case was not found."
                        );

                    }

                    const loadedCase =
                        normalizeCase(
                            item
                        );


                    console.log(
                        "LOADED CASE:",
                        loadedCase
                    );


                    setActiveCase(
                        loadedCase
                    );

                    localStorage.setItem(
                        ACTIVE_CASE_STORAGE_KEY,
                        loadedCase.id
                    );

                    setCases(
                        previous => {

                            const exists =
                                previous.some(
                                    existing =>
                                        String(
                                            existing.id
                                        ) ===
                                        String(
                                            loadedCase.id
                                        )
                                );

                            if (
                                !exists
                            ) {

                                return [

                                    ...previous,

                                    loadedCase

                                ];

                            }

                            return previous.map(
                                existing =>

                                    String(
                                        existing.id
                                    ) ===
                                        String(
                                            loadedCase.id
                                        )

                                        ? loadedCase

                                        : existing
                            );

                        }
                    );

                }
                catch (error) {

                    console.error(
                        "Failed to open case:",
                        error
                    );

                    throw error;

                }

            },
            []
        );


    // ========================================================
    // PROVIDER
    // ========================================================

    return (

        <CaseContext.Provider

            value={{

                cases,

                activeCase,

                addCase,

                deleteCase,

                updateCase,

                openCase,

                refreshCases

            }}

        >

            {children}

        </CaseContext.Provider>

    );

}


// ============================================================
// HOOK
// ============================================================

export function useCases() {

    const context =
        useContext(
            CaseContext
        );

    if (
        !context
    ) {

        throw new Error(
            "useCases must be used inside CaseProvider"
        );

    }

    return context;

}