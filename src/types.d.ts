import * as express from 'express'


declare global {
    namespace PromiseMw2 {
        export interface Command {
            __call__: keyof express.Response | '__next__'
            status? : number
            args?: any[]
        }
    }

    //fix a typescript issue (bivariance)
    interface Promise<T> { __promiseBrand__: T }
}