/**
 *
 * @param {int} bX - bounding box X
 * @param {int} bY - bounding box Y
 * @param {int} bW - bounding box width
 * @param {int} bH - bounding box height
 * @param {number} x
 * @param {number} y
 * @return {boolean} <code>true</code> if xy is inside of bbox, else false
 */
export function bboxContains(bX, bY, bW, bH, x, y) {
    const xL = bX, yL = bY;
    const xH = xL + bW, yH = yL + bH;
    return xL <= x && x <= xH && yL <= y && y <= yH;
}
export class AABB {
    /**
     * @param {int} x
     * @param {int} y
     * @param {int} w
     * @param {int} h
     * @returns {AABB}
     */
    static fromArray([x, y, w, h]) {
        return new AABB(x, y, w, h);
    }

    /**
     * @param {int} x
     * @param {int} y
     * @param {int} w
     * @param {int} h
     */
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this._array = [x, y, w, h];
    }

    copy() {
        return new AABB(this.x, this.y, this.width, this.height);
    }

    /**
     * Returns this AABB as an array of [x, y, width, height].
     *
     * @returns {Array|[int,int,int,int]}
     */
    get array() {
        return this._array;
    }

    /**
     * Expands this AABB to contain the point (x, y)
     * @param {int} x
     * @param {int} y
     */
    expandToContainPoint(x, y) {
        if (!this.contains(x, y)) {
            if (x < this.x) {
                const diff = this.x - x;
                this.x = x;
                this.width += diff;
            } else if (x > (this.x + this.width)) {
                this.width = x - this.x;
            }
            if (y < this.y) {
                const diff = this.y - y;
                this.y = y;
                this.height += diff;
            } else if (y > (this.y + this.height)) {
                this.height = y - this.y;
            }
        }
        return this;
    }

    /**
     * Expands this AABB to contain the other AABB
     * @param {AABB} aabb
     */
    expandToContainAABB(aabb) {
        const f = p => this.expandToContainPoint.apply(this, p);
        f(aabb.topLeft);
        f(aabb.topRight);
        f(aabb.bottomLeft);
        f(aabb.bottomRight);
        return this;
    }

    /**
     * @param {int} dx
     * @param {int} dy
     * @returns {AABB}
     */
    move(dx, dy) {
        return new AABB(this.x + dx, this.y + dy, this.width, this.height);
    }

    get topLeft() {
        return [this.x, this.y];
    }

    get topRight() {
        return [this.x + this.width, this.y];
    }

    get bottomLeft() {
        return [this.x, this.y + this.height];
    }

    get bottomRight() {
        return [this.x + this.width, this.y + this.height];
    }

    /**
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     * @see bboxContains
     */
    contains(x, y) {
        return bboxContains(this.x, this.y, this.width, this.height, x, y);
    }
}
/**
 * @param {Array.<AABB|AABBCollection>} aabbs
 * @return {Array.<AABB>}
 */
function flattenMixedArray(aabbs) {
    const arr = [];
    for (let aabbOrColl of aabbs) {
        if (aabbOrColl instanceof AABB) {
            arr.push(aabbOrColl);
        } else {
            arr.push.apply(arr, Array.from(aabbOrColl));
        }
    }
    return arr;
}
export class AABBCollection {
    /**
     * @param {AABB|AABBCollection} aabbs
     * @returns {AABBCollection}
     */
    static of(...aabbs) {
        return AABBCollection.fromMixedArray(aabbs);
    }

    /**
     * @param {Array.<AABB|AABBCollection>} aabbs
     * @returns {AABBCollection}
     */
    static fromMixedArray(aabbs) {
        return new AABBCollection(flattenMixedArray(aabbs));
    }

    /**
     * @param {Iterable<AABB>|AABBCollection} aabbs
     */
    constructor(aabbs) {
        let i = 0;
        for (let aabb of aabbs) {
            this[i] = aabb;
            i++;
        }
        this.length = aabbs.length;
        const t = this;
        this[Symbol.iterator] = function* aabbCollIterator() {
            for (let i = 0; i < t.length; i++) {
                yield t[i];
            }
        };
    }

    /**
     * @param {AABB|AABBCollection} aabbs
     * @return {AABBCollection}
     */
    newWithLast(...aabbs) {
        const aabbsFlat = flattenMixedArray(aabbs);
        const aabbColl = new AABBCollection(this);
        const appendStartIndex = aabbColl.length;
        aabbColl.length += aabbsFlat.length;
        for (let i = appendStartIndex, j = 0; i < aabbColl.length; i++, j++) {
            aabbColl[i] = aabbsFlat[j];
        }
        return aabbColl;
    }

    /**
     * @param {int} dx
     * @param {int} dy
     * @returns {AABBCollection}
     */
    move(dx, dy) {
        const aabbColl = new AABBCollection(this);
        for (let i = 0; i < aabbColl.length; i++) {
            aabbColl[i] = aabbColl[i].move(dx, dy);
        }
        return aabbColl;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    contains(x, y) {
        for (let aabb of this) {
            if (aabb.contains(x, y)) {
                return true;
            }
        }
        return false;
    }
}