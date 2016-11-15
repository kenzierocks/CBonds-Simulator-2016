import {Promise} from "./es2015";

/**
 * Like {@link Promise#all}, but returns only successful promises in the result array.
 * Returned promise resolves with an empty array if passed an empty array.
 * Returned promise is never rejected by this method, rejections are discarded.
 * If one of the input promises never resolves or rejects, this promise will not resolve.
 *
 * @param {Iterable.<Object>} promises
 * @return {Promise}
 */
function successful(promises) {
    return new Promise(resolve => {
        let result;
        let finished = 0;
        let count = 0;

        function resolveIfComplete() {
            if (finished === count) {
                resolve(result);
            }
        }

        for (let promise of promises) {
            const index = count;
            count++;
            promise.then(e => {
                result[index] = e;
                finished++;
                resolveIfComplete();
                return e;
            }).catch(e => {
                // discard errors
            });
        }
        result = new Array(count);
        resolveIfComplete();
    });
}