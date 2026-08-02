import * as XLSX from "xlsx";


// ============================================================
// HELPERS
// ============================================================

function cleanString(
    value: any
): string {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value).trim();

}


// ============================================================
// FIND EXCEL VALUE
// ============================================================
//
// Handles:
// Relationship
// relationship
// RELATIONSHIP
// Relationship Type
// relationshipType
//
// ============================================================

function getColumnValue(
    row: any,
    ...possibleNames: string[]
): any {

    if (!row) {

        return undefined;

    }


    const keys =
        Object.keys(row);


    for (
        const requestedName
        of possibleNames
    ) {

        const normalizedRequested =
            requestedName
                .trim()
                .toLowerCase()
                .replace(
                    /[\s_-]/g,
                    ""
                );


        const matchingKey =
            keys.find(
                key => {

                    const normalizedKey =
                        key
                            .trim()
                            .toLowerCase()
                            .replace(
                                /[\s_-]/g,
                                ""
                            );


                    return (
                        normalizedKey ===
                        normalizedRequested
                    );

                }
            );


        if (
            matchingKey !== undefined
        ) {

            return row[
                matchingKey
            ];

        }

    }


    return undefined;

}


// ============================================================
// IMPORT INVESTIGATION EXCEL
// ============================================================

export function importInvestigationExcel(
    file: File
) {

    return new Promise<any>(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();


            reader.onload =
                (
                    event: any
                ) => {

                    try {

                        // ==================================================
                        // READ FILE
                        // ==================================================

                        const data =
                            new Uint8Array(
                                event.target.result
                            );


                        const workbook =
                            XLSX.read(
                                data,
                                {
                                    type: "array"
                                }
                            );


                        // ==================================================
                        // SHEETS
                        // ==================================================

                        const entitiesSheet =
                            workbook.Sheets[
                            "Entities"
                            ];


                        const relationshipsSheet =
                            workbook.Sheets[
                            "Relationships"
                            ];


                        const detailsSheet =
                            workbook.Sheets[
                            "Details"
                            ];


                        if (
                            !entitiesSheet ||
                            !relationshipsSheet
                        ) {

                            throw new Error(
                                "Invalid IGS Excel file. Entities and Relationships sheets are required."
                            );

                        }


                        // ==================================================
                        // READ SHEETS
                        // ==================================================

                        const entities: any[] =
                            XLSX.utils.sheet_to_json(
                                entitiesSheet,
                                {
                                    defval: ""
                                }
                            );


                        const relationships: any[] =
                            XLSX.utils.sheet_to_json(
                                relationshipsSheet,
                                {
                                    defval: ""
                                }
                            );


                        const details: any[] =
                            detailsSheet
                                ? XLSX.utils.sheet_to_json(
                                    detailsSheet,
                                    {
                                        defval: ""
                                    }
                                )
                                : [];


                        // ==================================================
                        // DEBUG EXCEL
                        // ==================================================

                        console.log(
                            "===================================="
                        );

                        console.log(
                            "EXCEL IMPORT"
                        );

                        console.log(
                            "Entities:",
                            entities
                        );

                        console.log(
                            "Relationships:",
                            relationships
                        );

                        console.log(
                            "Details:",
                            details
                        );

                        console.log(
                            "===================================="
                        );


                        // ==================================================
                        // CREATE NODES
                        // ==================================================

                        const nodes =
                            entities.map(
                                (
                                    entity,
                                    index
                                ) => {

                                    const nodeDetails: any = {};


                                    details
                                        .filter(
                                            d =>

                                                cleanString(
                                                    getColumnValue(
                                                        d,
                                                        "Entity"
                                                    )
                                                )
                                                ===
                                                cleanString(
                                                    getColumnValue(
                                                        entity,
                                                        "Name"
                                                    )
                                                )
                                        )
                                        .forEach(
                                            d => {

                                                const field =
                                                    cleanString(
                                                        getColumnValue(
                                                            d,
                                                            "Field"
                                                        )
                                                    );


                                                const value =
                                                    getColumnValue(
                                                        d,
                                                        "Value"
                                                    );


                                                if (
                                                    field
                                                ) {

                                                    nodeDetails[
                                                        field
                                                    ] =
                                                        value;

                                                }

                                            }
                                        );


                                    const entityId =
                                        cleanString(
                                            getColumnValue(
                                                entity,
                                                "ID",
                                                "Id",
                                                "EntityID",
                                                "Entity Id"
                                            )
                                        );


                                    const entityName =
                                        cleanString(
                                            getColumnValue(
                                                entity,
                                                "Name",
                                                "Entity Name",
                                                "Label"
                                            )
                                        );


                                    const entityType =
                                        cleanString(
                                            getColumnValue(
                                                entity,
                                                "Type",
                                                "Entity Type"
                                            )
                                        );


                                    const entityIcon =
                                        cleanString(
                                            getColumnValue(
                                                entity,
                                                "Icon"
                                            )
                                        );


                                    const entityCategory =
                                        cleanString(
                                            getColumnValue(
                                                entity,
                                                "Category"
                                            )
                                        );


                                    const entityRisk =
                                        cleanString(
                                            getColumnValue(
                                                entity,
                                                "Risk"
                                            )
                                        );


                                    const entityDescription =
                                        cleanString(
                                            getColumnValue(
                                                entity,
                                                "Description"
                                            )
                                        );


                                    const positionX =
                                        Number(
                                            getColumnValue(
                                                entity,
                                                "PositionX",
                                                "Position X",
                                                "X"
                                            )
                                        );


                                    const positionY =
                                        Number(
                                            getColumnValue(
                                                entity,
                                                "PositionY",
                                                "Position Y",
                                                "Y"
                                            )
                                        );


                                    return {

                                        id:
                                            entityId ||
                                            `entity-${index}`,

                                        type:
                                            "custom",

                                        position: {

                                            x:
                                                Number.isFinite(
                                                    positionX
                                                )
                                                    ? positionX
                                                    : (index % 5) * 250,

                                            y:
                                                Number.isFinite(
                                                    positionY
                                                )
                                                    ? positionY
                                                    : Math.floor(
                                                        index / 5
                                                    ) * 180

                                        },

                                        data: {

                                            id:
                                                entityId ||
                                                `entity-${index}`,

                                            entityId:
                                                entityId ||
                                                `entity-${index}`,

                                            label:
                                                entityName,

                                            name:
                                                entityName,

                                            type:
                                                entityType,

                                            entityType:
                                                entityType,

                                            icon:
                                                entityIcon ||
                                                "❓",

                                            category:
                                                entityCategory,

                                            risk:
                                                entityRisk ||
                                                "Low",

                                            description:
                                                entityDescription,

                                            attributes:
                                                nodeDetails,

                                            details:
                                                nodeDetails

                                        }

                                    };

                                }
                            );


                        // ==================================================
                        // CREATE EDGES
                        // ==================================================

                        const edges =
                            relationships.map(
                                (
                                    relation,
                                    index
                                ) => {

                                    const relationshipId =
                                        cleanString(
                                            getColumnValue(
                                                relation,
                                                "ID",
                                                "Id",
                                                "RelationshipID",
                                                "Relationship Id"
                                            )
                                        );


                                    const source =
                                        cleanString(
                                            getColumnValue(
                                                relation,
                                                "Source",
                                                "SourceID",
                                                "Source Id"
                                            )
                                        );


                                    const target =
                                        cleanString(
                                            getColumnValue(
                                                relation,
                                                "Target",
                                                "TargetID",
                                                "Target Id"
                                            )
                                        );


                                    // ==================================================
                                    // THIS IS THE IMPORTANT PART
                                    // ==================================================

                                    const relationshipValue =
                                        cleanString(
                                            getColumnValue(
                                                relation,

                                                "Relationship",

                                                "RelationshipType",

                                                "Relationship Type",

                                                "Relation",

                                                "RelationType",

                                                "Relation Type",

                                                "Label"
                                            )
                                        );


                                    const relationshipType =
                                        relationshipValue ||
                                        "Related";


                                    const description =
                                        cleanString(
                                            getColumnValue(
                                                relation,
                                                "Description"
                                            )
                                        );


                                    const evidence =
                                        cleanString(
                                            getColumnValue(
                                                relation,
                                                "Evidence"
                                            )
                                        );


                                    const date =
                                        cleanString(
                                            getColumnValue(
                                                relation,
                                                "Date"
                                            )
                                        );


                                    const edgeId =
                                        relationshipId ||

                                        `${source}-${target}-${index}`;


                                    // ==================================================
                                    // DEBUG EACH RELATIONSHIP
                                    // ==================================================

                                    console.log(
                                        "EXCEL RELATIONSHIP:",
                                        {
                                            id:
                                                edgeId,

                                            source,

                                            target,

                                            relationship:
                                                relationshipValue,

                                            finalRelationship:
                                                relationshipType
                                        }
                                    );


                                    // ==================================================
                                    // EDGE
                                    // ==================================================

                                    return {

                                        id:
                                            edgeId,

                                        source,

                                        target,

                                        type:
                                            "custom",

                                        // ==============================================
                                        // KEEP ALL THREE
                                        // ==============================================

                                        relationshipType,

                                        relationship:
                                            relationshipType,

                                        label:
                                            relationshipType,

                                        data: {

                                            relationshipType,

                                            relationship:
                                                relationshipType,

                                            label:
                                                relationshipType,

                                            description,

                                            evidence,

                                            date

                                        }

                                    };

                                }
                            );


                        // ==================================================
                        // FINAL DEBUG
                        // ==================================================

                        console.log(
                            "===================================="
                        );

                        console.log(
                            "IMPORTED NODES:",
                            nodes
                        );

                        console.log(
                            "IMPORTED EDGES:",
                            edges
                        );

                        console.log(
                            "RELATIONSHIPS IMPORTED:"
                        );

                        edges.forEach(
                            edge => {

                                console.log(
                                    `${edge.source} -> ${edge.target}: ${edge.data?.relationshipType}`
                                );

                            }
                        );

                        console.log(
                            "===================================="
                        );


                        // ==================================================
                        // RETURN GRAPH
                        // ==================================================

                        resolve({

                            nodes,

                            edges

                        });

                    }
                    catch (
                    error
                    ) {

                        console.error(
                            "Excel import failed:",
                            error
                        );


                        reject(
                            error
                        );

                    }

                };


            reader.onerror =
                () => {

                    reject(
                        new Error(
                            "Excel reading failed"
                        )
                    );

                };


            reader.readAsArrayBuffer(
                file
            );

        }
    );

}