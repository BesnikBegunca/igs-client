import {
    FiX,
    FiLink,
    FiFolder,
    FiUsers,
    FiBell
} from "react-icons/fi";

import {
    generateReport,
    generateTXTReport
} from "../../utils/reportGenerator";

import {
    useState
} from "react";

import {
    useCases
} from "../../context/CaseContext";

import {
    useMonitor
} from "../../context/MonitorContext";

import EntityGraph from "./EntityGraph";


interface Props {

    entity: any;

    onClose: () => void;

    onSelectEntity: (entity: any) => void;

}


// ============================================================
// SAFE VALUE
// ============================================================

const cleanValue = (value: any): string => {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    if (
        typeof value === "string" ||
        typeof value === "number"
    ) {

        return String(value).trim();

    }

    return "";

};


// ============================================================
// GET NODE DATA
// ============================================================

const getNodeData = (node: any) => {

    return (
        node?.data ??
        node?.original ??
        node ??
        {}
    );

};


// ============================================================
// GET ENTITY NAME
//
// We check many possible places so that
// "Unknown" is only used when there is genuinely
// no name available.
// ============================================================

const getEntityName = (node: any): string => {

    if (!node) {

        return "";

    }


    const data =
        node?.data ?? {};


    const original =
        data?.original ??
        node?.original ??
        {};


    const candidates = [

        node?.name,

        node?.label,

        node?.entityName,

        node?.title,

        data?.name,

        data?.label,

        data?.entityName,

        data?.title,

        data?.fullName,

        data?.displayName,

        original?.name,

        original?.label,

        original?.entityName,

        original?.title,

        original?.fullName,

        original?.displayName

    ];


    for (
        const value of candidates
    ) {

        const result =
            cleanValue(value);


        if (
            result &&
            result.toLowerCase() !== "unknown"
        ) {

            return result;

        }

    }


    return "";

};


// ============================================================
// GET ENTITY TYPE
// ============================================================

const getEntityType = (node: any): string => {

    if (!node) {

        return "Entity";

    }


    const data =
        node?.data ?? {};


    const original =
        data?.original ??
        node?.original ??
        {};


    const candidates = [

        node?.type,

        node?.entityType,

        data?.type,

        data?.entityType,

        data?.category,

        original?.type,

        original?.entityType,

        original?.category

    ];


    for (
        const value of candidates
    ) {

        const result =
            cleanValue(value);


        if (result) {

            return result;

        }

    }


    return "Entity";

};


// ============================================================
// GET RELATIONSHIP
// ============================================================

const getRelationship = (edge: any): string => {

    const relationship =

        edge?.data?.relationshipType ??

        edge?.data?.relationship ??

        edge?.relationshipType ??

        edge?.relationship ??

        edge?.label ??

        edge?.type;


    return (
        cleanValue(relationship) ||
        "Related"
    );

};


// ============================================================
// ENTITY PROFILE
// ============================================================

