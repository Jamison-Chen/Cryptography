import {
    RSA
} from "./rsa.js";
import {
    PrimeTool
} from "./prime.js";
let rsa = new RSA();
let pt = new PrimeTool();

export class Dlog {
    constructor() {}
    isGenerator(aCyclicGroup, candidateGenerator, modP) {
        let copy = new Set([...aCyclicGroup]);
        const order = copy.size;
        for (let j = 0; j < order; j++) {
            let elem = rsa.modularExp(candidateGenerator, j, modP);
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
    genPrimeEqualTQplusOne(q) {
        let t = 1;
        while (!pt.isPrime(t * q + 1)) {
            t++;
        }
        let prime = t * q + 1;
        return {
            "p": prime,
            "t": t
        };
    }
    genPrimeOrderSubgroupOfZpStar(q) {
        const pAndT = this.genPrimeEqualTQplusOne(q);
        let p = pAndT.p;
        // becasuse p is a prime, zpStar = {1, 2, 3, ..., p-1} by definition.
        // const zpStar = new Set(pt.relativePrimeList(pAndT.p)); // this is slow
        const zpStar = new Set(Array.from({
            length: p - 1
        }, (_, index) => index + 1)); // this is fast

        let subgroup = new Set();
        for (let each of zpStar) {
            subgroup.add(rsa.modularExp(each, pAndT.t, pAndT.p));
        }
        return subgroup;
    }
    getRandomElemInGroup(aGroup) {
        const randomIdx = Math.floor(Math.random() * aGroup.size);
        let i = 0;
        for (let each of aGroup) {
            if (i == randomIdx) return each;
            i++;
        }
    }
    logBaseGofH(aGroup, g, h) {
        const order = aGroup.size;
        let aPrime = 2;
        while (true) {
            if (!pt.isPrime(aPrime)) {
                aPrime++;
            } else {
                if (this.isGenerator(aGroup, g, aPrime)) break; // this line makes this algorithm slow
                else aPrime++;
            }
        }
        for (let i = 0; i < order; i++) {
            if (rsa.modularExp(g, i, aPrime) == h) {
                return {
                    "p": aPrime,
                    "x": i
                };
            }
        }
    }
}