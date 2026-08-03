import jsPDF from "jspdf";
import html2canvas from "html2canvas";


// ============================================================
// TYPES
// ============================================================

interface ReportData {

    cases?: number;

    connections?: number;

    relations?: Record<string, number>;

    nodes?: any[];

    edges?: any[];

    casesCount?: number;

    relatedCases?: any[];

    connectedEntities?: any[];

    graphNodes?: any[];

    graphEdges?: any[];

}


// ============================================================
// COLORS
// ============================================================

const COLORS: Record<string, string> = {

    Related:
        "#94a3b8",

    Owner:
        "#22c55e",

    Owns:
        "#22c55e",

    Friend:
        "#3b82f6",

    Family:
        "#f97316",

    "Works For":
        "#a855f7",

    Suspect:
        "#ef4444",

    Witness:
        "#eab308",

    Partner:
        "#ec4899",

    "Located At":
        "#06b6d4",

    Driver:
        "#14b8a6"

};


const getColor =
    (relationship: string) => {

        return (
            COLORS[relationship] ||
            "#64748b"
        );

    };


// ============================================================
// HELPERS
// ============================================================

const normalize =
    (value: any) =>
        String(value ?? "")
            .trim()
            .toLowerCase();


const getNodeData =
    (node: any) =>
        node?.data ??
        node ??
        {};


const getNodeName =
    (node: any) => {

        const data =
            getNodeData(node);

        return String(
            data?.name ??
            data?.label ??
            data?.entityName ??
            node?.name ??
            node?.label ??
            "Unknown"
        ).trim();

    };


const getNodeType =
    (node: any) => {

        const data =
            getNodeData(node);

        return String(
            data?.type ??
            data?.entityType ??
            node?.type ??
            "Entity"
        ).trim();

    };


const getRelationship =
    (edge: any) => {

        return String(

            edge?.data?.relationshipType ??

            edge?.data?.relationship ??

            edge?.relationshipType ??

            edge?.relationship ??

            edge?.label ??

            "Related"

        ).trim() || "Related";

    };


const getNodeIcon =
    (node: any) => {

        const data =
            getNodeData(node);

        return String(
            data?.icon ??
            "❓"
        );

    };


// ============================================================
// ADD TEXT WITH WRAPPING
// ============================================================

function addWrappedText(

    pdf: jsPDF,

    text: string,

    x: number,

    y: number,

    maxWidth: number,

    lineHeight = 5,

    fontSize = 10

) {

    pdf.setFontSize(
        fontSize
    );


    const lines =
        pdf.splitTextToSize(
            String(text),
            maxWidth
        );


    pdf.text(
        lines,
        x,
        y
    );


    return (
        y +
        lines.length *
        lineHeight
    );

}


// ============================================================
// HEADER
// ============================================================

function drawHeader(

    pdf: jsPDF,

    title: string,

    subtitle?: string

) {

    const width =
        pdf.internal.pageSize.getWidth();


    pdf.setFillColor(
        15,
        23,
        42
    );


    pdf.rect(
        0,
        0,
        width,
        30,
        "F"
    );


    pdf.setTextColor(
        255,
        255,
        255
    );


    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.setFontSize(
        18
    );


    pdf.text(
        title,
        15,
        13
    );


    if (subtitle) {

        pdf.setFont(
            "helvetica",
            "normal"
        );


        pdf.setFontSize(
            8
        );


        pdf.setTextColor(
            203,
            213,
            225
        );


        pdf.text(
            subtitle,
            15,
            22
        );

    }


    pdf.setTextColor(
        15,
        23,
        42
    );

}


// ============================================================
// SECTION
// ============================================================

function drawSectionTitle(

    pdf: jsPDF,

    title: string,

    y: number

) {

    const width =
        pdf.internal.pageSize.getWidth();


    pdf.setFillColor(
        241,
        245,
        249
    );


    pdf.roundedRect(
        12,
        y,
        width - 24,
        9,
        2,
        2,
        "F"
    );


    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.setFontSize(
        10
    );


    pdf.setTextColor(
        30,
        41,
        59
    );


    pdf.text(
        title,
        17,
        y + 6
    );


    return y + 15;

}


// ============================================================
// INFORMATION ROW
// ============================================================

