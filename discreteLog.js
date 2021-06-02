import {
    PrimeTool
} from "./prime.js";
import {
    CommonTool
} from "./common.js";
let pt = new PrimeTool();
let ct = new CommonTool();

export class Dlog {
    constructor() {}
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
        // genPrimeEqualTQplusOne(q) {
        //     let t = 1;
        //     while (!pt.isPrime(t * q + 1)) {
        //         t++;
        //     }
        //     let prime = t * q + 1;
        //     return {
        //         "p": prime,
        //         "t": t
        //     };
        // }
        // genPrimeOrderSubgroupOfZpStar(q) {
        //     const pAndT = this.genPrimeEqualTQplusOne(q);
        //     let p = pAndT.p;
        //     // becasuse p is a prime, zpStar = {1, 2, 3, ..., p-1} by definition.
        //     let subgroup = new Set();
        //     for (let x = 1; x < p; x++) {
        //         subgroup.add(ct.modularExp(x, pAndT.t, pAndT.p));
        //     }
        //     return subgroup;
        // }
    genPrimeOrderSubgroupOfZpStar(p, q) {
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
    logBaseGofHGivenP(aGroup, g, h, p) {
        const order = aGroup.size;
        for (let i = 0; i < order; i++) {
            if (ct.modularExp(g, i, p) == h) return i;
        }
    }
    logBaseGofH(publicKey) {
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
    genKeyPair(p, q) {
        const group = this.genPrimeOrderSubgroupOfZpStar(p, q);
        // choose the smallest element(except 1) as g
        const groupArr = Array.from(group);
        let g = groupArr[1];
        for (let each of groupArr) {
            if (each < g && each != 1) g = each;
        }
        const h = this.getRandomElemInGroup(group);
        const x = this.logBaseGofHGivenP(group, g, h, p);
        let keys = {
            "publicKey": {
                "group": group,
                "g": g,
                "h": h
            },
            "privateKey": {
                "p": p,
                "q": q,
                "x": x
            }
        }
        return keys;
    }
    encrypt(messageList, publicKey, p) {
        // assume messageList is a list of integers
        let cryptoList = [];
        for (let each of messageList) {
            cryptoList.push(ct.modularExp(publicKey.g, each, p));
        }
        return cryptoList;
    }
    decrypt(cryptoList, privateKey, publicKey) {
        // assume cryptoList is a list of integers
        let messageList = [];
        for (let each of cryptoList) {
            messageList.push(this.logBaseGofHGivenP(publicKey.group, publicKey.g, each, privateKey.p));
        }
        return messageList;
    }
}