export function generateReport(
    entity: any,
    data: any
) {


    // ============================================================
    // ENTITY DATA
    // ============================================================

    const entityData =
        entity?.data ??
        entity ??
        {};

    const entityName = String(
        entityData?.name ??
        entityData?.label ??
        entity?.name ??
        entity?.label ??
        "Unknown Entity"
    ).trim();

    const entityType = String(
        entityData?.type ??
        entityData?.entityType ??
        entity?.type ??
        "Entity"
    ).trim();

    const risk = String(
        entityData?.risk ??
        "Low"
    ).trim();


    // ============================================================
    // NODES + EDGES
    // ============================================================

    const nodes: any[] =
        Array.isArray(data?.nodes)
            ? data.nodes
            : [];

    const edges: any[] =
        Array.isArray(data?.edges)
            ? data.edges
            : [];


    // ============================================================
    // HELPERS
    // ============================================================

    const normalize = (value: any) =>
        String(value ?? "")
            .trim()
            .toLowerCase();


    const getNodeData = (node: any) =>
        node?.data ??
        node ??
        {};


    const getNodeName = (node: any) => {

        const nodeData =
            getNodeData(node);

        return String(
            nodeData?.name ??
            nodeData?.label ??
            nodeData?.entityName ??
            node?.name ??
            node?.label ??
            ""
        ).trim();

    };


    const getNodeType = (node: any) => {

        const nodeData =
            getNodeData(node);

        return String(
            nodeData?.type ??
            nodeData?.entityType ??
            node?.type ??
            "Entity"
        ).trim();

    };


    const getRelationship = (edge: any) => {

        return String(

            edge?.data?.relationshipType ??

            edge?.data?.relationship ??

            edge?.relationshipType ??

            edge?.relationship ??

            edge?.label ??

            "Related"

        ).trim() || "Related";

    };


    // ============================================================
    // SELECTED ENTITY
    // ============================================================

    const selectedEntityId = String(
        entity?.id ??
        entityData?.id ??
        entityData?.entityId ??
        ""
    );

    const selectedEntityName =
        normalize(entityName);


    // ============================================================
    // FIND ALL NODE IDs THAT REPRESENT THE SELECTED ENTITY
    //
    // IMPORTANT:
    //
    // We match BOTH:
    //
    // - ID
    // - entityId
    // - name
    //
    // because ReactFlow node IDs can be different in different cases.
    // ============================================================

    const mainNodeIds =
        new Set<string>();


    nodes.forEach(
        (node: any) => {

            const nodeId =
                String(
                    node?.id ??
                    ""
                );

            const nodeData =
                getNodeData(node);


            const nodeEntityId =
                String(
                    nodeData?.entityId ??
                    node?.entityId ??
                    ""
                );


            const nodeName =
                normalize(
                    getNodeName(node)
                );


            const sameById =
                Boolean(
                    selectedEntityId &&
                    (
                        nodeId ===
                        selectedEntityId ||

                        nodeEntityId ===
                        selectedEntityId
                    )
                );


            const sameByName =
                Boolean(
                    selectedEntityName &&
                    nodeName ===
                    selectedEntityName
                );


            if (
                sameById ||
                sameByName
            ) {

                if (nodeId) {

                    mainNodeIds.add(
                        nodeId
                    );

                }

            }

        }
    );


    // Also add selected ID.
    if (selectedEntityId) {

        mainNodeIds.add(
            selectedEntityId
        );

    }


    // ============================================================
    // DEBUG INFORMATION
    // ============================================================

    console.log(
        "========== REPORT DEBUG =========="
    );

    console.log(
        "Entity:",
        entity
    );

    console.log(
        "Entity Name:",
        entityName
    );

    console.log(
        "Entity ID:",
        selectedEntityId
    );

    console.log(
        "Total Nodes:",
        nodes.length
    );

    console.log(
        "Total Edges:",
        edges.length
    );

    console.log(
        "Main Node IDs:",
        Array.from(mainNodeIds)
    );


    // ============================================================
    // FIND DIRECT EDGES
    //
    // THIS IS THE MOST IMPORTANT PART.
    //
    // An edge belongs to Ardi if:
    //
    // edge.source === Ardi node
    //
    // OR
    //
    // edge.target === Ardi node
    // ============================================================

    const directEdges =
        edges.filter(
            (edge: any) => {

                const source =
                    String(
                        edge?.source ??
                        ""
                    );

                const target =
                    String(
                        edge?.target ??
                        ""
                    );


                const connectedToSource =
                    mainNodeIds.has(
                        source
                    );


                const connectedToTarget =
                    mainNodeIds.has(
                        target
                    );


                return (
                    connectedToSource ||
                    connectedToTarget
                );

            }
        );


    console.log(
        "DIRECT EDGES:",
        directEdges
    );


    // ============================================================
    // NODE LOOKUP
    // ============================================================

    const nodeMap =
        new Map<string, any>();


    nodes.forEach(
        (node: any) => {

            const id =
                String(
                    node?.id ??
                    ""
                );


            if (id) {

                nodeMap.set(
                    id,
                    node
                );

            }

        }
    );


    // ============================================================
    // CONNECTED ENTITIES
    // ============================================================

    const connectedMap =
        new Map<string, any>();


    directEdges.forEach(
        (edge: any) => {

            const source =
                String(
                    edge?.source ??
                    ""
                );

            const target =
                String(
                    edge?.target ??
                    ""
                );


            let connectedId = "";


            // Ardi -> Other
            if (
                mainNodeIds.has(
                    source
                )
            ) {

                connectedId =
                    target;

            }

            // Other -> Ardi
            else if (
                mainNodeIds.has(
                    target
                )
            ) {

                connectedId =
                    source;

            }


            if (!connectedId) {

                return;

            }


            const connectedNode =
                nodeMap.get(
                    connectedId
                );


            if (!connectedNode) {

                console.warn(
                    "Connected node not found:",
                    connectedId
                );

                return;

            }


            const connectedName =
                getNodeName(
                    connectedNode
                );


            if (!connectedName) {

                return;

            }


            // Don't add Ardi as his own connection.
            if (
                normalize(
                    connectedName
                ) ===
                selectedEntityName
            ) {

                return;

            }


            const connectedType =
                getNodeType(
                    connectedNode
                );


            const relationship =
                getRelationship(
                    edge
                );


            const key =
                normalize(
                    connectedName
                );


            if (
                !connectedMap.has(
                    key
                )
            ) {

                connectedMap.set(
                    key,
                    {

                        name:
                            connectedName,

                        type:
                            connectedType,

                        relationships:
                            [relationship]

                    }
                );

            }
            else {

                const existing =
                    connectedMap.get(
                        key
                    );


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


    console.log(
        "CONNECTED ENTITIES:",
        connectedEntities
    );


    // ============================================================
    // RELATIONSHIP STATISTICS
    // ============================================================

    const relationStats:
        Record<string, number> = {};


    directEdges.forEach(
        (edge: any) => {

            const relationship =
                getRelationship(
                    edge
                );


            relationStats[
                relationship
            ] =
                (
                    relationStats[
                    relationship
                    ] || 0
                ) + 1;

        }
    );


    // ============================================================
    // CASE COUNT
    //
    // We cannot know cases from nodes/edges alone.
    // The profile can pass relatedCasesCount if needed.
    // ============================================================

    const casesCount =
        Number(
            data?.casesCount ??
            0
        );


    // ============================================================
    // BUILD REPORT
    // ============================================================

    let report = "";


    report +=
        "============================================================\n";

    report +=
        "                 INTELLIGENCE REPORT\n";

    report +=
        "============================================================\n\n";


    // ============================================================
    // ENTITY
    // ============================================================

    report +=
        "ENTITY\n";

    report +=
        "------------------------------------------------------------\n\n";

    report +=
        `Name: \n${entityName} \n\n`;

    report +=
        `Type: \n${entityType} \n\n`;

    report +=
        `Risk: \n${risk} \n\n`;


    // ============================================================
    // CASES
    // ============================================================

    report +=
        "CASES\n";

    report +=
        "------------------------------------------------------------\n\n";

    report +=
        `${casesCount} \n\n`;


    // ============================================================
    // CONNECTION SUMMARY
    // ============================================================

    report +=
        "CONNECTION SUMMARY\n";

    report +=
        "------------------------------------------------------------\n\n";

    report +=
        `Total Direct Connections: \n${directEdges.length} \n\n`;

    report +=
        `Unique Connected Entities: \n${connectedEntities.length} \n\n`;


    // ============================================================
    // CONNECTED ENTITIES
    // ============================================================

    report +=
        "CONNECTED ENTITIES\n";

    report +=
        "------------------------------------------------------------\n\n";


    if (
        connectedEntities.length === 0
    ) {

        report +=
            "No direct connections found.\n\n";

    }
    else {

        connectedEntities.forEach(
            (
                connected,
                index
            ) => {

                report +=
                    `${index + 1}. ${connected.name} \n`;

                report +=
                    `   Type: ${connected.type} \n`;

                report +=
                    `   Relationship: ${connected.relationships.join(", ")} \n\n`;

            }
        );

    }


    // ============================================================
    // RELATIONSHIP GRAPH
    // ============================================================

    report +=
        "RELATIONSHIP GRAPH\n";

    report +=
        "------------------------------------------------------------\n\n";


    report +=
        `${entityName} \n`;


    if (
        connectedEntities.length === 0
    ) {

        report +=
            "└── No connections\n\n";

    }
    else {

        connectedEntities.forEach(
            (
                connected,
                index
            ) => {

                const last =
                    index ===
                    connectedEntities.length - 1;


                const prefix =
                    last
                        ? "└──"
                        : "├──";


                report +=
                    `${prefix} ${connected.relationships.join(" / ")} → ${connected.name} \n`;

            }
        );


        report += "\n";

    }


    // ============================================================
    // RELATIONSHIP DETAILS
    // ============================================================

    report +=
        "RELATIONSHIP DETAILS\n";

    report +=
        "------------------------------------------------------------\n\n";


    if (
        connectedEntities.length === 0
    ) {

        report +=
            "No relationships found.\n\n";

    }
    else {

        connectedEntities.forEach(
            (
                connected
            ) => {

                report +=
                    `${entityName} → ${connected.name} \n`;

                report +=
                    `Relationship: ${connected.relationships.join(", ")} \n`;

                report +=
                    `Type: ${connected.type} \n\n`;

            }
        );

    }


    // ============================================================
    // RELATIONSHIP STATISTICS
    // ============================================================

    report +=
        "RELATIONSHIP STATISTICS\n";

    report +=
        "------------------------------------------------------------\n\n";


    if (
        Object.keys(
            relationStats
        ).length === 0
    ) {

        report +=
            "No relationship statistics found.\n\n";

    }
    else {

        Object.entries(
            relationStats
        ).forEach(
            (
                [
                    relationship,
                    count
                ]
            ) => {

                report +=
                    `${relationship}: ${count} \n`;

            }
        );

        report += "\n";

    }


    // ============================================================
    // RAW RELATION DATA
    // ============================================================

    report +=
        "RAW RELATION DATA\n";

    report +=
        "------------------------------------------------------------\n\n";

    report +=
        JSON.stringify(
            relationStats,
            null,
            2
        );

    report += "\n\n";


    // ============================================================
    // END
    // ============================================================

    report +=
        "============================================================\n";

    report +=
        "                    END OF REPORT\n";

    report +=
        "============================================================\n";


    // ============================================================
    // DOWNLOAD
    // ============================================================

    const blob =
        new Blob(
            [report],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `${entityName
            .replace(
                /[^a-z0-9]+/gi,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                ""
            )
            .toLowerCase()
        } -intelligence - report.txt`;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );


}