function drawInfoRow(

    pdf: jsPDF,

    label: string,

    value: string,

    y: number

) {

    const width =
        pdf.internal.pageSize.getWidth();


    pdf.setDrawColor(
        226,
        232,
        240
    );


    pdf.line(
        15,
        y + 6,
        width - 15,
        y + 6
    );


    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.setFontSize(
        9
    );


    pdf.setTextColor(
        71,
        85,
        105
    );


    pdf.text(
        label,
        17,
        y
    );


    pdf.setFont(
        "helvetica",
        "normal"
    );


    pdf.setTextColor(
        15,
        23,
        42
    );


    const lines =
        pdf.splitTextToSize(
            String(value),
            width - 100
        );


    pdf.text(
        lines,
        90,
        y
    );


    return (
        y +
        Math.max(
            9,
            lines.length * 5 + 3
        )
    );

}


// ============================================================
// GRAPH HTML
//
// This creates a completely independent graph.
// Therefore it does NOT depend on ReactFlow being visible.
// ============================================================

function createGraphHTML(

    entity: any,

    nodes: any[],

    edges: any[]

) {

    const entityData =
        getNodeData(entity);


    const mainName =
        getNodeName(entity);


    const mainIcon =
        getNodeIcon(entity);


    const mainType =
        getNodeType(entity);


    const selectedId =
        String(
            entity?.id ??
            entityData?.id ??
            entityData?.entityId ??
            ""
        );


    // ----------------------------------------------------------
    // Find all main instances
    // ----------------------------------------------------------

    const mainIds =
        new Set<string>();


    nodes.forEach(
        (node: any) => {

            const nodeData =
                getNodeData(node);


            const nodeId =
                String(
                    node?.id ??
                    ""
                );


            const entityId =
                String(
                    nodeData?.entityId ??
                    node?.entityId ??
                    ""
                );


            const name =
                normalize(
                    getNodeName(node)
                );


            if (

                (
                    selectedId &&
                    (
                        nodeId ===
                        selectedId ||

                        entityId ===
                        selectedId
                    )
                )

                ||

                (
                    normalize(mainName) ===
                    name
                )

            ) {

                if (nodeId) {

                    mainIds.add(
                        nodeId
                    );

                }

            }

        }
    );


    if (selectedId) {

        mainIds.add(
            selectedId
        );

    }


    // ----------------------------------------------------------
    // Direct edges
    // ----------------------------------------------------------

    const directEdges =
        edges.filter(
            (edge: any) => {

                return (

                    mainIds.has(
                        String(edge.source)
                    )

                    ||

                    mainIds.has(
                        String(edge.target)
                    )

                );

            }
        );


    // ----------------------------------------------------------
    // Node lookup
    // ----------------------------------------------------------

    const nodeMap =
        new Map<string, any>();


    nodes.forEach(
        (node: any) => {

            nodeMap.set(
                String(node.id),
                node
            );

        }
    );


    // ----------------------------------------------------------
    // Groups
    // ----------------------------------------------------------

    const groups =
        new Map<
            string,
            {
                relationship: string;
                color: string;
                entities: any[];
            }
        >();


    directEdges.forEach(
        (edge: any) => {

            const source =
                String(edge.source);


            const target =
                String(edge.target);


            const otherId =
                mainIds.has(source)
                    ? target
                    : source;


            const node =
                nodeMap.get(
                    otherId
                );


            if (!node) {

                return;

            }


            const relationship =
                getRelationship(edge);


            if (
                !groups.has(
                    relationship
                )
            ) {

                groups.set(
                    relationship,
                    {
                        relationship,
                        color:
                            getColor(
                                relationship
                            ),
                        entities: []
                    }
                );

            }


            const group =
                groups.get(
                    relationship
                )!;


            if (
                !group.entities.some(
                    (item: any) =>
                        String(item.id) ===
                        String(node.id)
                )
            ) {

                group.entities.push(
                    node
                );

            }

        }
    );


    const groupArray =
        Array.from(
            groups.values()
        );


    // ----------------------------------------------------------
    // SVG dimensions
    // ----------------------------------------------------------

    const nodeWidth =
        230;


    const nodeHeight =
        92;


    const relationWidth =
        145;


    const relationHeight =
        42;


    const horizontalGap =
        55;


    const groupGap =
        100;


    const mainY =
        50;


    const relationY =
        210;


    const entityY =
        340;


    const groupWidths =
        groupArray.map(
            (group) => {

                const count =
                    Math.max(
                        1,
                        group.entities.length
                    );


                return Math.max(
                    relationWidth + 80,
                    (
                        count *
                        nodeWidth
                    ) +
                    (
                        Math.max(
                            0,
                            count - 1
                        ) *
                        horizontalGap
                    )
                );

            }
        );


    const totalWidth =
        Math.max(
            1100,
            groupWidths.reduce(
                (
                    sum,
                    width
                ) =>
                    sum + width,
                0
            ) +
            Math.max(
                0,
                groupArray.length - 1
            ) *
            groupGap +
            120
        );


    const totalHeight =
        Math.max(
            570,
            entityY +
            nodeHeight +
            80
        );


    const centerX =
        totalWidth / 2;


    const svgParts: string[] =
        [];


    // ----------------------------------------------------------
    // SVG background
    // ----------------------------------------------------------

    svgParts.push(`
        <rect
            x="0"
            y="0"
            width="${totalWidth}"
            height="${totalHeight}"
            rx="24"
            fill="#080b12"
        />
    `);


    // ----------------------------------------------------------
    // Grid
    // ----------------------------------------------------------

    for (
        let x = 0;
        x < totalWidth;
        x += 40
    ) {

        svgParts.push(`
            <line
                x1="${x}"
                y1="0"
                x2="${x}"
                y2="${totalHeight}"
                stroke="#172033"
                stroke-width="1"
                opacity="0.45"
            />
        `);

    }


    for (
        let y = 0;
        y < totalHeight;
        y += 40
    ) {

        svgParts.push(`
            <line
                x1="0"
                y1="${y}"
                x2="${totalWidth}"
                y2="${y}"
                stroke="#172033"
                stroke-width="1"
                opacity="0.45"
            />
        `);

    }


    // ----------------------------------------------------------
    // Title
    // ----------------------------------------------------------

    svgParts.push(`
        <text
            x="40"
            y="38"
            fill="#f8fafc"
            font-family="Arial, sans-serif"
            font-size="22"
            font-weight="700"
        >
            🔗 Connection Map
        </text>

        <text
            x="40"
            y="61"
            fill="#64748b"
            font-family="Arial, sans-serif"
            font-size="13"
        >
            ${escapeXML(mainName)} network analysis
        </text>
    `);


    // ----------------------------------------------------------
    // Main node
    // ----------------------------------------------------------

    const mainX =
        centerX -
        nodeWidth / 2;


    svgParts.push(`
        <rect
            x="${mainX}"
            y="${mainY}"
            width="${nodeWidth}"
            height="${nodeHeight}"
            rx="16"
            fill="#2563eb"
            stroke="#60a5fa"
            stroke-width="3"
        />

        <text
            x="${centerX}"
            y="${mainY + 34}"
            text-anchor="middle"
            fill="#ffffff"
            font-family="Arial, sans-serif"
            font-size="19"
            font-weight="700"
        >
            ${escapeXML(
        `${mainIcon} ${mainName}`
    )}
        </text>

        <text
            x="${centerX}"
            y="${mainY + 61}"
            text-anchor="middle"
            fill="#dbeafe"
            font-family="Arial, sans-serif"
            font-size="12"
        >
            ${escapeXML(mainType)}
        </text>
    `);


    // ----------------------------------------------------------
    // Groups
    // ----------------------------------------------------------

    let cursor =
        (
            totalWidth -
            (
                groupWidths.reduce(
                    (
                        sum,
                        width
                    ) =>
                        sum + width,
                    0
                ) +
                Math.max(
                    0,
                    groupArray.length - 1
                ) *
                groupGap
            )
        ) / 2;


    groupArray.forEach(
        (
            group,
            groupIndex
        ) => {

            const width =
                groupWidths[groupIndex];


            const groupCenter =
                cursor +
                width / 2;


            const relationshipX =
                groupCenter -
                relationWidth / 2;


            // --------------------------------------------------
            // Main -> relationship line
            // --------------------------------------------------

            svgParts.push(`
                <path
                    d="
                        M ${centerX}
                          ${mainY + nodeHeight}

                        C ${centerX}
                          ${mainY + nodeHeight + 65},

                          ${groupCenter}
                          ${relationY - 65},

                          ${groupCenter}
                          ${relationY}
                    "
                    fill="none"
                    stroke="${group.color}"
                    stroke-width="3"
                    opacity="0.9"
                />
            `);


            // --------------------------------------------------
            // Relationship node
            // --------------------------------------------------

            svgParts.push(`
                <rect
                    x="${relationshipX}"
                    y="${relationY}"
                    width="${relationWidth}"
                    height="${relationHeight}"
                    rx="10"
                    fill="${group.color}"
                    fill-opacity="0.12"
                    stroke="${group.color}"
                    stroke-opacity="0.7"
                    stroke-width="2"
                />

                <text
                    x="${groupCenter}"
                    y="${relationY + 26}"
                    text-anchor="middle"
                    fill="${group.color}"
                    font-family="Arial, sans-serif"
                    font-size="12"
                    font-weight="700"
                >
                    ${escapeXML(
                group.relationship
            )}
                </text>
            `);


            // --------------------------------------------------
            // Entities
            // --------------------------------------------------

            const count =
                group.entities.length;


            const entitiesWidth =
                count *
                nodeWidth +

                Math.max(
                    0,
                    count - 1
                ) *
                horizontalGap;


            const entityStartX =
                groupCenter -
                entitiesWidth / 2;


            group.entities.forEach(
                (
                    node: any,
                    index: number
                ) => {

                    const x =
                        entityStartX +
                        index *
                        (
                            nodeWidth +
                            horizontalGap
                        );


                    const entityCenter =
                        x +
                        nodeWidth / 2;


                    // ------------------------------------------------
                    // Relationship -> entity
                    // ------------------------------------------------

                    svgParts.push(`
                        <path
                            d="
                                M ${groupCenter}
                                  ${relationY + relationHeight}

                                C ${groupCenter}
                                  ${relationY + relationHeight + 40},

                                  ${entityCenter}
                                  ${entityY - 40},

                                  ${entityCenter}
                                  ${entityY}
                            "
                            fill="none"
                            stroke="${group.color}"
                            stroke-width="2.5"
                            opacity="0.85"
                        />
                    `);


                    const data =
                        getNodeData(node);


                    const name =
                        getNodeName(node);


                    const type =
                        getNodeType(node);


                    const icon =
                        getNodeIcon(node);


                    svgParts.push(`
                        <rect
                            x="${x}"
                            y="${entityY}"
                            width="${nodeWidth}"
                            height="${nodeHeight}"
                            rx="14"
                            fill="#111827"
                            stroke="${group.color}"
                            stroke-width="2"
                        />

                        <text
                            x="${entityCenter}"
                            y="${entityY + 34}"
                            text-anchor="middle"
                            fill="#ffffff"
                            font-family="Arial, sans-serif"
                            font-size="16"
                            font-weight="700"
                        >
                            ${escapeXML(
                        `${icon} ${name}`
                    )}
                        </text>

                        <text
                            x="${entityCenter}"
                            y="${entityY + 61}"
                            text-anchor="middle"
                            fill="#94a3b8"
                            font-family="Arial, sans-serif"
                            font-size="11"
                        >
                            ${escapeXML(type)}
                        </text>
                    `);

                }
            );


            cursor +=
                width +
                groupGap;

        }
    );


    return {

        svg:
            `<svg
                xmlns="http://www.w3.org/2000/svg"
                width="${totalWidth}"
                height="${totalHeight}"
                viewBox="0 0 ${totalWidth} ${totalHeight}"
            >
                ${svgParts.join("")}
            </svg>`,

        width:
            totalWidth,

        height:
            totalHeight

    };

}


