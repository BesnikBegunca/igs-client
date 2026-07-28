import * as XLSX from "xlsx";
import { saveAs } from "file-saver";





export function exportInvestigationExcel(
    nodes: any[],
    edges: any[]
) {



    const workbook = XLSX.utils.book_new();









    /*
        ENTITIES SHEET
    */



    const entities = nodes.map(node => ({


        ID:
            node.id,


        Name:
            node.data.label,


        Type:
            node.data.type,


        Icon:
            String(node.data.icon || ""),


        Category:
            node.data.category || "",


        Risk:
            node.data.risk || "Low",


        Description:
            node.data.description || "",


        PositionX:
            node.position.x,


        PositionY:
            node.position.y,


        Created:
            node.data.createdAt || ""


    }));







    const entitySheet =

        XLSX.utils.json_to_sheet(

            entities

        );





    XLSX.utils.book_append_sheet(

        workbook,

        entitySheet,

        "Entities"

    );












    /*
        RELATIONSHIPS SHEET
    */





    const relationships = edges.map(edge => ({



        ID:

            edge.id,



        Source:

            edge.source,



        Target:

            edge.target,



        Relationship:

            edge.data?.relationshipType || "",



        Description:

            edge.data?.description || "",



        Evidence:

            edge.data?.evidence || "",



        Date:

            edge.data?.date || ""



    }));









    const relationshipSheet =

        XLSX.utils.json_to_sheet(

            relationships

        );





    XLSX.utils.book_append_sheet(

        workbook,

        relationshipSheet,

        "Relationships"

    );













    /*
        DETAILS SHEET
    */





    const details: any[] = [];





    nodes.forEach(node => {



        Object.entries(

            node.data.details || {}

        )

            .forEach(([key, value]) => {



                details.push({



                    Entity:

                        node.data.label,



                    Field:

                        key,



                    Value:

                        value



                });



            });



    });







    const detailsSheet =

        XLSX.utils.json_to_sheet(

            details

        );







    XLSX.utils.book_append_sheet(

        workbook,

        detailsSheet,

        "Details"

    );












    /*
        DOWNLOAD
    */





    const excelBuffer =

        XLSX.write(

            workbook,

            {


                bookType: "xlsx",


                type: "array"


            }

        );








    const blob = new Blob(


        [

            excelBuffer

        ],


        {


            type:

                "application/octet-stream"


        }


    );







    saveAs(


        blob,


        `IGS_Investigation_${Date.now()}.xlsx`


    );



}