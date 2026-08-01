import {
    useState
} from "react";

import {
    FiSearch,
    FiArrowRight,
    FiDatabase,
    FiGitBranch,
    FiShield
} from "react-icons/fi";

import {
    useGraph
} from "../context/GraphContext";

import {
    useCases
} from "../context/CaseContext";

import EntityProfile from "../components/intelligence/EntityProfile";

import CaseProfile from "../components/intelligence/CaseProfile";


interface Props {

    goConsole: () => void;

}


export default function LandingPage({

    goConsole

}: Props) {


    // ============================================================
    // GRAPH CONTEXT
    // ============================================================

    const {

        entityRegistry

    } = useGraph();


    // ============================================================
    // CASE CONTEXT
    // ============================================================

    const {

        cases

    } = useCases();


    // ============================================================
    // SEARCH
    // ============================================================

    const [

        search,

        setSearch

    ] = useState("");


    // ============================================================
    // SELECTED RESULT
    // ============================================================

    const [

        selectedResult,

        setSelectedResult

    ] = useState<any>(null);


    // ============================================================
    // NORMALIZE ENTITY FROM ENTITY REGISTRY
    // ============================================================

    const normalizeEntity = (

        entity: any

    ) => {

        if (!entity) {

            return null;

        }


        /*
         * entityRegistry already contains the REAL entity
         * loaded from SQL Server.
         *
         * Example:
         *
         * {
         *   id,
         *   name,
         *   type,
         *   category,
         *   icon,
         *   attributes
         * }
         *
         * Therefore we DON'T try to reconstruct the
         * entity from ReactFlow nodes.
         */


        const id =

            entity.id ??
            entity.entityId ??
            "";


        const name =

            entity.name ??
            entity.label ??
            "";


        /*
         * IMPORTANT:
         *
         * Do not immediately turn missing values into
         * "Unknown" because the real value may exist under
         * another property inside the original entity.
         */

        const type =

            entity.type ??
            entity.entityType ??
            entity.data?.type ??
            entity.data?.entityType ??
            "";


        const category =

            entity.category ??
            entity.data?.category ??
            "";


        const icon =

            entity.icon ??
            entity.data?.icon ??
            "❓";


        const attributes =

            entity.attributes ??
            entity.data?.attributes ??
            {};


        return {

            id,

            name,

            label:
                entity.label ??
                name,

            type,

            entityType:
                entity.entityType ??
                entity.data?.entityType ??
                type,

            category,

            icon,

            attributes,

            createdAt:
                entity.createdAt ??
                null,

            updatedAt:
                entity.updatedAt ??
                null,

            entity,

            original:
                entity

        };

    };


    // ============================================================
    // REAL ENTITIES
    // ============================================================

    const allEntities = (

        entityRegistry || []

    )

        .map(

            normalizeEntity

        )

        .filter(

            (
                entity: any
            ) =>

                entity &&

                typeof entity.name === "string" &&

                entity.name.trim() !== ""

        );


    // ============================================================
    // REMOVE DUPLICATES
    // ============================================================

    const uniqueEntities = Array.from(

        new Map(

            allEntities.map(

                (
                    entity: any
                ) => {

                    const key =

                        String(

                            entity.id ??

                            `${entity.name}-${entity.type}`

                        );


                    return [

                        key,

                        entity

                    ];

                }

            )

        ).values()

    );


    // ============================================================
    // SEARCH ENTITIES
    // ============================================================

    const entityResults = uniqueEntities

        .filter(

            (
                entity: any
            ) => {

                const term =

                    search

                        .trim()

                        .toLowerCase();


                if (!term) {

                    return false;

                }


                // ====================================================
                // REAL ENTITY NAME
                // ====================================================

                const entityName =

                    String(

                        entity.name ??
                        entity.label ??
                        ""

                    )

                        .trim()

                        .toLowerCase();


                // ====================================================
                // NAME HAS PRIORITY
                // ====================================================

                if (

                    entityName.includes(

                        term

                    )

                ) {

                    return true;

                }


                // ====================================================
                // SEARCH THROUGH REAL ENTITY DATA
                // ====================================================

                const attributesText =

                    entity.attributes

                        ? JSON.stringify(
                            entity.attributes
                        )

                        : "";


                const searchText = [

                    entity.type,

                    entity.entityType,

                    entity.category,

                    entity.icon,

                    attributesText

                ]

                    .filter(

                        value =>

                            value !== null &&

                            value !== undefined &&

                            String(
                                value
                            ).trim() !== ""

                    )

                    .join(" ")

                    .toLowerCase();


                return searchText.includes(

                    term

                );

            }

        )

        .map(

            (
                entity: any
            ) => ({


                // ====================================================
                // RESULT ID
                // ====================================================

                id:
                    entity.id,


                // ====================================================
                // RESULT DATA
                // ====================================================

                data: {

                    id:
                        entity.id,

                    name:
                        entity.name,

                    label:
                        entity.label ??
                        entity.name,

                    type:
                        entity.type,

                    entityType:
                        entity.entityType,

                    category:
                        entity.category,

                    icon:
                        entity.icon,

                    attributes:
                        entity.attributes,

                    createdAt:
                        entity.createdAt,

                    updatedAt:
                        entity.updatedAt,

                    entity:
                        entity.entity

                },


                // ====================================================
                // ORIGINAL ENTITY
                // ====================================================

                original:
                    entity.original,


                // ====================================================
                // RESULT TYPE
                // ====================================================

                resultType:
                    "Entity"

            })

        );


    // ============================================================
    // SEARCH CASES
    // ============================================================

    const caseResults = (

        cases || []

    )

        .filter(

            (
                item: any
            ) => {

                const term =

                    search

                        .trim()

                        .toLowerCase();


                if (!term) {

                    return false;

                }


                const text = [

                    item?.name,

                    item?.title,

                    item?.description,

                    item?.status,

                    item?.id

                ]

                    .filter(Boolean)

                    .join(" ")

                    .toLowerCase();


                return text.includes(

                    term

                );

            }

        )

        .map(

            (
                item: any
            ) => ({

                id:
                    item.id,

                data:
                    item,

                original:
                    item,

                resultType:
                    "Case"

            })

        );


    // ============================================================
    // FINAL RESULTS
    // ============================================================

    const results = [

        ...entityResults,

        ...caseResults

    ].slice(

        0,

        10

    );


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div className="landing-page">

            <div className="landing-container">


                {/* ==================================================
                    LOGO
                ================================================== */}

                <div className="landing-logo">

                    🕵️

                </div>


                <h1>

                    IGS

                </h1>


                <h2>

                    Intelligence Graph System

                </h2>


                <p className="landing-description">

                    Investigate entities, discover hidden connections,
                    and analyze complex relationship networks.

                </p>


                {/* ==================================================
                    SEARCH
                ================================================== */}

                <div className="landing-search">

                    <FiSearch />

                    <input

                        value={search}

                        onChange={

                            (e) =>

                                setSearch(
                                    e.target.value
                                )

                        }

                        placeholder="Search entity, person, vehicle..."

                    />

                </div>


                {/* ==================================================
                    SEARCH RESULTS
                ================================================== */}

                {

                    search.trim() && (

                        <div className="landing-results">


                            {

                                results.length === 0

                                    ? (

                                        <div className="empty-result">

                                            No results found

                                        </div>

                                    )

                                    : (

                                        results.map(

                                            (
                                                item: any,
                                                index: number
                                            ) => {


                                                const data =

                                                    item?.data ??
                                                    {};


                                                // ====================
                                                // ENTITY NAME
                                                // ====================

                                                const name =

                                                    item.resultType === "Entity"

                                                        ? (

                                                            data?.name ??

                                                            data?.label ??

                                                            "Unnamed Entity"

                                                        )

                                                        : (

                                                            data?.name ??

                                                            data?.title ??

                                                            "Unnamed Case"

                                                        );


                                                // ====================
                                                // ICON
                                                // ====================

                                                const icon =

                                                    item.resultType === "Entity"

                                                        ? (

                                                            data?.icon ??

                                                            "❓"

                                                        )

                                                        : "📁";


                                                // ====================
                                                // TYPE
                                                // ====================

                                                const type =

                                                    item.resultType === "Entity"

                                                        ? (

                                                            data?.type ??

                                                            data?.entityType ??

                                                            data?.category ??

                                                            "Entity"

                                                        )

                                                        : "Case";


                                                return (

                                                    <div

                                                        key={

                                                            `${String(
                                                                item.id
                                                            )}-${index}`

                                                        }

                                                        className="landing-result"

                                                        onClick={() => {

                                                            setSelectedResult(
                                                                item
                                                            );

                                                        }}

                                                    >


                                                        <div className="result-icon">

                                                            {icon}

                                                        </div>


                                                        <div>

                                                            <strong>

                                                                {name}

                                                            </strong>


                                                            <small>

                                                                {type}

                                                            </small>

                                                        </div>


                                                    </div>

                                                );

                                            }

                                        )

                                    )

                            }


                        </div>

                    )

                }


                {/* ==================================================
                    PROFILE
                ================================================== */}

                {

                    selectedResult && (

                        selectedResult.resultType === "Entity"

                            ? (

                                <EntityProfile

                                    entity={
                                        selectedResult
                                    }

                                    onClose={() =>

                                        setSelectedResult(
                                            null
                                        )

                                    }

                                    onSelectEntity={

                                        (
                                            entity: any
                                        ) => {

                                            const data =

                                                entity?.data ??
                                                entity ??
                                                {};


                                            setSelectedResult({

                                                id:

                                                    entity?.id ??
                                                    data?.id,


                                                data: {

                                                    ...data,

                                                    id:

                                                        entity?.id ??
                                                        data?.id,


                                                    name:

                                                        data?.name ??
                                                        data?.label ??
                                                        "Unnamed Entity",


                                                    label:

                                                        data?.label ??
                                                        data?.name ??
                                                        "Unnamed Entity",


                                                    type:

                                                        data?.type ??
                                                        data?.entityType ??
                                                        data?.data?.type ??
                                                        data?.data?.entityType ??
                                                        "",


                                                    category:

                                                        data?.category ??
                                                        data?.data?.category ??
                                                        "",


                                                    icon:

                                                        data?.icon ??
                                                        data?.data?.icon ??
                                                        "❓",


                                                    attributes:

                                                        data?.attributes ??
                                                        data?.data?.attributes ??
                                                        {},


                                                    entity:

                                                        data?.entity ??
                                                        entity

                                                },


                                                original:

                                                    entity?.original ??
                                                    entity,


                                                resultType:
                                                    "Entity"

                                            });

                                        }

                                    }

                                />

                            )

                            : (

                                <CaseProfile

                                    caseData={

                                        selectedResult.original

                                    }

                                    onClose={() =>

                                        setSelectedResult(
                                            null
                                        )

                                    }

                                />

                            )

                    )

                }


                {/* ==================================================
                    CONSOLE BUTTON
                ================================================== */}

                <button

                    className="console-btn"

                    onClick={goConsole}

                >

                    Go To Console

                    <FiArrowRight />

                </button>


                {/* ==================================================
                    FEATURES
                ================================================== */}

                <div className="landing-features">


                    <div className="feature-card">

                        <FiDatabase />

                        <h3>

                            Cases

                        </h3>

                        <p>

                            Manage investigations

                        </p>

                    </div>


                    <div className="feature-card">

                        <FiGitBranch />

                        <h3>

                            Graph Analysis

                        </h3>

                        <p>

                            Explore relationships

                        </p>

                    </div>


                    <div className="feature-card">

                        <FiShield />

                        <h3>

                            Intelligence

                        </h3>

                        <p>

                            Connect evidence

                        </p>

                    </div>


                </div>


            </div>

        </div>

    );

}