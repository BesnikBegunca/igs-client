export function generateReport(entity: any, data: any) {


    const report = `

INTELLIGENCE REPORT

ENTITY:
${entity.data?.label}


TYPE:
${entity.data?.type}



CASES:
${data.cases}



CONNECTIONS:
${data.connections}



RELATIONS:

${JSON.stringify(
        data.relations,
        null,
        2
    )}



RISK:

${entity.data?.risk || "Low"}



`;



    const blob =
        new Blob(
            [report],
            {
                type: "text/plain"
            }
        );



    const url =
        URL.createObjectURL(blob);



    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        `${entity.data?.label}-report.txt`;



    link.click();



}