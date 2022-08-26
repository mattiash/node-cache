import { test } from 'purple-tape'
import { promisify } from 'util'
import { cache } from '../index'

const sleep = promisify(setTimeout)

async function expensive1() {
    await sleep(100)
    return 1
}

test('calls original function', async (t) => {
    const cached = cache(expensive1, 1000)
    t.equal(await cached(), 1)
    t.equal(await cached(), 1)
})
