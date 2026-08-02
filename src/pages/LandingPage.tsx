
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
    // NORMALIZE ENTITY
    // ============================================================

    const normalizeEntity = (

        entity: any

    ) => {

        if (!entity) {

            return null;

        }


        const id =

            entity.id ??
            entity.entityId ??
            "";


        const name =

            entity.name ??
            entity.label ??
            entity.data?.name ??
            entity.data?.label ??
            "";


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
            entity.data?.details ??
            {};


        return {

            id,

            name,

            label:
                entity.label ??
                entity.data?.label ??
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
    // ALL ENTITIES
    // ============================================================

    const allEntities = (

        entityRegistry || []

    )

        .map(

            normalizeEntity

        )

        .filter(

            (entity: any) =>

                entity &&

                typeof entity.name === "string" &&

                entity.name.trim() !== ""

        );


    // ============================================================
    // GLOBAL ENTITY KEY
    //
    // IMPORTANT:
    //
    // DO NOT USE entity.id HERE.
    //
    // Same person can have different node IDs
    // in different cases.
    // ============================================================

    const getEntityKey = (

        entity: any

    ) => {

        const name = String(

            entity?.name ??
            entity?.label ??
            entity?.data?.name ??
            entity?.data?.label ??
            ""

        )

            .trim()

            .toLowerCase();


        const type = String(

            entity?.type ??
            entity?.entityType ??
            entity?.data?.type ??
            entity?.data?.entityType ??
            ""

        )

            .trim()

            .toLowerCase();


        const category = String(

            entity?.category ??
            entity?.data?.category ??
            ""

        )

            .trim()

            .toLowerCase();


        return `${name}|${type}|${category}`;

    };


    // ============================================================
    // GLOBAL UNIQUE ENTITIES
    //
    // Ardi Case 1 + Ardi Case 2 = ONE SEARCH RESULT
    // ============================================================

    const uniqueEntityMap = new Map<string, any>();


    allEntities.forEach(

        (entity: any) => {

            const key = getEntityKey(entity);


            if (!uniqueEntityMap.has(key)) {

                uniqueEntityMap.set(

                    key,

                    {

                        ...entity,

                        globalKey: key

                    }

                );

            }

        }

    );


    const uniqueEntities = Array.from(

        uniqueEntityMap.values()

    );


    // ============================================================
    // SEARCH ENTITIES
    // ============================================================

    const entityResults = uniqueEntities

        .filter(

            (entity: any) => {

                const term =

                    search

                        .trim()

                        .toLowerCase();


                if (!term) {

                    return false;

                }


                const entityName = String(

                    entity.name ??
                    entity.label ??
                    ""

                )

                    .trim()

                    .toLowerCase();


                if (

                    entityName.includes(term)

                ) {

                    return true;

                }


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

                            String(value).trim() !== ""

                    )

                    .join(" ")

                    .toLowerCase();


                return searchText.includes(term);

            }

        )

        .map(

            (entity: any) => ({

                id:
                    entity.id,

                globalKey:
                    entity.globalKey,

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

                original:
                    entity.original,

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

            (item: any) => {

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


                return text.includes(term);

            }

        )

        .map(

            (item: any) => ({

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

                        onChange={(e) =>

                            setSearch(e.target.value)

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

                                    ?

                                    (

                                        <div className="empty-result">

                                            No results found

                                        </div>

                                    )

                                    :

                                    (

                                        results.map(

                                            (
                                                item: any,
                                                index: number
                                            ) => {

                                                const data =

                                                    item?.data ??
                                                    {};


                                                const name =

                                                    item.resultType === "Entity"

                                                        ?

                                                        (

                                                            data?.name ??
                                                            data?.label ??
                                                            "Unnamed Entity"

                                                        )

                                                        :

                                                        (

                                                            data?.name ??
                                                            data?.title ??
                                                            "Unnamed Case"

                                                        );


                                                const icon =

                                                    item.resultType === "Entity"

                                                        ?

                                                        (
                                                            data?.icon ??
                                                            "❓"
                                                        )

                                                        :

                                                        "📁";


                                                const type =

                                                    item.resultType === "Entity"

                                                        ?

                                                        (

                                                            data?.type ??
                                                            data?.entityType ??
                                                            data?.category ??
                                                            "Entity"

                                                        )

                                                        :

                                                        "Case";


                                                return (

                                                    <div

                                                        key={

                                                            `${item.resultType}-${item.globalKey ?? item.id}-${index}`

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

                            ?

                            (

                                <EntityProfile

                                    entity={selectedResult}

                                    onClose={() =>

                                        setSelectedResult(null)

                                    }

                                    onSelectEntity={(selectedEntity: any) => {

                                        const data =

                                            selectedEntity?.data ??
                                            selectedEntity ??
                                            {};


                                        setSelectedResult({

                                            id:

                                                selectedEntity?.id ??
                                                data?.id,

                                            globalKey:

                                                selectedResult.globalKey ??
                                                getEntityKey(data),

                                            data: {

                                                ...data,

                                                id:

                                                    selectedEntity?.id ??
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
                                                    selectedEntity

                                            },

                                            original:

                                                selectedEntity?.original ??
                                                selectedEntity,

                                            resultType:
                                                "Entity"

                                        });

                                    }}

                                />

                            )

                            :

                            (

                                <CaseProfile

                                    caseData={

                                        selectedResult.original

                                    }

                                    onClose={() =>

                                        setSelectedResult(null)

                                    }

                                />

                            )

                    )

                }


                {/* ==================================================
                    CONSOLE
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

