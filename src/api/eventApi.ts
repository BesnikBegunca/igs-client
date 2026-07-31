import { api } from "./api";


export interface InvestigationEventDto {

    id?: string;

    caseId: string;

    title: string;

    type: string;

    description?: string;

    date: string;

    location?: string;

    source?: string;
}


export const eventApi = {

    getAll: () =>
        api.get<InvestigationEventDto[]>(
            "/events"
        ),


    getById: (
        id: string
    ) =>
        api.get<InvestigationEventDto>(
            `/events/${id}`
        ),


    create: (
        data: InvestigationEventDto
    ) =>
        api.post<InvestigationEventDto>(
            "/events",
            data
        ),


    update: (
        id: string,
        data: InvestigationEventDto
    ) =>
        api.put<InvestigationEventDto>(
            `/events/${id}`,
            data
        ),


    delete: (
        id: string
    ) =>
        api.delete<void>(
            `/events/${id}`
        )
};