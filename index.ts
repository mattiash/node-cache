const empty: unique symbol = Symbol('empty')

export function cache<T>(fn: () => Promise<T>, timeoutMs: number) {
    let cached: T | typeof empty = empty
    let cached_updated = 0
    return async () => {
        if (cached === empty || Date.now() - cached_updated > timeoutMs) {
            cached_updated = Date.now()
            cached = await fn()
        }
        return cached
    }
}
