import {
    FiSearch,
    FiDownload,
    FiSave,
    FiSettings,
    FiFileText,
    FiUpload
} from "react-icons/fi";


import {
    useGraph
} from "../../context/GraphContext";


import {
    exportInvestigationExcel
} from "../../services/exportService";


import {
    importInvestigationExcel
} from "../../services/importService";








export default function Header() {




    const {

        nodes,

        edges,

        setNodes,

        setEdges,

        searchTerm,

        setSearchTerm


    } = useGraph();











    // SAVE JSON BACKUP

    const handleSave = () => {



        const data = {


            entities: nodes,


            relationships: edges,


            exportedAt:

                new Date()
                    .toISOString()


        };







        const blob = new Blob(


            [

                JSON.stringify(

                    data,

                    null,

                    2

                )

            ],


            {

                type: "application/json"

            }


        );







        const url = URL.createObjectURL(blob);



        const link = document.createElement("a");



        link.href = url;



        link.download = "IGS_Backup.json";



        link.click();




        URL.revokeObjectURL(url);



    };













    // IMPORT JSON BACKUP

    const handleImportJSON = () => {



        const input = document.createElement("input");



        input.type = "file";


        input.accept = ".json";







        input.onchange = (event: any) => {


            const file = event.target.files[0];


            if (!file)

                return;





            const reader = new FileReader();





            reader.onload = () => {


                try {



                    const data = JSON.parse(

                        reader.result as string

                    );






                    setNodes(

                        data.entities || []

                    );



                    setEdges(

                        data.relationships || []

                    );



                    setSearchTerm("");





                    alert(

                        "JSON investigation loaded successfully"

                    );



                }


                catch {


                    alert(

                        "Invalid JSON file"

                    );


                }



            };






            reader.readAsText(file);



        };





        input.click();



    };













    // IMPORT EXCEL

    const handleImportExcel = () => {



        const input = document.createElement("input");



        input.type = "file";


        input.accept = ".xlsx,.xls";








        input.onchange = async (event: any) => {



            const file = event.target.files[0];



            if (!file)

                return;







            try {



                const result = await importInvestigationExcel(

                    file

                );







                setNodes(

                    result.nodes || []

                );




                setEdges(

                    result.edges || []

                );





                setSearchTerm("");







                alert(

                    "Excel investigation loaded successfully"

                );




            }


            catch (error) {



                console.error(error);



                alert(

                    "Invalid Excel investigation file"

                );



            }



        };







        input.click();



    };













    // EXPORT EXCEL

    const handleExcelExport = () => {


        exportInvestigationExcel(

            nodes,

            edges

        );


    };












    return (




        <header className="header">







            <div className="header-left">


                <div className="logo">


                    🕵️


                </div>


            </div>









            <div className="header-search-box">



                <FiSearch />



                <input


                    type="text"



                    value={searchTerm}



                    onChange={(e) =>

                        setSearchTerm(

                            e.target.value

                        )

                    }



                    placeholder="Search entities, relationships..."



                />



            </div>













            <div className="header-actions">









                <button

                    className="header-btn"

                    onClick={handleSave}

                >

                    <FiSave />

                    Save

                </button>









                <button

                    className="header-btn"

                    onClick={handleImportJSON}

                >

                    <FiUpload />

                    Load JSON

                </button>









                <button

                    className="header-btn"

                    onClick={handleImportExcel}

                >

                    <FiUpload />

                    Load Excel

                </button>









                <button

                    className="header-btn export"

                    onClick={handleExcelExport}

                >

                    <FiFileText />

                    Excel

                </button>









                <button

                    className="header-btn"

                    onClick={handleExcelExport}

                >

                    <FiDownload />

                    Export

                </button>









                <button

                    className="icon-btn"

                    title="Settings"

                >


                    <FiSettings />


                </button>








            </div>







        </header>


    );

}