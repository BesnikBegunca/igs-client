import {
    createContext,
    useContext,
    useState,
    useEffect
} from "react";




export interface CaseItem {


    id: string;


    title: string;


    description: string;


    status:
    | "open"
    | "closed"
    | "archived";



    createdAt: string;



    nodes: any[];


    edges: any[];


}









interface CaseContextType {



    cases: CaseItem[];



    activeCase: CaseItem | null;





    addCase:

    (

        data: Omit<CaseItem, "id" | "createdAt" | "nodes" | "edges">

    ) => void;





    deleteCase:

    (

        id: string

    ) => void;





    updateCase:

    (

        id: string,

        data: Partial<CaseItem>

    ) => void;





    openCase:

    (

        id: string

    ) => void;




}









const CaseContext =

    createContext<CaseContextType | null>(null);












export function CaseProvider({

    children

}: {

    children: React.ReactNode

}) {






    const [cases, setCases] =

        useState<CaseItem[]>(() => {





            const saved =

                localStorage.getItem(
                    "igs_cases"
                );





            if (!saved)

                return [];






            try {


                const parsed =

                    JSON.parse(saved);





                return Array.isArray(parsed)

                    ?

                    parsed

                    :

                    [];




            }

            catch {


                return [];


            }




        });








    const [activeCase, setActiveCase] =

        useState<CaseItem | null>(null);













    useEffect(() => {


        localStorage.setItem(

            "igs_cases",

            JSON.stringify(cases)

        );



    }, [cases]);












    function addCase(

        data:
            Omit<CaseItem, "id" | "createdAt" | "nodes" | "edges">

    ) {






        const newCase: CaseItem = {



            id:

                crypto.randomUUID(),





            createdAt:

                new Date().toISOString(),






            nodes: [],





            edges: [],





            ...data




        };








        setCases(prev => [

            ...prev,

            newCase

        ]);





    }













    function deleteCase(

        id: string

    ) {






        setCases(prev =>

            prev.filter(

                item =>

                    item.id !== id

            )

        );








        if (activeCase?.id === id) {


            setActiveCase(null);


        }




    }













    function updateCase(

        id: string,

        data: Partial<CaseItem>

    ) {






        setCases(prev =>

            prev.map(item =>





                item.id === id

                    ?

                    {

                        ...item,

                        ...data

                    }



                    :



                    item




            )

        );








        if (activeCase?.id === id) {



            setActiveCase(prev =>



                prev

                    ?

                    {

                        ...prev,

                        ...data

                    }



                    :

                    null



            );


        }






    }












    function openCase(

        id: string

    ) {





        const selected =

            cases.find(

                item =>

                    item.id === id

            );






        if (selected) {



            setActiveCase(selected);




        }





    }













    return (




        <CaseContext.Provider



            value={{



                cases,



                activeCase,



                addCase,



                deleteCase,



                updateCase,



                openCase



            }}



        >



            {children}



        </CaseContext.Provider>




    );




}












export function useCases() {





    const context =

        useContext(

            CaseContext

        );






    if (!context) {



        throw new Error(

            "useCases must be used inside CaseProvider"

        );



    }





    return context;




}