export default function EntityProfile({

    entity,

    onClose,

    onSelectEntity

}: Props) {


    const {
        cases
    } = useCases();


    const {
        monitoredEntities,
        toggleMonitor
    } = useMonitor();


    const [
        showGraph,
        setShowGraph
    ] = useState(false);


    // ========================================================
    // CURRENT ENTITY
    // ========================================================

    const entityData =
        entity?.data ??
        entity ??
        {};


    const entityId =

        entity?.id ??

        entityData?.id ??

        entityData?.entityId ??

        "";


    const entityName =

        getEntityName(entity) ||

        "Unknown Entity";


    const entityNameNormalized =
        entityName
            .trim()
            .toLowerCase();


    const entityType =
        getEntityType(entity);


    // ========================================================
    // MONITOR
    // ========================================================

    const isMonitoring =
        monitoredEntities.some(
            (item: any) =>
                String(item?.id) ===
                String(entityId)
        );


    // ========================================================
    // ALL CASE NODES
    // ========================================================

    const allNodes =
        (cases || [])
            .flatMap(
                (item: any) =>
                    Array.isArray(item?.nodes)
                        ? item.nodes
                        : []
            );


    // ========================================================
    // ALL CASE EDGES
    // ========================================================

    const allEdges =
        (cases || [])
            .flatMap(
                (item: any) =>
                    Array.isArray(item?.edges)
                        ? item.edges
                        : []
            );


    // ========================================================
    // FIND ALL REPRESENTATIONS OF ENTITY
    // ========================================================

    const matchingNodes =
        allNodes.filter(
            (node: any) => {

                const nodeData =
                    getNodeData(node);


                const nodeName =
                    getEntityName(node)
                        .trim()
                        .toLowerCase();


                const nodeEntityId =
                    String(

                        nodeData?.entityId ??

                        node?.entityId ??

                        nodeData?.id ??

                        ""

                    );


                // --------------------------------------------
                // MATCH BY ENTITY ID
                // --------------------------------------------

                if (

                    entityId &&

                    nodeEntityId &&

                    nodeEntityId ===
                    String(entityId)

                ) {

                    return true;

                }


                // --------------------------------------------
                // MATCH BY NODE ID
                // --------------------------------------------

                if (

                    entityId &&

                    String(node?.id) ===
                    String(entityId)

                ) {

                    return true;

                }


                // --------------------------------------------
                // MATCH BY NAME
                // --------------------------------------------

                if (

                    entityNameNormalized &&

                    nodeName &&

                    nodeName ===
                    entityNameNormalized

                ) {

                    return true;

                }


                return false;

            }
        );


    // ========================================================
    // ALL NODE IDS REPRESENTING ENTITY
    // ========================================================

    const entityNodeIds =
        new Set<string>();


    matchingNodes.forEach(
        (node: any) => {

            if (node?.id !== undefined) {

                entityNodeIds.add(
                    String(node.id)
                );

            }

        }
    );


    if (entityId) {

        entityNodeIds.add(
            String(entityId)
        );

    }


    // ========================================================
    // RELATED CASES
    // ========================================================

    const relatedCases =
        (cases || [])
            .filter(
                (item: any) => {

                    return (
                        item?.nodes || []
                    )
                        .some(
                            (node: any) => {

                                const nodeData =
                                    getNodeData(node);


                                const nodeName =
                                    getEntityName(node)
                                        .trim()
                                        .toLowerCase();


                                const nodeEntityId =
                                    String(

                                        nodeData?.entityId ??

                                        node?.entityId ??

                                        nodeData?.id ??

                                        ""

                                    );


                                return (

                                    entityNodeIds.has(
                                        String(node.id)
                                    )

                                    ||

                                    (
                                        entityNameNormalized &&
                                        nodeName &&
                                        nodeName ===
                                        entityNameNormalized
                                    )

                                    ||

                                    (
                                        entityId &&
                                        nodeEntityId ===
                                        String(entityId)
                                    )

                                );

                            }
                        );

                }
            );


    // ========================================================
    // ALL ENTITY NODE IDS
    // ========================================================

    const allEntityNodeIds =
        new Set<string>();


    matchingNodes.forEach(
        (node: any) => {

            if (node?.id !== undefined) {

                allEntityNodeIds.add(
                    String(node.id)
                );

            }

        }
    );


    relatedCases.forEach(
        (item: any) => {

            (
                item?.nodes || []
            )
                .forEach(
                    (node: any) => {

                        const nodeData =
                            getNodeData(node);


                        const nodeName =
                            getEntityName(node)
                                .trim()
                                .toLowerCase();


                        const nodeEntityId =
                            String(

                                nodeData?.entityId ??

                                node?.entityId ??

                                nodeData?.id ??

                                ""

                            );


                        if (

                            (
                                entityNameNormalized &&
                                nodeName &&
                                nodeName ===
                                entityNameNormalized
                            )

                            ||

                            (
                                entityId &&
                                nodeEntityId ===
                                String(entityId)
                            )

                        ) {

                            allEntityNodeIds.add(
                                String(node.id)
                            );

                        }

                    }
                );

        }
    );


    // ========================================================
    // ALL CONNECTIONS
    // ========================================================

    const connections =
        allEdges.filter(
            (edge: any) => {

                return (

                    allEntityNodeIds.has(
                        String(edge.source)
                    )

                    ||

                    allEntityNodeIds.has(
                        String(edge.target)
                    )

                );

            }
        );


    // ========================================================
    // CONNECTED ENTITIES
    // ========================================================

    const connectedMap =
        new Map<string, any>();


    connections.forEach(
        (edge: any) => {

            const source =
                String(edge.source);


            const target =
                String(edge.target);


            const sourceIsEntity =
                allEntityNodeIds.has(
                    source
                );


            const targetIsEntity =
                allEntityNodeIds.has(
                    target
                );


            let connectedId = "";


            if (sourceIsEntity) {

                connectedId =
                    target;

            }
            else if (targetIsEntity) {

                connectedId =
                    source;

            }


            if (!connectedId) {

                return;

            }


            // ------------------------------------------------
            // FIND CONNECTED NODE
            // ------------------------------------------------

            const node =
                allNodes.find(
                    (n: any) =>
                        String(n?.id) ===
                        connectedId
                );


            if (!node) {

                return;

            }


            const connectedName =
                getEntityName(node);


            // IMPORTANT:
            // Never use "Unknown" as a deduplication key.
            // If the node has no name, use its ID.
            const safeName =
                connectedName ||
                `Entity ${connectedId}`;


            const key =
                safeName
                    .trim()
                    .toLowerCase();


            const relationship =
                getRelationship(edge);


            if (
                !connectedMap.has(key)
            ) {

                connectedMap.set(
                    key,
                    {

                        node,

                        name:
                            safeName,

                        type:
                            getEntityType(node),

                        relationship,

                        relationships:
                            [relationship]

                    }
                );

            }
            else {

                const existing =
                    connectedMap.get(key);


                if (
                    !existing.relationships.includes(
                        relationship
                    )
                ) {

                    existing.relationships.push(
                        relationship
                    );

                }

            }

        }
    );


    const connectedEntities =
        Array.from(
            connectedMap.values()
        );


    // ========================================================
    // RELATIONSHIP STATISTICS
    // ========================================================

    const relationStats:
        Record<string, number> = {};


    connections.forEach(
        (edge: any) => {

            const type =
                getRelationship(edge);


            relationStats[type] =
                (
                    relationStats[type] ||
                    0
                ) + 1;

        }
    );


    // ========================================================
    // GLOBAL GRAPH NODES
    // ========================================================

    const globalGraphNodes =
        (() => {

            const usedNodeIds =
                new Set<string>();


            connections.forEach(
                (edge: any) => {

                    usedNodeIds.add(
                        String(edge.source)
                    );

                    usedNodeIds.add(
                        String(edge.target)
                    );

                }
            );


            // Always include the selected entity.
            allEntityNodeIds.forEach(
                (id) => {

                    usedNodeIds.add(id);

                }
            );


            return allNodes.filter(
                (node: any) =>
                    usedNodeIds.has(
                        String(node.id)
                    )
            );

        })();


    const globalGraphEdges =
        connections;


    // ========================================================
    // PDF DATA
    // ========================================================

    const handlePrintToPDF = () => {

        generateReport(

            entity,

            {

                cases:
                    relatedCases.length,

                connections:
                    connections.length,

                relations:
                    relationStats,

                nodes:
                    globalGraphNodes,

                edges:
                    globalGraphEdges,

                casesCount:
                    relatedCases.length,

                connectedEntities

            }

        );

    };


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="entity-overlay">

            <div className="entity-profile">


                {/* ==================================================
                    CLOSE
                ================================================== */}

                <button
                    className="profile-close"
                    onClick={onClose}
                >

                    <FiX />

                </button>


                {/* ==================================================
                    ENTITY HEADER
                ================================================== */}

                <div className="entity-main">

                    <div className="big-icon">

                        {
                            entityData?.icon ||
                            "❓"
                        }

                    </div>


                    <div>

                        <h1>

                            {
                                entityName
                            }

                        </h1>


                        <span>

                            {
                                entityType
                            }

                        </span>

                    </div>

                </div>


                {/* ==================================================
                    GENERATE GRAPH
                ================================================== */}
                <div className="profile-action-buttons">


                    <button
                        className="generate-graph-btn"
                        onClick={() =>
                            setShowGraph(true)
                        }
                    >

                        Generate Connection Graph

                    </button>


                    {/* ==================================================
                    PRINT TO PDF
                ================================================== */}

                    <button
                        className="report-btn"
                        onClick={() =>
                            generateReport(
                                entity,
                                {
                                    cases:
                                        relatedCases.length,

                                    connections:
                                        connections.length,

                                    relations:
                                        relationStats,

                                    nodes:
                                        allNodes,

                                    edges:
                                        allEdges,

                                    casesCount:
                                        relatedCases.length,

                                    // IMPORTANT:
                                    // Pass actual cases so PDF can list them
                                    relatedCases:
                                        relatedCases,

                                    // IMPORTANT:
                                    // Pass actual connected entities
                                    connectedEntities:
                                        connectedEntities.map(
                                            (item: any) => {

                                                const node =
                                                    item?.node;

                                                const nodeData =
                                                    node?.data ??
                                                    node ??
                                                    {};

                                                return {

                                                    id:
                                                        node?.id,

                                                    name:
                                                        nodeData?.name ??
                                                        nodeData?.label ??
                                                        nodeData?.entityName ??
                                                        "Unknown",

                                                    type:
                                                        nodeData?.type ??
                                                        nodeData?.entityType ??
                                                        "Entity",

                                                    relationship:
                                                        item?.relationship ??
                                                        "Related",

                                                    relationships:
                                                        item?.relationships ??
                                                        [
                                                            item?.relationship ??
                                                            "Related"
                                                        ]

                                                };

                                            }
                                        ),

                                    graphNodes:
                                        globalGraphNodes,

                                    graphEdges:
                                        globalGraphEdges

                                }
                            )
                        }
                    >
                        Generate Intelligence Report
                    </button>


                    <button
                        className="report-btn"
                        onClick={() =>
                            generateTXTReport(
                                entity,
                                {
                                    cases:
                                        relatedCases.length,

                                    connections:
                                        connections.length,

                                    relations:
                                        relationStats,

                                    nodes:
                                        allNodes,

                                    edges:
                                        allEdges,

                                    casesCount:
                                        relatedCases.length,

                                    relatedCases:
                                        relatedCases,

                                    connectedEntities:
                                        connectedEntities.map(
                                            (item: any) => {

                                                const node =
                                                    item?.node;

                                                const nodeData =
                                                    node?.data ??
                                                    node ??
                                                    {};

                                                return {

                                                    id:
                                                        node?.id,

                                                    name:
                                                        nodeData?.name ??
                                                        nodeData?.label ??
                                                        nodeData?.entityName ??
                                                        "Unknown",

                                                    type:
                                                        nodeData?.type ??
                                                        nodeData?.entityType ??
                                                        "Entity",

                                                    relationship:
                                                        item?.relationship ??
                                                        "Related",

                                                    relationships:
                                                        item?.relationships ??
                                                        [
                                                            item?.relationship ??
                                                            "Related"
                                                        ]

                                                };

                                            }
                                        ),

                                    graphNodes:
                                        globalGraphNodes,

                                    graphEdges:
                                        globalGraphEdges

                                }
                            )
                        }
                    >
                        Generate TXT
                    </button>



                    {/* ==================================================
                    MONITOR
                ================================================== */}

                    <button
                        className={
                            isMonitoring
                                ? "monitor-active"
                                : "monitor-btn"
                        }
                        onClick={() =>
                            toggleMonitor(entity)
                        }
                    >

                        <FiBell />

                        {
                            isMonitoring
                                ? "Monitoring"
                                : "Monitor Entity"
                        }

                    </button>
                </div>


                {/* ==================================================
                    STATS
                ================================================== */}

                <div className="stats">


                    <div>

                        <FiFolder />

                        <strong>

                            {
                                relatedCases.length
                            }

                        </strong>

                        <small>

                            Cases

                        </small>

                    </div>


                    <div>

                        <FiLink />

                        <strong>

                            {
                                connections.length
                            }

                        </strong>

                        <small>

                            Connections

                        </small>

                    </div>


                    <div>

                        <FiUsers />

                        <strong>

                            {
                                connectedEntities.length
                            }

                        </strong>

                        <small>

                            Entities

                        </small>

                    </div>


                </div>


                {/* ==================================================
                    CASES
                ================================================== */}

                <section>

                    <h3>

                        📁 Cases Involved

                    </h3>


                    <div className="case-grid">

                        {
                            relatedCases.map(
                                (item: any) => (

                                    <div
                                        className="info-card"
                                        key={
                                            item.id
                                        }
                                    >

                                        📂{" "}

                                        {
                                            item.name ??
                                            item.title ??
                                            "Investigation"
                                        }

                                    </div>

                                )
                            )
                        }

                    </div>

                </section>


                {/* ==================================================
                    CONNECTED ENTITIES
                ================================================== */}

                <section>

                    <h3>

                        🔗 Connected Entities

                    </h3>


                    {
                        connectedEntities.length === 0 ? (

                            <div className="info-card">

                                No direct connections found.

                            </div>

                        ) : (

                            connectedEntities.map(
                                (
                                    item: any,
                                    index: number
                                ) => {

                                    const node =
                                        item.node;


                                    const nodeData =
                                        getNodeData(node);


                                    const displayName =
                                        item.name ||
                                        getEntityName(node) ||
                                        `Entity ${node?.id}`;


                                    const displayType =
                                        item.type ||
                                        getEntityType(node);


                                    return (

                                        <div
                                            className="connection-card"
                                            key={
                                                `${String(
                                                    node?.id
                                                )}-${index}`
                                            }
                                            onClick={() =>
                                                onSelectEntity(
                                                    node
                                                )
                                            }
                                        >

                                            <div>

                                                <span>

                                                    {
                                                        nodeData?.icon ||
                                                        "❓"
                                                    }

                                                </span>


                                                <b>

                                                    {
                                                        displayName
                                                    }

                                                </b>


                                                <small>

                                                    {
                                                        displayType
                                                    }

                                                </small>

                                            </div>


                                            <strong>

                                                {
                                                    item.relationships?.join(
                                                        " / "
                                                    ) ||
                                                    item.relationship ||
                                                    "Related"
                                                }

                                            </strong>

                                        </div>

                                    );

                                }
                            )

                        )
                    }

                </section>


                {/* ==================================================
                    RELATIONSHIP ANALYSIS
                ================================================== */}

                <section>

                    <h3>

                        📊 Relationship Analysis

                    </h3>


                    {
                        Object.entries(
                            relationStats
                        ).length === 0 ? (

                            <div className="detail-row">

                                <b>
                                    No relationships
                                </b>

                                <span>
                                    0
                                </span>

                            </div>

                        ) : (

                            Object.entries(
                                relationStats
                            )
                                .map(
                                    (
                                        [
                                            key,
                                            value
                                        ]: any
                                    ) => (

                                        <div
                                            className="detail-row"
                                            key={key}
                                        >

                                            <b>

                                                {
                                                    key
                                                }

                                            </b>

                                            <span>

                                                {
                                                    value
                                                }

                                            </span>

                                        </div>

                                    )
                                )

                        )
                    }

                </section>


                {/* ==================================================
                    DETAILS
                ================================================== */}

                <section>

                    <h3>

                        👤 Details

                    </h3>


                    {
                        Object.entries(
                            entityData?.details || {}
                        )
                            .map(
                                (
                                    [
                                        key,
                                        value
                                    ]: any
                                ) => (

                                    <div
                                        className="detail-row"
                                        key={key}
                                    >

                                        <b>

                                            {
                                                key
                                            }

                                        </b>

                                        <span>

                                            {
                                                String(value)
                                            }

                                        </span>

                                    </div>

                                )
                            )
                    }

                </section>


                {/* ==================================================
                    GRAPH
                ================================================== */}

                {
                    showGraph && (

                        <EntityGraph

                            entity={
                                entity
                            }

                            nodes={
                                globalGraphNodes
                            }

                            edges={
                                globalGraphEdges
                            }

                            onClose={() =>
                                setShowGraph(false)
                            }

                            onSelectEntity={(
                                item: any
                            ) => {

                                setShowGraph(
                                    false
                                );

                                onSelectEntity(
                                    item
                                );

                            }}

                        />

                    )
                }

            </div>

        </div>

    );

}