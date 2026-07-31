const API_BASE_URL =
    "http://localhost:5132/api";


async function request<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {

    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,

                headers: {
                    "Content-Type":
                        "application/json",

                    ...(options?.headers || {})
                }
            }
        );


    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            errorText ||
            `API Error: ${response.status}`
        );
    }


    if (response.status === 204) {

        return undefined as T;
    }


    return response.json();
}


export const api = {

    get: <T>(
        endpoint: string
    ) =>
        request<T>(
            endpoint
        ),


    post: <T>(
        endpoint: string,
        body: unknown
    ) =>
        request<T>(
            endpoint,
            {
                method: "POST",

                body:
                    JSON.stringify(body)
            }
        ),


    put: <T>(
        endpoint: string,
        body: unknown
    ) =>
        request<T>(
            endpoint,
            {
                method: "PUT",

                body:
                    JSON.stringify(body)
            }
        ),


    delete: <T>(
        endpoint: string
    ) =>
        request<T>(
            endpoint,
            {
                method: "DELETE"
            }
        )

};