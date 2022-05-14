import { PrimeTool } from "./prime.js";
import { CommonTool } from "./common.js";
let pt = new PrimeTool();
let ct = new CommonTool();

export class RSA {
    constructor() {}
    genKeyPair(p, q) {
        let keys = {
            publicKey: {
                e: this.genEncParam(p, q),
                n: p * q,
            },
            privateKey: {
                d: undefined,
                p: p,
                q: q,
            },
        };
        keys["privateKey"]["d"] = this.genDecParam(p, q, keys.publicKey.e);
        return keys;
    }
    genEncParam(p, q) {
        let order = (p - 1) * (q - 1);
        let gcd = 0;
        let e = 2;
        while (gcd != 1) {
            // note: the value of e is not believed to affect the hardness of RSA problem
            // but e need to be less than order
            // e = Math.floor(Math.random() * (order ** 0.5)) + 10;
            e++; // an alternative way of the above line
            gcd = pt.gcd(order, e);
        }
        return e;
    }
    genDecParam(p, q, e) {
        let order = (p - 1) * (q - 1);
        let d = pt.linearCombination(e, order)[0];
        return d;
    }
    bruteForceFindKey(publicKey) {
        let e = publicKey.e;
        let n = publicKey.n;
        // It's prime factorization that makes this algorithm slow
        let primeList = Object.keys(pt.primeFactorization(n)).map((e) =>
            parseInt(e)
        );
        let p = primeList[0];
        let q = primeList[1];
        let order = (p - 1) * (q - 1);
        let d = pt.linearCombination(e, order)[0];
        return {
            d: d,
            p: p,
            q: q,
        };
    }
    encrypt(messageList, publicKey) {
        // assume messageList is a list of integers
        let cryptoList = [];
        for (let each of messageList) {
            // cryptoList.push(ct.modularExp(each, publicKey.e, publicKey.n));
            cryptoList.push(
                ct.modularExp_FLT_CRT(each, publicKey.e, publicKey.n, 1)
            );
        }
        return cryptoList;
    }
    decrypt(cryptoList, privateKey) {
        // assume cryptoList is a list of integers
        let messageList = [];
        for (let each of cryptoList) {
            messageList.push(
                ct.modularExp_FLT_CRT(
                    each,
                    privateKey.d,
                    privateKey.p,
                    privateKey.q
                )
            );
        }
        return messageList;
    }
}
