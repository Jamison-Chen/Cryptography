import {
    PrimeTool
} from "./prime.js";
let pt = new PrimeTool();
export class RSA {
    constructor() {}
    modularExp(a, b, n) { // return a^b (mod n)
        // beacuse large base or exponent won't be precisely calculated
        // so we use some properties of modulo operation to solve this problem
        let data = [
            [a, b]
        ];
        while (!(data[0][0] < n && data[0][1] < 2 && data.length == 1)) {
            if (data[0][0] == 0) return 0;
            while (data[0][1] >= 2 && data[0][0] < n) {
                if (data[0][1] % 2 != 0) data.push([data[0][0], data[0][1] % 2]);
                data[0][0] *= data[0][0];
                data[0][1] = Math.floor(data[0][1] / 2);
            }
            while (data[0][1] < 2 && data[0][0] < n && data.length > 1) {
                let toPop = data.pop();
                let toPopNum = toPop[0] ** toPop[1];
                data[0][0] = (data[0][0] ** data[0][1]) * toPopNum;
                data[0][1] = 1;
            }
            data[0][0] = data[0][0] % n;
        }
        return (data[0][0] ** data[0][1]) % n;
    }
    modularExp_FLT(a, b, p, q) { // return a^b (mod p*q)
        let n = p * q;
        if (p == 1 || q == 1) {
            // use Fermat's Little Theorem here
            if (a % n == 0) return 0;
            if (b == (n - 1)) return 1;
            if (b > (n - 1)) return this.modularExp_FLT(a, b % (n - 1), p, q);
            else return this.modularExp(a, b, n);
        } else {
            // use Chinese Remainder Theorem here
            let lc, alpha, beta;
            if (p < q) {
                lc = pt.linearCombination(p, q);
                alpha = lc[0];
                beta = lc[1];
            } else {
                lc = pt.linearCombination(q, p);
                alpha = lc[1];
                beta = lc[0];
            }
            let pp = this.modularExp_FLT(a, b, p, 1);
            let qq = this.modularExp_FLT(a, b, q, 1);
            let ans = pp * alpha * p + qq * beta * q;
            if (ans < 0) {
                ans += n;
            }
            return ans;
        }
    }
    randomPrimePair(bitLength) {
        let p1 = 0;
        let p2 = 0;
        while (p1 == p2) {
            for (let i = 0; i < bitLength; i++) {
                if (Math.round(Math.random()) == 1) p1 += 2 ** i;
                if (Math.round(Math.random()) == 1) p2 += 2 ** i;
            }
            p1 = pt.largestPrime(p1);
            p2 = pt.largestPrime(p2);
        }
        return [p1, p2];
    }
    genRSAKeyPair(p, q) {
        let keys = {
            "publicKey": {
                "e": this.genEncParam(p, q),
                "n": p * q
            },
            "privateKey": {
                "d": undefined,
                "p": p,
                "q": q
            }
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
        let primeList = Object.keys(pt.primeFactorization(n)).map(e => parseInt(e));
        let p = primeList[0];
        let q = primeList[1];
        let order = (p - 1) * (q - 1);
        let d = pt.linearCombination(e, order)[0];
        return {
            "d": d,
            "p": p,
            "q": q
        };
    }
    encrypt(messageList, publicKey) {
        // assume messageList is a list of integers
        let cryptoList = [];
        for (let each of messageList) {
            // cryptoList.push(this.modularExp(each, publicKey.e, publicKey.n));
            cryptoList.push(this.modularExp_FLT(each, publicKey.e, publicKey.n, 1));
        }
        return cryptoList;
    }
    decrypt(cryptoList, privateKey) {
        // assume cryptoList is a list of integers
        let messageList = [];
        for (let each of cryptoList) {
            messageList.push(this.modularExp_FLT(each, privateKey.d, privateKey.p, privateKey.q));
        }
        return messageList;
    }
    string2asciiCodeList(str) {
        let asciiCodeList = [];
        for (let i = 0; i < str.length; i++) asciiCodeList.push(str.charCodeAt(i));
        return asciiCodeList;
    }
    asciiCodeList2string(aList, forcePrintable = false) {
        if (forcePrintable) {
            return String.fromCharCode(...aList.map(e => {
                let remainder = e % 126;
                if (remainder < 32) return remainder + 32;
                return remainder;
            }));
        }
        return String.fromCharCode(...aList);
    }
}