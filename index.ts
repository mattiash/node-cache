export function cache<T>(fn: () => Promise<T>, timeoutMs: number) {
    let p_updated = 0
    let p: Promise<T> | undefined
    return async () => {
        if (!p || Date.now() - p_updated > timeoutMs) {
            p_updated = Date.now()
            p = fn()
        }
        return await p
    }
}
