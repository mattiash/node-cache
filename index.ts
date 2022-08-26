export function cache<T>(fn: () => Promise<T>, _timeoutMs: number) {
    return async () => await fn()
}
