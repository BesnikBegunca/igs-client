
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
    // GRAPH DATA
    // ========================================================

    nodes: any[];

    edges: any[];

    events: any[];


    // ========================================================
    // OPTIONAL CASE DATA
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
// NORMALIZE CASE
// ============================================================

function normalizeCase(
    item: any
): CaseItem {

    return {

        id:
            String(
                item?.id ?? ""
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
            Array.isArray(
                item?.nodes
            )
                ? item.nodes
                : [],

        edges:
            Array.isArray(
                item?.edges
            )
                ? item.edges
                : [],

        events:
            Array.isArray(
                item?.events
            )
                ? item.events
                : [],


        // ====================================================
        // OPTIONAL DATA
        // ====================================================

        entities:
            Array.isArray(
                item?.entities
            )
                ? item.entities
                : [],

        relationships:
            Array.isArray(
                item?.relationships
            )
                ? item.relationships
                : [],

        evidence:
            Array.isArray(
                item?.evidence
            )
                ? item.evidence
                : [],

        documents:
            Array.isArray(
                item?.documents
            )
                ? item.documents
                : [],

        locations:
            Array.isArray(
                item?.locations
            )
                ? item.locations
                : [],

        communications:
            Array.isArray(
                item?.communications
            )
                ? item.communications
                : [],

        notes:
            Array.isArray(
                item?.notes
            )
                ? item.notes
                : []

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

    // ========================================================
    // STATE
    // ========================================================

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
    // LOAD CASES
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


                    // ==================================================
                    // KEEP ACTIVE CASE SYNCHRONIZED
                    // ==================================================

                    setActiveCase(
                        previous => {

                            if (
                                !previous
                            ) {

                                return null;

                            }


                            return (
                                normalizedCases.find(
                                    item =>
                                        String(
                                            item.id
                                        ) ===
                                        String(
                                            previous.id
                                        )
                                ) ??
                                null
                            );

                        }
                    );

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

                try {

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

                        // ==================================================
                        // IMPORTANT
                        // ==================================================
                        // Start every new case with an empty graph.
                        // ==================================================

                        nodes: [],

                        edges: [],

                        events: []

                    };


                    const created =
                        await caseApi.create(
                            payload as any
                        );


                    if (
                        !created
                    ) {

                        throw new Error(
                            "Backend did not return the created case."
                        );

                    }


                    const newCase =
                        normalizeCase(
                            created
                        );


                    // ==================================================
                    // ADD TO LOCAL STATE
                    // ==================================================

                    setCases(
                        previous => [

                            ...previous,

                            newCase

                        ]
                    );


                    // ==================================================
                    // MAKE NEW CASE ACTIVE
                    // ==================================================

                    setActiveCase(
                        newCase
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
                    // MERGE LOCAL DATA
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
                    // BACKEND PAYLOAD
                    // ==================================================

                    const payload: any = {

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
                            updatedLocal.nodes,

                        edges:
                            updatedLocal.edges,

                        events:
                            updatedLocal.events

                    };


                    // ==================================================
                    // UPDATE SQL SERVER
                    // ==================================================

                    const backendCase =
                        await caseApi.update(
                            String(id),
                            payload
                        );


                    // ==================================================
                    // FINAL CASE
                    // ==================================================

                    const finalCase =
                        normalizeCase({

                            ...updatedLocal,

                            ...(backendCase ?? {}),

                            id:
                                backendCase?.id ??
                                updatedLocal.id,

                            nodes:
                                Array.isArray(
                                    backendCase?.nodes
                                )
                                    ? backendCase.nodes
                                    : updatedLocal.nodes,

                            edges:
                                Array.isArray(
                                    backendCase?.edges
                                )
                                    ? backendCase.edges
                                    : updatedLocal.edges,

                            events:
                                Array.isArray(
                                    backendCase?.events
                                )
                                    ? backendCase.events
                                    : updatedLocal.events

                        });


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
    // DELETE CASE
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


                    // ==================================================
                    // REMOVE FROM LIST
                    // ==================================================

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


                    // ==================================================
                    // CLEAR ACTIVE CASE
                    // ==================================================

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


                    // ==================================================
                    // ACTIVE CASE
                    // ==================================================

                    setActiveCase(
                        loadedCase
                    );


                    // ==================================================
                    // UPDATE CASE LIST
                    // ==================================================

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
// STATUS NORMALIZER
// ============================================================

function normalizeStatus(

    value: any

): CaseItem["status"] {

    const status =
        String(
            value ??
            "open"
        )
            .trim()
            .toLowerCase();


    switch (
    status
    ) {

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
// USE CASES
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

