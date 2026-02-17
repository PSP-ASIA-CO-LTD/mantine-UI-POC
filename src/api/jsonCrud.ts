const JSON_API_PREFIX = '/__json'

const requestJson = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    const trimmedPath = path.replace(/^\/+/, '')
    const headers = new Headers(options.headers)

    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(`${JSON_API_PREFIX}/${trimmedPath}`, {
        ...options,
        headers,
        cache: 'no-store'
    })

    if (!response.ok) {
        const message = await response.text().catch(() => '')
        throw new Error(`JSON CRUD request failed (${response.status}): ${message || response.statusText}`)
    }

    return response.json() as Promise<T>
}

const isSoftDeleted = (item: any) =>
    Boolean(item?.deletedAt || item?.isDeleted || item?._deleted)

const filterActive = <T>(items: T[]) =>
    items.filter((item: any) => !isSoftDeleted(item))

export const jsonCrud = {
    list: <T>(file: string, options?: { includeDeleted?: boolean }) =>
        requestJson<T[]>(file).then((items) =>
            options?.includeDeleted ? items : filterActive(items)
        ),
    get: <T>(file: string, id: string, options?: { includeDeleted?: boolean }) =>
        requestJson<T>(`${file}/${id}`).then((item: any) => {
            if (!options?.includeDeleted && isSoftDeleted(item)) {
                throw new Error('Not found')
            }
            return item as T
        }),
    create: <T extends { id?: string }>(file: string, payload: T) =>
        requestJson<T>(file, {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    update: <T>(file: string, id: string, patch: Partial<T>) =>
        requestJson<T>(`${file}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(patch)
        }),
    remove: (file: string, id: string) =>
        requestJson<{ ok: true }>(`${file}/${id}`, {
            method: 'DELETE'
        }),
    replaceAll: <T>(file: string, payload: T[]) =>
        requestJson<T[]>(file, {
            method: 'PUT',
            body: JSON.stringify(payload)
        })
}
