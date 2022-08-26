const empty: unique symbol = Symbol('empty')

export function cache<T>(fn: () => Promise<T>, _timeoutMs: number) {
    let cached: T | typeof empty = empty
    return async () => {
        if (cached === empty) {
            cached = await fn()
        }
        return cached
    }
}
