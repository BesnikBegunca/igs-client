import { api } from "./api";


export interface RelationshipDto {

    id?: string;

    caseId: string;

    sourceEntityId: string;

    targetEntityId: string;

    relationshipType: string;

    description?: string;

    evidence?: string;

    date?: string;

    monitored: boolean;
}


export const relationshipApi = {

    getAll: () =>
        api.get<RelationshipDto[]>(
            "/relationships"
        ),


    getById: (
        id: string
    ) =>
        api.get<RelationshipDto>(
            `/relationships/${id}`
        ),


    create: (
        data: RelationshipDto
    ) =>
        api.post<RelationshipDto>(
            "/relationships",
            data
        ),


    update: (
        id: string,
        data: RelationshipDto
    ) =>
        api.put<RelationshipDto>(
            `/relationships/${id}`,
            data
        ),


    delete: (
        id: string
    ) =>
        api.delete<void>(
            `/relationships/${id}`
        )
};