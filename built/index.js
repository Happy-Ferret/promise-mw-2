"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_CODES = require("./status-codes");
class Error extends global.Error {
    constructor(arg1, arg2, arg3) {
        let status, message, extra;
        if (arg3) {
            message = arg3;
            extra = arg2;
            status = arg1;
        }
        else if (arg2) {
            message = arg2;
            status = arg1;
        }
        else {
            message = arg1;
        }
        super(message);
        this.extra = extra;
        this.httpStatus = status;
        this.message = message;
        return this;
    }
}
exports.Error = Error;
exports.__construct = {
    Error,
    send(...args) {
        return exports.__construct.status(200, 'send', ...args);
    },
    render(...args) {
        return exports.__construct.other('render', ...args);
    },
    status(status, call, ...args) {
        return {
            __call__: call,
            status,
            args
        };
    },
    other(call, ...args) {
        return {
            __call__: call,
            args
        };
    },
    next() {
        return {
            __call__: '__next__'
        };
    }
};
const handleExpressCommand = (cmd) => (res, next) => __awaiter(this, void 0, void 0, function* () {
    let args = cmd.args || [];
    let aux = res;
    if (cmd.status)
        aux = res.status(cmd.status);
    aux[cmd.__call__](...args);
});
exports.middlewareFrom = (handler) => (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        let cmd = yield handler(req, exports.__construct);
        if (cmd.__call__ !== '__next__')
            handleExpressCommand(cmd)(res, next);
        else
            next();
    }
    catch (err) {
        next(err);
    }
});
const methods = ['all', 'get', 'post', 'put', 'delete', 'patch', 'options', 'head',
    'checkout', 'copy', 'lock', 'merge', 'mkactivity', 'mkcol', 'move', 'm-search',
    'notify', 'purge', 'report', 'searcg', 'subscribe', 'trace', 'unlock', 'unsubscribe'];
const __wrapCache = new Map();
function wrap(app) {
    let find = __wrapCache.get(app);
    if (find)
        return find;
    let out = {};
    let routeproto = {};
    methods.forEach(method => {
        let matcher = (path, ...handlers) => {
            let expHandlers = handlers.map(exports.middlewareFrom);
            app[method](path, ...expHandlers);
        };
        out[method] = (path, ...handlers) => matcher(path, ...handlers);
        routeproto[method] = (...handlers) => {
            this.expRouter[method](...handlers.map(exports.middlewareFrom));
        };
    });
    out.route = (route) => {
        let obj = { __proto__: routeproto };
        obj.expRouter = app.route(route);
        return obj;
    };
    out.use = (...args) => {
        let path;
        let sendArgs;
        if (typeof args[0] === 'string') {
            path = args[0];
            sendArgs = args.slice(1).map(exports.middlewareFrom);
            app.use(path, ...(args.slice(1)));
        }
        else {
            sendArgs = args.map(exports.middlewareFrom);
            app.use(...args);
        }
    };
    __wrapCache.set(app, out);
    return out;
}
exports.wrap = wrap;
