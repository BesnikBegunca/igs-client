import { useGraph } from "../../context/GraphContext";

import {
    saveNewCase,
    getCases
} from "../../services/storageService";




export default function SaveLoad() {


    const {

        nodes,

        edges


    } = useGraph();





    const handleSave = () => {


        saveNewCase({

            id: Date.now().toString(),

            name: "New Investigation",

            nodes,

            edges,

            createdAt: new Date().toISOString(),

            status: "Open"

        });


        alert("Case saved ✅");


    };







    const handleLoad = () => {


        const cases = getCases();



        if (cases.length === 0) {

            alert("No cases found");

            return;

        }



        alert(
            "Cases available: " + cases.length
        );


    };






    return (

        <div className="save-load">


            <button onClick={handleSave}>

                💾 Save Case

            </button>



            <button onClick={handleLoad}>

                📂 Load Cases

            </button>



        </div>

    );

}