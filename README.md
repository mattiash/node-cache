# @mattiash/cache

Wrap a function in a cache and return possibly cached values from the function.
Guarantees that only a single request to the original function is done at a time,
even if there are multiple calls to the cached function in rapid succession

![Build master](https://github.com/mattiash/node-cache/workflows/Build%20master/badge.svg)
![Publish to nom](https://github.com/mattiash/node-cache/workflows/Publish%20to%20npm/badge.svg)
[![npm version](https://badge.fury.io/js/@mattiash%2Fcache.svg)](https://badge.fury.io/js/@mattiash%2Fcache)

## Usage

```typescript
import { cache } from '@mattiash/cache'

async function expensive() {
    // Does something expensive and returns the result
}

const cached = cache(expensive, (success) => (success ? 1000 : 100))

const result = await cached()
```

`cached` is now a function that returns the same value as `expensive_operation` but through a cache.
If `expensive_operation` resolves, the value is cached for 1000ms after expensive_operation returns it.
If `expensive_operation` rejects, the reject is only cached for 100ms.

## Timeouts

The second argument to `cache` is a function called `timeoutMs`.
The return value from timeoutMs decides how long a value is cached.
`success` is true if fn resolved and false if it rejected.

The cache timeout starts running AFTER the fn resolves or rejects. If fn does not reolve or reject,
all calls to the cached function will be blocked forever! Make sure that the original function always
resolves or rejects eventually.

Tip: To avoid problems where all cache entries expire at the same time, randomize the timeout for each call.
E.g.

```typescript
cache(fn, () => 10000 + 5000 * (Math.random() - 0.5))
```

for a timeout between 5 and 15 seconds.

## Cached Return Value

Note that the value that the cached function resolves with will be the same for all callers
that receive the same cached value from the original function. This means that if the original function
returns an object and one of the callers modifies it, all callers will see the modified object.

## License

MIT License

Copyright (c) 2022, Mattias Holmlund, <mattias@holmlund.se>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
