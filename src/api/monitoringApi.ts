import { api } from "./api";


export interface MonitoringDto {

    id?: number;

    entityId: number;

    isActive?: boolean;

}


export const monitoringApi = {

    getAll: () =>
        api.get<MonitoringDto[]>(
            "/monitoring"
        ),


    getById: (
        id: number | string
    ) =>
        api.get<MonitoringDto>(
            `/monitoring/${id}`
        ),


    create: (
        monitoring: MonitoringDto
    ) =>
        api.post<MonitoringDto>(
            "/monitoring",
            monitoring
        ),


    update: (
        id: number | string,
        monitoring: MonitoringDto
    ) =>
        api.put<MonitoringDto>(
            `/monitoring/${id}`,
            monitoring
        ),


    delete: (
        id: number | string
    ) =>
        api.delete<void>(
            `/monitoring/${id}`
        )

};