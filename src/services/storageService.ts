const CASES_KEY = "igs_cases";

export interface CaseData {

    id: string;

    name: string;

    description: string;

    investigator: string;

    status: "Open" | "Closed" | "Archived";

    createdAt: string;

    updatedAt: string;

    nodes: any[];

    edges: any[];

}







export function getCases(): CaseData[] {

    const data = localStorage.getItem(CASES_KEY);

    if (!data) {

        return [];

    }

    return JSON.parse(data);

}







export function saveNewCase(

    newCase: CaseData

) {

    const cases = getCases();

    cases.push(newCase);

    localStorage.setItem(

        CASES_KEY,

        JSON.stringify(cases)

    );

}







export function updateCase(

    updatedCase: CaseData

) {

    const cases = getCases();

    const updated = cases.map(item =>

        item.id === updatedCase.id

            ? updatedCase

            : item

    );

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

): CaseData | undefined {

    return getCases().find(

        item => item.id === id

    );

}







export function createEmptyCase(

    name: string

): CaseData {

    const now = new Date().toISOString();

    return {

        id: Date.now().toString(),

        name,

        description: "",

        investigator: "",

        status: "Open",

        createdAt: now,

        updatedAt: now,

        nodes: [],

        edges: []

    };

}







export function closeCase(

    id: string

) {

    const cases = getCases();

    const updated = cases.map(item =>

        item.id === id

            ? {

                ...item,

                status: "Closed",

                updatedAt: new Date().toISOString()

            }

            : item

    );

    localStorage.setItem(

        CASES_KEY,

        JSON.stringify(updated)

    );

}







export function archiveCase(

    id: string

) {

    const cases = getCases();

    const updated = cases.map(item =>

        item.id === id

            ? {

                ...item,

                status: "Archived",

                updatedAt: new Date().toISOString()

            }

            : item

    );

    localStorage.setItem(

        CASES_KEY,

        JSON.stringify(updated)

    );

}







export function reopenCase(

    id: string

) {

    const cases = getCases();

    const updated = cases.map(item =>

        item.id === id

            ? {

                ...item,

                status: "Open",

                updatedAt: new Date().toISOString()

            }

            : item

    );

    localStorage.setItem(

        CASES_KEY,

        JSON.stringify(updated)

    );

}