// ============================================================
// ESCAPE XML
// ============================================================

function escapeXML(
    value: any
) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&apos;"
        );

}


// ============================================================
// SVG -> CANVAS
// ============================================================

async function svgToCanvas(

    svg: string,

    width: number,

    height: number

) {

    const container =
        document.createElement(
            "div"
        );


    container.style.position =
        "fixed";

    container.style.left =
        "-100000px";

    container.style.top =
        "0";

    container.style.width =
        `${width}px`;

    container.style.height =
        `${height}px`;

    container.style.background =
        "#080b12";


    container.innerHTML =
        svg;


    document.body.appendChild(
        container
    );


    try {

        const canvas =
            await html2canvas(
                container,
                {
                    backgroundColor:
                        "#080b12",

                    scale:
                        2,

                    useCORS:
                        true,

                    logging:
                        false,

                    width,

                    height
                }
            );


        return canvas;

    }
    finally {

        document.body.removeChild(
            container
        );

    }

}


// ============================================================
// MAIN EXPORT
// ============================================================

export async function generateReport(

    entity: any,

    data: ReportData

) {

    try {

        // ======================================================
        // ENTITY
        // ======================================================

        const entityData =
            entity?.data ??
            entity ??
            {};


        const entityName =
            String(
                entityData?.name ??
                entityData?.label ??
                entity?.name ??
                entity?.label ??
                "Unknown Entity"
            ).trim();


        const entityType =
            String(
                entityData?.type ??
                entityData?.entityType ??
                entity?.type ??
                "Entity"
            ).trim();


        const risk =
            String(
                entityData?.risk ??
                "Low"
            ).trim();


        const details =
            entityData?.details || {};


        const nodes =
            Array.isArray(
                data?.nodes
            )
                ? data.nodes
                : [];


        const edges =
            Array.isArray(
                data?.edges
            )
                ? data.edges
                : [];


        const cases =
            Array.isArray(
                data?.relatedCases
            )
                ? data.relatedCases
                : [];


        const connectedEntities =
            Array.isArray(
                data?.connectedEntities
            )
                ? data.connectedEntities
                : [];


        const relationStats =
            data?.relations || {};


        const graphNodes =
            Array.isArray(
                data?.graphNodes
            )
                ? data.graphNodes
                : nodes;


        const graphEdges =
            Array.isArray(
                data?.graphEdges
            )
                ? data.graphEdges
                : edges;


        // ======================================================
        // CREATE PDF
        // ======================================================

        const pdf =
            new jsPDF(
                {
                    orientation:
                        "portrait",

                    unit:
                        "mm",

                    format:
                        "a4",

                    compress:
                        true
                }
            );


        const pageWidth =
            pdf.internal.pageSize.getWidth();


        const pageHeight =
            pdf.internal.pageSize.getHeight();


        const margin =
            15;


        // ======================================================
        // PAGE 1
        // ENTITY INFORMATION
        // ======================================================

        drawHeader(
            pdf,
            "INTELLIGENCE REPORT",
            `${entityName} • Entity Profile`
        );


        let y =
            42;


        // ------------------------------------------------------
        // ENTITY SUMMARY CARD
        // ------------------------------------------------------

        pdf.setFillColor(
            248,
            250,
            252
        );


        pdf.setDrawColor(
            226,
            232,
            240
        );


        pdf.roundedRect(
            margin,
            y,
            pageWidth -
            margin * 2,
            40,
            4,
            4,
            "FD"
        );


        pdf.setFont(
            "helvetica",
            "bold"
        );


        pdf.setFontSize(
            18
        );


        pdf.setTextColor(
            15,
            23,
            42
        );


        pdf.text(
            entityName,
            23,
            y + 15
        );


        pdf.setFont(
            "helvetica",
            "normal"
        );


        pdf.setFontSize(
            10
        );


        pdf.setTextColor(
            71,
            85,
            105
        );


        pdf.text(
            `Type: ${entityType}`,
            23,
            y + 25
        );


        pdf.text(
            `Risk: ${risk}`,
            23,
            y + 33
        );


        y += 52;


        // ------------------------------------------------------
        // ENTITY DETAILS
        // ------------------------------------------------------

        y =
            drawSectionTitle(
                pdf,
                "ENTITY INFORMATION",
                y
            );


        y =
            drawInfoRow(
                pdf,
                "Name",
                entityName,
                y
            );


        y =
            drawInfoRow(
                pdf,
                "Type",
                entityType,
                y
            );


        y =
            drawInfoRow(
                pdf,
                "Risk",
                risk,
                y
            );


        // ------------------------------------------------------
        // DETAILS
        // ------------------------------------------------------

        if (
            Object.keys(details).length > 0
        ) {

            y += 5;


            y =
                drawSectionTitle(
                    pdf,
                    "DETAILS",
                    y
                );


            Object.entries(
                details
            ).forEach(
                (
                    [
                        key,
                        value
                    ]
                ) => {

                    if (
                        y >
                        pageHeight - 25
                    ) {

                        pdf.addPage();

                        drawHeader(
                            pdf,
                            "INTELLIGENCE REPORT",
                            `${entityName} • Details`
                        );

                        y = 42;

                    }


                    y =
                        drawInfoRow(
                            pdf,
                            String(key),
                            String(value),
                            y
                        );

                }
            );

        }


        // ------------------------------------------------------
        // STATISTICS
        // ------------------------------------------------------

        y += 8;


        if (
            y >
            pageHeight - 70
        ) {

            pdf.addPage();

            drawHeader(
                pdf,
                "INTELLIGENCE REPORT",
                `${entityName} • Statistics`
            );

            y = 42;

        }


        y =
            drawSectionTitle(
                pdf,
                "INVESTIGATION SUMMARY",
                y
            );


        y =
            drawInfoRow(
                pdf,
                "Cases Involved",
                String(
                    data?.casesCount ??
                    cases.length
                ),
                y
            );


        y =
            drawInfoRow(
                pdf,
                "Direct Connections",
                String(
                    data?.connections ??
                    edges.length
                ),
                y
            );


        y =
            drawInfoRow(
                pdf,
                "Connected Entities",
                String(
                    connectedEntities.length
                ),
                y
            );


        // ======================================================
        // PAGE 2
        // CONNECTIONS
        // ======================================================

        pdf.addPage();


        drawHeader(
            pdf,
            "CONNECTION ANALYSIS",
            `${entityName} • Connected Entities & Relationships`
        );


        y = 42;


        // ------------------------------------------------------
        // CONNECTED ENTITIES
        // ------------------------------------------------------

        y =
            drawSectionTitle(
                pdf,
                "CONNECTED ENTITIES",
                y
            );


        if (
            connectedEntities.length === 0
        ) {

            pdf.setFont(
                "helvetica",
                "normal"
            );


            pdf.setFontSize(
                10
            );


            pdf.text(
                "No direct connections found.",
                17,
                y
            );


            y += 12;

        }
        else {

            connectedEntities.forEach(
                (
                    connected: any,
                    index: number
                ) => {

                    if (
                        y >
                        pageHeight - 35
                    ) {

                        pdf.addPage();

                        drawHeader(
                            pdf,
                            "CONNECTION ANALYSIS",
                            `${entityName} • Connected Entities`
                        );

                        y = 42;

                    }


                    const relationship =
                        Array.isArray(
                            connected.relationships
                        )
                            ? connected.relationships.join(
                                ", "
                            )
                            : String(
                                connected.relationship ||
                                "Related"
                            );


                    pdf.setFillColor(
                        248,
                        250,
                        252
                    );


                    pdf.setDrawColor(
                        226,
                        232,
                        240
                    );


                    pdf.roundedRect(
                        15,
                        y,
                        pageWidth - 30,
                        25,
                        3,
                        3,
                        "FD"
                    );


                    pdf.setFont(
                        "helvetica",
                        "bold"
                    );


                    pdf.setFontSize(
                        10
                    );


                    pdf.setTextColor(
                        15,
                        23,
                        42
                    );


                    pdf.text(
                        `${index + 1}. ${connected.name || "Unknown"}`,
                        21,
                        y + 9
                    );


                    pdf.setFont(
                        "helvetica",
                        "normal"
                    );


                    pdf.setFontSize(
                        8
                    );


                    pdf.setTextColor(
                        71,
                        85,
                        105
                    );


                    pdf.text(
                        `Type: ${connected.type || "Entity"}`,
                        21,
                        y + 17
                    );


                    pdf.setTextColor(
                        79,
                        70,
                        229
                    );


                    pdf.text(
                        `Relationship: ${relationship}`,
                        90,
                        y + 17
                    );


                    y += 31;

                }
            );

        }


        // ------------------------------------------------------
        // RELATIONSHIP ANALYSIS
        // ------------------------------------------------------

        y += 5;


        if (
            y >
            pageHeight - 80
        ) {

            pdf.addPage();

            drawHeader(
                pdf,
                "RELATIONSHIP ANALYSIS",
                `${entityName} • Relationship Statistics`
            );

            y = 42;

        }


        y =
            drawSectionTitle(
                pdf,
                "RELATIONSHIP ANALYSIS",
                y
            );


        const relationEntries =
            Object.entries(
                relationStats
            );


        if (
            relationEntries.length === 0
        ) {

            pdf.setFont(
                "helvetica",
                "normal"
            );


            pdf.setFontSize(
                10
            );


            pdf.text(
                "No relationship statistics found.",
                17,
                y
            );


            y += 12;

        }
        else {

            relationEntries.forEach(
                (
                    [
                        relationship,
                        count
                    ]
                ) => {

                    y =
                        drawInfoRow(
                            pdf,
                            relationship,
                            String(count),
                            y
                        );

                }
            );

        }


        // ------------------------------------------------------
        // CASES
        // ------------------------------------------------------

        y += 8;


        if (
            y >
            pageHeight - 80
        ) {

            pdf.addPage();

            drawHeader(
                pdf,
                "CASE INVOLVEMENT",
                `${entityName} • Cases`
            );

            y = 42;

        }


        y =
            drawSectionTitle(
                pdf,
                "CASES INVOLVED",
                y
            );


        if (
            cases.length === 0
        ) {

            pdf.text(
                "No case information available.",
                17,
                y
            );

        }
        else {

            cases.forEach(
                (
                    item: any,
                    index: number
                ) => {

                    if (
                        y >
                        pageHeight - 25
                    ) {

                        pdf.addPage();

                        drawHeader(
                            pdf,
                            "CASE INVOLVEMENT",
                            `${entityName} • Cases`
                        );

                        y = 42;

                    }


                    const caseName =
                        item?.name ??
                        item?.title ??
                        "Investigation";


                    pdf.setFont(
                        "helvetica",
                        "normal"
                    );


                    pdf.setFontSize(
                        10
                    );


                    pdf.setTextColor(
                        15,
                        23,
                        42
                    );


                    pdf.text(
                        `${index + 1}. ${caseName}`,
                        20,
                        y
                    );


                    y += 8;

                }
            );

        }


        // ======================================================
        // GRAPH PAGE
        // LANDSCAPE
        // ======================================================

        pdf.addPage(
            "a4",
            "landscape"
        );


        const graphPageWidth =
            pdf.internal.pageSize.getWidth();


        const graphPageHeight =
            pdf.internal.pageSize.getHeight();


        pdf.setFillColor(
            8,
            11,
            18
        );


        pdf.rect(
            0,
            0,
            graphPageWidth,
            graphPageHeight,
            "F"
        );


        pdf.setTextColor(
            248,
            250,
            252
        );


        pdf.setFont(
            "helvetica",
            "bold"
        );


        pdf.setFontSize(
            17
        );


        pdf.text(
            "RELATIONSHIP GRAPH",
            12,
            13
        );


        pdf.setFont(
            "helvetica",
            "normal"
        );


        pdf.setFontSize(
            8
        );


        pdf.setTextColor(
            148,
            163,
            184
        );


        pdf.text(
            `${entityName} • Complete Connection Map`,
            12,
            20
        );


        // ======================================================
        // CREATE GRAPH
        // ======================================================

        const graph =
            createGraphHTML(
                entity,
                graphNodes,
                graphEdges
            );


        const graphCanvas =
            await svgToCanvas(
                graph.svg,
                graph.width,
                graph.height
            );


        const availableWidth =
            graphPageWidth -
            20;


        const availableHeight =
            graphPageHeight -
            32;


        const scale =
            Math.min(
                availableWidth /
                graphCanvas.width,

                availableHeight /
                graphCanvas.height
            );


        const imageWidth =
            graphCanvas.width *
            scale;


        const imageHeight =
            graphCanvas.height *
            scale;


        const imageX =
            (
                graphPageWidth -
                imageWidth
            ) / 2;


        const imageY =
            27 +
            (
                availableHeight -
                imageHeight
            ) / 2;


        const graphImage =
            graphCanvas.toDataURL(
                "image/png",
                1.0
            );


        pdf.addImage(
            graphImage,
            "PNG",
            imageX,
            imageY,
            imageWidth,
            imageHeight,
            undefined,
            "FAST"
        );


        // ======================================================
        // FOOTER
        // ======================================================

        pdf.setFontSize(
            7
        );


        pdf.setTextColor(
            100,
            116,
            139
        );


        pdf.text(
            `Generated Intelligence Report • ${entityName}`,
            12,
            graphPageHeight - 7
        );


        // ======================================================
        // SAVE
        // ======================================================

        const safeName =
            entityName
                .replace(
                    /[^a-z0-9]+/gi,
                    "-"
                )
                .replace(
                    /^-+|-+$/g,
                    ""
                )
                .toLowerCase();


        pdf.save(
            `${safeName || "entity"}-intelligence-report.pdf`
        );

    }
    catch (error) {

        console.error(
            "PDF EXPORT ERROR:",
            error
        );


        alert(
            "PDF export failed. Check the browser console for details."
        );

    }

}
// ============================================================
// GENERATE TXT REPORT
// ============================================================

