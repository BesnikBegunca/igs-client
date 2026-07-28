import * as XLSX from "xlsx";







export function importInvestigationExcel(
    file: File
) {



    return new Promise<any>((resolve, reject) => {




        const reader = new FileReader();







        reader.onload = (event: any) => {



            try {



                const data = new Uint8Array(

                    event.target.result

                );







                const workbook = XLSX.read(

                    data,

                    {

                        type: "array"

                    }

                );









                /*
                    READ SHEETS
                */







                const entitiesSheet =

                    workbook.Sheets["Entities"];







                const relationshipsSheet =

                    workbook.Sheets["Relationships"];







                const detailsSheet =

                    workbook.Sheets["Details"];












                if (!entitiesSheet || !relationshipsSheet) {


                    throw new Error(

                        "Invalid IGS Excel file"

                    );


                }









                const entities: any[] =

                    XLSX.utils.sheet_to_json(

                        entitiesSheet

                    );









                const relationships: any[] =

                    XLSX.utils.sheet_to_json(

                        relationshipsSheet

                    );









                const details: any[] =

                    detailsSheet

                        ?

                        XLSX.utils.sheet_to_json(

                            detailsSheet

                        )

                        :

                        [];













                /*
                    CREATE NODES
                */









                const nodes = entities.map(

                    (entity, index) => {







                        const nodeDetails: any = {};









                        details

                            .filter(

                                d =>

                                    d.Entity === entity.Name

                            )

                            .forEach(d => {



                                nodeDetails[d.Field] = d.Value;



                            });












                        return {







                            id:

                                String(entity.ID),










                            type:

                                "custom",










                            position: {





                                x:

                                    Number(entity.PositionX) ||

                                    (index % 5) * 250,





                                y:

                                    Number(entity.PositionY) ||

                                    Math.floor(index / 5) * 180





                            },













                            data: {







                                label:

                                    entity.Name,









                                type:

                                    entity.Type || "",









                                icon:

                                    entity.Icon || "❓",









                                category:

                                    entity.Category || "",









                                risk:

                                    entity.Risk || "Low",









                                description:

                                    entity.Description || "",









                                details:

                                    nodeDetails







                            }








                        };







                    }



                );
















                /*
                    CREATE EDGES
                */









                const edges = relationships.map(

                    relation => ({







                        id:

                            relation.ID ||

                            `${relation.Source}-${relation.Target}`,










                        source:

                            String(relation.Source),










                        target:

                            String(relation.Target),










                        type:

                            "custom",










                        data: {







                            relationshipType:

                                relation.Relationship || "Related",









                            description:

                                relation.Description || "",









                            evidence:

                                relation.Evidence || "",









                            date:

                                relation.Date || ""






                        }








                    })

                );













                resolve({



                    nodes,

                    edges



                });









            }

            catch (error) {



                reject(error);



            }







        };









        reader.onerror = () => {



            reject(

                "Excel reading failed"

            );



        };









        reader.readAsArrayBuffer(file);






    });




}