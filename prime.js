export class PrimeTool {
    constructor() {}
    isPrime(x) { // fast
        if (x == 1) return false;
        if (x == 2) return true;
        const upperBound = Math.ceil(x ** 0.5);
        for (let i = 2; i <= upperBound; i++) {
            if (x % i == 0) return false;
        }
        return true;
    }
    isPrime_FLT(x) { // slow, base on Fermat's Little Theorem
        if (x == 1) return false;
        for (let i = 1; i < x; i++) {
            let data = [
                [i, x - 1]
            ];
            // beacuse large base or exponent won't be precisely calculated
            // so we use some properties of modulo operation to solve this problem
            while (!(data[0][0] < x && data[0][1] < 2 && data.length == 1)) {
                if (data[0][0] == 0) return false;
                while (data[0][1] >= 2 && data[0][0] < x) {
                    if (data[0][1] % 2 != 0) data.push([data[0][0], data[0][1] % 2]);
                    data[0][0] *= data[0][0];
                    data[0][1] = Math.floor(data[0][1] / 2);
                }
                while (data[0][1] < 2 && data[0][0] < x && data.length > 1) {
                    let toPop = data.pop();
                    let toPopNum = toPop[0] ** toPop[1];
                    data[0][0] = (data[0][0] ** data[0][1]) * toPopNum;
                    data[0][1] = 1;
                }
                data[0][0] = data[0][0] % x;
            }
            if ((data[0][0] ** data[0][1]) % x != 1) return false;
        }
        return true;
    }
    genPrimeList(x, approach = 2) {
        let primeList = [];
        if (approach == 1) { // slow
            for (let i = 1; i <= x; i++) {
                if (this.isPrime(i)) primeList.push(i);
            }
        } else if (approach == 2) { // sieve of Eratosthenes, faster!
            if (x < 2) return primeList;
            let arr = Array(x + 1).fill(1);
            arr[0] = 0;
            arr[1] = 0;
            let maxLoop = parseInt(x ** 0.5) + 1
            for (let i = 2; i < maxLoop; i++) {
                if (arr[i] === 1) {
                    for (let j = i * i; j <= x; j += i) arr[j] = 0;
                }
            }
            for (let i = 0; i <= x; i++) {
                if (arr[i] === 1) primeList.push(i);
            }
        }
        return primeList;
    }
    pi(x) {
        if (x < 2) return 0;
        let arr = Array(x + 1).fill(1);
        arr[0] = 0;
        arr[1] = 0;
        let maxLoop = parseInt(x ** 0.5) + 1
        for (let i = 2; i < maxLoop; i++) {
            if (arr[i] === 1) {
                for (let j = i * i; j <= x; j += i) arr[j] = 0;
            }
        }
        return arr.reduce((a, b) => a + b);
    }
    largestPrime(x, approach = 3) {
        if (approach == 3) { // fast
            let i = x;
            while (i >= 2) {
                if (this.isPrime(i)) return i;
                if (i % 2 == 0) i--;
                else i -= 2;
            }
            return 2;
        } else { // slow
            const l = this.genPrimeList(x, approach);
            return l[l.length - 1];
        }
    }
    primeFactorization(x) { // fast
        let primeFactor = {};
        if (this.isPrime(x)) {
            primeFactor[x] = 1;
            return primeFactor;
        }
        let pList = this.genPrimeList(Math.ceil(x ** 0.5), 2);
        while (pList.length != 0) {
            let p = pList[pList.length - 1]; // start from the biggest prime
            if (x % p == 0) {
                x /= p;
                if (primeFactor[p]) primeFactor[p] += 1;
                else primeFactor[p] = 1;

                if (this.isPrime(x)) {
                    if (primeFactor[x]) primeFactor[x] += 1;
                    else primeFactor[x] = 1;

                    return primeFactor;
                } else if (x == 1) return primeFactor;
            } else pList.pop();
        }
    }
    primeFactorization2(x) { // slow
        let primeFactor = {};
        let upperBound = Math.ceil(x / 2);
        while (!this.isPrime(x) && x != 1) {
            let p = this.largestPrime(upperBound);
            if (x % p == 0) {
                x /= p;
                if (primeFactor[p]) primeFactor[p] += 1;
                else primeFactor[p] = 1;

                upperBound = Math.ceil(x / 2);
            } else upperBound = p - 1; // this makes this algorithm slow
        }
        if (x == 1) return primeFactor;
        if (primeFactor[x]) primeFactor[x] += 1;
        else primeFactor[x] = 1;

        return primeFactor;
    }
    gcd_handConcept(a, b) { // slow, base on the concept used when doing hand-calculating
        let fObj1 = this.primeFactorization(a);
        let fObj2 = this.primeFactorization(b);
        let gcd = 1;
        for (let eachP in fObj1) {
            if (parseInt(eachP) in fObj2) gcd *= parseInt(eachP) ** Math.min(fObj1[eachP], fObj2[eachP]);
        }
        return gcd;
    }
    gcd(a, b) { // fast
        let big = Math.max(a, b);
        let small = Math.min(a, b);
        if (big % small == 0) return small;
        const upperBound = Math.ceil(small / 2);
        for (let i = upperBound; i >= 1; i--) {
            if (small % i == 0 && big % i == 0) return i;
        }
    }
    gcd_euclidean(a, b, matrix) { // fast, only used for acquiring linear combination
        let big = Math.max(a, b);
        let small = Math.min(a, b);
        let r = big % small;
        matrix.push([
            [1, big],
            [-1 * Math.floor(big / small), small],
            r
        ]);
        if (r == 0) {
            return {
                "gcd": small,
                "data": matrix
            };
        }
        return this.gcd_euclidean(small, r, matrix);
    }
    linearCombination(smallNum, bigNum) {
        if (smallNum >= bigNum || smallNum < 0) {
            console.log("Invalid!");
            return;
        }
        let data = this.gcd_euclidean(smallNum, bigNum, [])["data"];
        for (let i = 1; i < data.length; i++) {
            let originalBigParam = data[i][0][0];
            let originalSmallParam = data[i][1][0];
            data[i][0][0] = originalSmallParam * data[i - 1][0][0];
            data[i][1][0] = originalSmallParam * data[i - 1][1][0];
            if (i - 2 < 0) {
                data[i][1][0] += originalBigParam;
            } else {
                data[i][0][0] += originalBigParam * data[i - 2][0][0];
                data[i][1][0] += originalBigParam * data[i - 2][1][0];
            }
        }
        let ans = [data[data.length - 2][1][0], data[data.length - 2][0][0]];
        while (ans[0] <= 0) { // force the param of the smallNum to be positive
            ans[0] += bigNum;
            ans[1] -= smallNum;
        }
        return ans;
    }
    eulerFunction(n) {
        // this function returns the number of positive integers that are less than n and relatively prime with n
        // if n is a prime
        if (this.isPrime(n)) return n - 1;
        // else if n is the product of two different primes
        let primeFactorResult = this.primeFactorization(n)
        let primeList = Object.keys(primeFactorResult);
        if (primeList.length == 2) {
            let allExponentAreOne = true;
            for (let each in primeFactorResult) {
                if (primeFactorResult[each] != 1) {
                    allExponentAreOne = false;
                    break;
                }
            }
            if (allExponentAreOne) return (primeList[0] - 1) * (primeList[1] - 1);
        }
        // else
        return this.relativePrimeList(n).length;
    }
    relativePrimeList(x) {
        let ans = [];
        for (let i = 1; i < x; i++) {
            if (this.gcd(i, x) == 1) {
                ans.push(i);
            }
        }
        return ans;
    }
}

let pt = new PrimeTool();