export function generateTXTReport(
    entity: any,
    data: ReportData
) {

    try {

        const entityData =
            entity?.data ??
            entity ??
            {};


        const entityName =
            String(
                entityData?.name ??
                entityData?.label ??
                entity?.name ??
                entity?.label ??
                "Unknown Entity"
            ).trim();


        const entityType =
            String(
                entityData?.type ??
                entityData?.entityType ??
                entity?.type ??
                "Entity"
            ).trim();


        const risk =
            String(
                entityData?.risk ??
                "Low"
            ).trim();


        const details =
            entityData?.details || {};


        const relatedCases =
            Array.isArray(data?.relatedCases)
                ? data.relatedCases
                : [];


        const connectedEntities =
            Array.isArray(data?.connectedEntities)
                ? data.connectedEntities
                : [];


        const relations =
            data?.relations || {};


        const connections =
            data?.connections ??
            0;


        // ========================================================
        // BUILD TXT
        // ========================================================

        const lines: string[] = [];


        lines.push(
            "============================================================"
        );

        lines.push(
            "                 INTELLIGENCE REPORT"
        );

        lines.push(
            "============================================================"
        );

        lines.push("");


        // ========================================================
        // ENTITY INFORMATION
        // ========================================================

        lines.push(
            "ENTITY INFORMATION"
        );

        lines.push(
            "------------------------------------------------------------"
        );

        lines.push(
            `Name: ${entityName}`
        );

        lines.push(
            `Type: ${entityType}`
        );

        lines.push(
            `Risk: ${risk}`
        );

        lines.push("");


        // ========================================================
        // DETAILS
        // ========================================================

        if (
            Object.keys(details).length > 0
        ) {

            lines.push(
                "DETAILS"
            );

            lines.push(
                "------------------------------------------------------------"
            );


            Object.entries(
                details
            ).forEach(
                (
                    [
                        key,
                        value
                    ]
                ) => {

                    lines.push(
                        `${String(key)}: ${String(value)}`
                    );

                }
            );


            lines.push("");

        }


        // ========================================================
        // INVESTIGATION SUMMARY
        // ========================================================

        lines.push(
            "INVESTIGATION SUMMARY"
        );

        lines.push(
            "------------------------------------------------------------"
        );

        lines.push(
            `Cases Involved: ${data?.casesCount ?? relatedCases.length}`
        );

        lines.push(
            `Direct Connections: ${connections}`
        );

        lines.push(
            `Connected Entities: ${connectedEntities.length}`
        );

        lines.push("");


        // ========================================================
        // CASES INVOLVED
        // ========================================================

        lines.push(
            "CASES INVOLVED"
        );

        lines.push(
            "------------------------------------------------------------"
        );


        if (
            relatedCases.length === 0
        ) {

            lines.push(
                "No case information available."
            );

        }
        else {

            relatedCases.forEach(
                (
                    item: any,
                    index: number
                ) => {

                    const caseName =
                        item?.name ??
                        item?.title ??
                        "Investigation";


                    lines.push(
                        `${index + 1}. ${caseName}`
                    );

                }
            );

        }


        lines.push("");


        // ========================================================
        // CONNECTED ENTITIES
        // ========================================================

        lines.push(
            "CONNECTED ENTITIES"
        );

        lines.push(
            "------------------------------------------------------------"
        );


        if (
            connectedEntities.length === 0
        ) {

            lines.push(
                "No direct connections found."
            );

        }
        else {

            connectedEntities.forEach(
                (
                    connected: any,
                    index: number
                ) => {

                    const name =
                        connected?.name ??
                        "Unknown";


                    const type =
                        connected?.type ??
                        "Entity";


                    const relationship =
                        Array.isArray(
                            connected?.relationships
                        )
                            ? connected.relationships.join(
                                ", "
                            )
                            : String(
                                connected?.relationship ??
                                "Related"
                            );


                    lines.push(
                        `${index + 1}. ${name}`
                    );

                    lines.push(
                        `   Type: ${type}`
                    );

                    lines.push(
                        `   Relationship: ${relationship}`
                    );

                    lines.push("");

                }
            );

        }


        // ========================================================
        // RELATIONSHIP ANALYSIS
        // ========================================================

        lines.push(
            "RELATIONSHIP ANALYSIS"
        );

        lines.push(
            "------------------------------------------------------------"
        );


        const relationEntries =
            Object.entries(
                relations
            );


        if (
            relationEntries.length === 0
        ) {

            lines.push(
                "No relationship statistics found."
            );

        }
        else {

            relationEntries.forEach(
                (
                    [
                        relationship,
                        count
                    ]
                ) => {

                    lines.push(
                        `${relationship}: ${count}`
                    );

                }
            );

        }


        lines.push("");


        // ========================================================
        // FOOTER
        // ========================================================

        lines.push(
            "============================================================"
        );

        lines.push(
            `Generated Intelligence Report • ${entityName}`
        );

        lines.push(
            "============================================================"
        );


        const content =
            lines.join("\n");


        // ========================================================
        // DOWNLOAD TXT
        // ========================================================

        const blob =
            new Blob(
                [
                    content
                ],
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


        const safeName =
            entityName
                .replace(
                    /[^a-z0-9]+/gi,
                    "-"
                )
                .replace(
                    /^-+|-+$/g,
                    ""
                )
                .toLowerCase();


        link.href =
            url;


        link.download =
            `${safeName || "entity"}-intelligence-report.txt`;


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
    catch (error) {

        console.error(
            "TXT EXPORT ERROR:",
            error
        );


        alert(
            "TXT export failed. Check the browser console for details."
        );

    }

}