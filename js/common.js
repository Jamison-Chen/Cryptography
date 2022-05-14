import { PrimeTool } from "./prime.js";
let pt = new PrimeTool();

export class CommonTool {
    constructor() {}
    modularExp(a, b, n) {
        // return a^b (mod n)
        // beacuse large base or exponent won't be precisely calculated
        // so we use some properties of modulo operation to solve this problem
        let data = [[a, b]];
        while (!(data[0][0] < n && data[0][1] < 2 && data.length == 1)) {
            if (data[0][0] == 0) return 0;
            while (data[0][1] >= 2 && data[0][0] < n) {
                if (data[0][1] % 2 != 0)
                    data.push([data[0][0], data[0][1] % 2]);
                data[0][0] *= data[0][0];
                data[0][1] = Math.floor(data[0][1] / 2);
            }
            while (data[0][1] < 2 && data[0][0] < n && data.length > 1) {
                let toPop = data.pop();
                let toPopNum = toPop[0] ** toPop[1];
                data[0][0] = data[0][0] ** data[0][1] * toPopNum;
                data[0][1] = 1;
            }
            data[0][0] = data[0][0] % n;
        }
        return data[0][0] ** data[0][1] % n;
    }
    modularExp_FLT_CRT(a, b, p, q) {
        // return a^b (mod p*q)
        let n = p * q;
        if (p == 1 || q == 1) {
            // use Fermat's Little Theorem here
            if (a % n == 0) return 0;
            if (b == n - 1) return 1;
            if (b > n - 1) return this.modularExp_FLT_CRT(a, b % (n - 1), p, q);
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
            let pp = this.modularExp_FLT_CRT(a, b, p, 1);
            let qq = this.modularExp_FLT_CRT(a, b, q, 1);
            let ans = pp * alpha * p + qq * beta * q;
            if (ans < 0) {
                ans += n;
            }
            return ans;
        }
    }
    randomPrimePair(bitLength1, bitLength2 = undefined) {
        if (bitLength2 == undefined) bitLength2 = bitLength1;
        let p1 = 0;
        let p2 = 0;
        while (p1 == p2) {
            for (let i = 0; i < bitLength1; i++) {
                if (Math.round(Math.random()) == 1) p1 += 2 ** i;
            }
            for (let i = 0; i < bitLength2; i++) {
                if (Math.round(Math.random()) == 1) p2 += 2 ** i;
            }
            p1 = pt.largestPrime(p1);
            p2 = pt.largestPrime(p2);
        }
        return [p1, p2];
    }
    string2ascii(str) {
        let asciiCodeList = [];
        for (let i = 0; i < str.length; i++)
            asciiCodeList.push(str.charCodeAt(i));
        return asciiCodeList;
    }
    ascii2string(aList, forcePrintable = false) {
        if (forcePrintable) {
            return String.fromCharCode(
                ...aList.map((e) => {
                    let remainder = e % 126;
                    if (remainder < 32) return remainder + 32;
                    return remainder;
                })
            );
        }
        return String.fromCharCode(...aList);
    }
}
