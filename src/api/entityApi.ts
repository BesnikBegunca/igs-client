import { api } from "./api";


// ============================================================
// ENTITY DTO
// ============================================================

export interface EntityDto {

    id?: number | string;

    name: string;

    type: string;

    category?: string;

    icon?: string;

    attributes?: Record<string, any>;

    createdAt?: string;

    updatedAt?: string;

}


// ============================================================
// ENTITY API
// ============================================================

export const entityApi = {

    // ========================================================
    // GET ALL
    // ========================================================

    getAll: () =>
        api.get<EntityDto[]>(
            "/Entities"
        ),


    // ========================================================
    // GET BY ID
    // ========================================================

    getById: (
        id: number | string
    ) =>
        api.get<EntityDto>(
            `/Entities/${id}`
        ),


    // ========================================================
    // CREATE
    // ========================================================

    create: (
        entity: Omit<
            EntityDto,
            "id" |
            "createdAt" |
            "updatedAt"
        >
    ) =>
        api.post<EntityDto>(
            "/Entities",
            entity
        ),


    // ========================================================
    // UPDATE
    // ========================================================

    update: (
        id: number | string,
        entity: Partial<EntityDto>
    ) =>
        api.put<EntityDto>(
            `/Entities/${id}`,
            entity
        ),


    // ========================================================
    // DELETE
    // ========================================================

    delete: (
        id: number | string
    ) =>
        api.delete<void>(
            `/Entities/${id}`
        )

};