const CASES_KEY = "igs_cases";




export interface CaseData {

    id: string;

    name: string;

    nodes: any[];

    edges: any[];

    createdAt: string;

    status: string;

}








export function getCases(): CaseData[] {



    const data = localStorage.getItem(
        CASES_KEY
    );



    if (!data) {

        return [];

    }



    return JSON.parse(data);


}









export function saveNewCase(

    newCase: CaseData

) {


    const cases = getCases();



    const updated = [

        ...cases,

        newCase

    ];



    localStorage.setItem(

        CASES_KEY,

        JSON.stringify(updated)

    );


}









export function deleteCase(

    id: string

) {



    const cases = getCases();



    const updated = cases.filter(

        item => item.id !== id

    );



    localStorage.setItem(

        CASES_KEY,

        JSON.stringify(updated)

    );


}









export function getCaseById(

    id: string

) {


    const cases = getCases();



    return cases.find(

        item => item.id === id

    );


}