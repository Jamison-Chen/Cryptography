import {
    PrimeTool
} from "./prime.js";
import {
    CommonTool
} from "./common.js";
let pt = new PrimeTool();
let ct = new CommonTool();

export class Dlog {
    publicInfo;
    secretA;
    secretB;
    exchangedInfo;
    sharedPrivateKey;
    constructor() {
        this.publicInfo = undefined;
        this.secretA = undefined;
        this.secretB = undefined;
        this.exchangedInfo = undefined;
        this.sharedPrivateKey = undefined;
    }
    isGenerator(aCyclicGroup, candidateGenerator, modP) {
        let copy = new Set([...aCyclicGroup]);
        const order = copy.size;
        for (let j = 0; j < order; j++) {
            let elem = ct.modularExp(candidateGenerator, j, modP);
            if (copy.has(elem)) copy.delete(elem);
            else return false;
            if (copy.size == 0) return true;
        }
    }
    findSmallestGenerator(aCyclicGroup, modP) {
        for (let each of aCyclicGroup) {
            if (this.isGenerator(aCyclicGroup, each, modP)) return each;
        }
    }
    genOrderQSubgroupOfZpStar(p, q) {
        let t = (p - 1) / q;
        // becasuse p is a prime, zpStar = {1, 2, 3, ..., p-1} by definition.
        let subgroup = new Set();
        for (let x = 1; x < p; x++) {
            subgroup.add(ct.modularExp(x, t, p));
            // by definition, the subgroup's order will be exactly q
            if (subgroup.size == q) return subgroup;
        }
    }
    getRandomElemInGroup(aGroup) {
        const randomIdx = Math.floor(Math.random() * aGroup.size);
        let i = 0;
        for (let each of aGroup) {
            if (i == randomIdx) return each;
            i++;
        }
    }
    loggHGivenP(g, h, p, q) {
        for (let i = 0; i < q; i++) {
            if (ct.modularExp(g, i, p) == h) return i;
        }
    }
    loggH(publicKey) {
        const order = publicKey.group.size;
        let aPrime = 2;
        while (true) {
            if (!pt.isPrime(aPrime)) {
                aPrime++;
            } else {
                if (this.isGenerator(publicKey.group, publicKey.g, aPrime)) break; // this line makes this algorithm slow
                else aPrime++;
            }
        }
        for (let i = 0; i < order; i++) {
            if (ct.modularExp(publicKey.g, i, aPrime) == publicKey.h) {
                return {
                    "p": aPrime,
                    "q": order,
                    "x": i
                };
            }
        }
    }
    genPublicInfo(p, q) {
        const group = this.genOrderQSubgroupOfZpStar(p, q);
        // choose the smallest element(except 1) as g
        const groupArr = Array.from(group);
        let g = groupArr[1];
        for (let each of groupArr) {
            if (each < g && each != 1) g = each;
        }
        this.publicInfo = {
            "group": group,
            "p": p,
            "g": g,
        };
        return this.publicInfo;
    }
    genExchangedInfo(secretA, secretB) {
        if (this.publicInfo) {
            this.secretA = secretA;
            this.secretB = secretB;
            const ha = ct.modularExp(this.publicInfo.g, secretA, this.publicInfo.p);
            const hb = ct.modularExp(this.publicInfo.g, secretB, this.publicInfo.p);
            this.exchangedInfo = {
                "a2b": ha,
                "b2a": hb
            };
        }
        return this.exchangedInfo;
    }
    genSharedPrivateKey() {
        if (this.exchangedInfo && this.secretA && this.secretB && this.publicInfo) {
            const keyA = ct.modularExp(this.exchangedInfo.b2a, this.secretA, this.publicInfo.p);
            const keyB = ct.modularExp(this.exchangedInfo.a2b, this.secretB, this.publicInfo.p);
            if (keyA == keyB) this.sharedPrivateKey = keyA;
        }
        return this.sharedPrivateKey;
    }
    bruteForceFindKey(publicInfo, exchangedInfo) {
        const secretA = this.loggHGivenP(publicInfo.g, exchangedInfo.a2b, publicInfo.p, publicInfo.group.size);
        const secretB = this.loggHGivenP(publicInfo.g, exchangedInfo.b2a, publicInfo.p, publicInfo.group.size);
        const key = ct.modularExp(publicInfo.g, secretA * secretB, publicInfo.p);
        return key;
    }
}