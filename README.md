# promise-mw (v2)

**promise-mw** creates express middlewares from promises.

Promise-mw v2 is an iteration over the previous version with a slghtly different focus.

  - Provide type-safety when creating a middleware. A middleware is a function which must
    return a command. The type checker should be able to identify if this function is consistently
    returning a command, avoiding dead ends;

  - Typescript usage is being assumed. Errors that would be caught by the type checker are not
    runtime-checked by this lib;

  - In this version, besides providing the promise to middleware converter, an express.Application
    wrapper is also provided for shorter syntax.

## Usage

Basic usage.

```typescript
import express = require('express')
import mw = require('promise-mw-2')
const app = express()

const router = mw.wrap(app)

router.get('/login', (req, res) => {
    return res.send({ a : 1 })
})
```

`mw.wrap` returns an object with similar shape of an `express.Router`. But instead of
regular middlewares, a function with the following signature is sent to the callback:

```typescript
type callback = (req: express.Request, res: typeof __construct)

type __construct = {
    Error,                      //an error constructor with suggested fields
    render(...args) : Command   //alias to res.render(...)
    send(...args) : Command     //alias to res.status(200).send(...)
    status(status: STATUS_CODES, call:keyof express.Response, ...args) : Command
                                //alias to res.status(...)[...](...)
    other(call:keyof express.Response, ...args) : Command
                                //call any express.Response method (except status)
    next() : Command            //call next without any parameter
 }
 ```

 `middlewareFrom` creates a middleware from a function.

 ```typescript
 export const middlewareFrom
    : (handler: mwGenerateFnT) => express.RequestHandler
    = ...

export type mwGenerateFnT =
    (req: express.Request, res: typeof __construct) => Promise<Command>
 ```

 ## Error handling

 Throw the errors using... `throw`. The errors will be sent to `next()`
 (which is expected to hit an error middleware you define).

 We suggest setting the `statusCode` property of the error if the response status code is
 to be anything other than the default. Then handle that in the error middleware. The `res.Error()`
 constructor follows that principle..

 ```typescript
router.get('/login', (req, res) => {
    throw new res.Error(401, 'Unauthorized today')
})
```