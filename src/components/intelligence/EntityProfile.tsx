
import {
    FiX,
    FiLink,
    FiFolder,
    FiUsers,
    FiBell
} from "react-icons/fi";

import {
    generateReport
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


    const [showGraph, setShowGraph] = useState(false);


    // ============================================================
    // CURRENT ENTITY INFORMATION
    // ============================================================

    const entityData = entity?.data ?? entity ?? {};

    const entityId =
        entity?.id ??
        entityData?.id ??
        entityData?.entityId ??
        "";


    const entityName = String(
        entityData?.name ??
        entityData?.label ??
        entity?.name ??
        entity?.label ??
        ""
    ).trim();


    const entityNameNormalized =
        entityName.toLowerCase();


    // ============================================================
    // MONITOR
    // ============================================================

    const isMonitoring = monitoredEntities.some(
        (item: any) =>
            String(item?.id) === String(entityId)
    );


    // ============================================================
    // ALL CASE NODES
    // ============================================================

    const allNodes = (cases || [])
        .flatMap(
            (item: any) =>
                item?.nodes || []
        );


    // ============================================================
    // ALL CASE EDGES
    // ============================================================

    const allEdges = (cases || [])
        .flatMap(
            (item: any) =>
                item?.edges || []
        );


    // ============================================================
    // FIND ALL REPRESENTATIONS OF THIS ENTITY
    //
    // IMPORTANT:
    //
    // The same person can have different node IDs
    // in different cases.
    //
    // Example:
    //
    // Case 1 -> node-123 -> Ardi Begunca
    // Case 2 -> node-987 -> Ardi Begunca
    //
    // We must treat both as the SAME ENTITY.
    // ============================================================

    const matchingNodes = allNodes.filter(
        (node: any) => {

            const nodeData =
                node?.data ?? node ?? {};

            const nodeName = String(
                nodeData?.name ??
                nodeData?.label ??
                nodeData?.entityName ??
                ""
            )
                .trim()
                .toLowerCase();


            const nodeEntityId = String(
                nodeData?.entityId ??
                node?.entityId ??
                ""
            );


            // Match by entity ID first
            if (
                entityId &&
                nodeEntityId &&
                nodeEntityId === String(entityId)
            ) {

                return true;

            }


            if (
                entityId &&
                String(node?.id) === String(entityId)
            ) {

                return true;

            }


            // Match the same real entity by name
            if (
                entityNameNormalized &&
                nodeName === entityNameNormalized
            ) {

                return true;

            }


            return false;

        }
    );


    // ============================================================
    // ALL NODE IDS THAT REPRESENT THIS ENTITY
    // ============================================================

    const entityNodeIds = new Set(
        matchingNodes.map(
            (node: any) =>
                String(node.id)
        )
    );


    // Also include the selected entity ID
    if (entityId) {

        entityNodeIds.add(
            String(entityId)
        );

    }


    // ============================================================
    // RELATED CASES
    //
    // A case belongs to this entity if ANY node inside
    // that case represents the same entity.
    // ============================================================

    const relatedCases = (cases || [])
        .filter(
            (item: any) => {

                return (item?.nodes || [])
                    .some(
                        (node: any) => {

                            const nodeData =
                                node?.data ?? node ?? {};

                            const nodeName = String(
                                nodeData?.name ??
                                nodeData?.label ??
                                nodeData?.entityName ??
                                ""
                            )
                                .trim()
                                .toLowerCase();


                            const nodeEntityId = String(
                                nodeData?.entityId ??
                                node?.entityId ??
                                ""
                            );


                            return (

                                entityNodeIds.has(
                                    String(node.id)
                                )

                                ||

                                (
                                    entityNameNormalized &&
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


    // ============================================================
    // ALL ENTITY NODE IDS FROM ALL CASES
    //
    // Recalculate this from related cases so that every
    // representation of Ardi is included.
    // ============================================================

    const allEntityNodeIds = new Set<string>();


    matchingNodes.forEach(
        (node: any) => {

            allEntityNodeIds.add(
                String(node.id)
            );

        }
    );


    relatedCases.forEach(
        (item: any) => {

            (item?.nodes || [])
                .forEach(
                    (node: any) => {

                        const nodeData =
                            node?.data ?? node ?? {};

                        const nodeName = String(
                            nodeData?.name ??
                            nodeData?.label ??
                            nodeData?.entityName ??
                            ""
                        )
                            .trim()
                            .toLowerCase();


                        const nodeEntityId = String(
                            nodeData?.entityId ??
                            node?.entityId ??
                            ""
                        );


                        if (

                            (
                                entityNameNormalized &&
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


    // ============================================================
    // ALL CONNECTIONS ACROSS ALL CASES
    // ============================================================

    const connections = allEdges.filter(
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


    // ============================================================
    // BUILD CONNECTED ENTITIES
    //
    // Deduplicate by real entity name.
    // This prevents the same person from appearing twice
    // just because they exist in two cases.
    // ============================================================

    const connectedMap = new Map<string, any>();


    connections.forEach(
        (edge: any) => {

            const sourceIsEntity =
                allEntityNodeIds.has(
                    String(edge.source)
                );


            const targetIsEntity =
                allEntityNodeIds.has(
                    String(edge.target)
                );


            const connectedId = sourceIsEntity
                ? String(edge.target)
                : String(edge.source);


            const node = allNodes.find(
                (n: any) =>
                    String(n.id) ===
                    connectedId
            );


            if (!node) {

                return;

            }


            const nodeData =
                node?.data ?? node ?? {};


            const connectedName = String(
                nodeData?.name ??
                nodeData?.label ??
                connectedId
            )
                .trim();


            const key =
                connectedName.toLowerCase();


            const relationship =
                edge?.data?.relationshipType ||
                "Related";


            if (!connectedMap.has(key)) {

                connectedMap.set(
                    key,
                    {
                        node,
                        relationship,
                        relationships: [relationship]
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


    // ============================================================
    // RELATIONSHIP STATISTICS
    //
    // Count relationships from ALL cases.
    // ============================================================

    const relationStats: Record<string, number> = {};


    connections.forEach(
        (edge: any) => {

            const type =
                edge?.data?.relationshipType ||
                "Related";


            relationStats[type] =
                (
                    relationStats[type] || 0
                ) + 1;

        }
    );


    // ============================================================
    // GENERATE GLOBAL ENTITY GRAPH
    //
    // We pass ALL nodes and ALL edges belonging to the
    // selected entity across every case.
    //
    // EntityGraph can then construct one combined network.
    // ============================================================

    const globalGraphNodes = (() => {

        const usedNodeIds = new Set<string>();


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


        return allNodes.filter(
            (node: any) =>
                usedNodeIds.has(
                    String(node.id)
                )
        );

    })();


    const globalGraphEdges =
        connections;


    // ============================================================
    // RENDER
    // ============================================================

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
                                entityName ||
                                "Unknown"
                            }

                        </h1>


                        <span>

                            {
                                entityData?.type ||
                                entityData?.entityType ||
                                "Entity"
                            }

                        </span>

                    </div>

                </div>


                {/* ==================================================
                    GENERATE GLOBAL GRAPH
                ================================================== */}

                <button
                    className="generate-graph-btn"
                    onClick={() =>
                        setShowGraph(true)
                    }
                >

                    🔗 Generate Connection Graph

                </button>


                {/* ==================================================
                    REPORT
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
                                    relationStats
                            }
                        )
                    }
                >

                    📄 Generate Intelligence Report

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
                                        key={item.id}
                                    >

                                        📂{" "}

                                        {
                                            item.name ||
                                            item.title ||
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
                        connectedEntities.map(
                            (
                                item: any,
                                index: number
                            ) => {

                                const node =
                                    item.node;

                                const nodeData =
                                    node?.data ??
                                    node ??
                                    {};

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
                                                    nodeData?.label ||
                                                    nodeData?.name ||
                                                    "Unknown"
                                                }

                                            </b>


                                            <small>

                                                {
                                                    nodeData?.type ||
                                                    nodeData?.entityType ||
                                                    "Entity"
                                                }

                                            </small>


                                        </div>


                                        <strong>

                                            {
                                                item.relationship
                                            }

                                        </strong>


                                    </div>

                                );

                            }
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

                                            {key}

                                        </b>

                                        <span>

                                            {value}

                                        </span>

                                    </div>

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

                                            {key}

                                        </b>

                                        <span>

                                            {String(value)}

                                        </span>

                                    </div>

                                )
                            )
                    }


                </section>


                {/* ==================================================
                    GLOBAL ENTITY GRAPH
                ================================================== */}

                {
                    showGraph && (

                        <EntityGraph

                            entity={entity}

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

                                setShowGraph(false);

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

