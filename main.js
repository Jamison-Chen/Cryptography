import {
    PrimeTool
} from "./prime.js";
import {
    CommonTool
} from "./common.js";
import {
    RSA
} from "./rsa.js";
import {
    Dlog
} from "./discreteLog.js";
let ct = new CommonTool();
let pt = new PrimeTool();

function runRSA(bitLength) {
    let rsa = new RSA();
    const m = "If you can read this message, it means that you've succesfully implmented the RSA algorithm!";
    console.log("message:", m);
    // Due to the issue of computational precision,
    // 25 is the biggest number of bits that won't cause wrong results when converting to p, q to decimal,
    // and calculating p*q.
    // However, a RSA scheme is believed to be secure only when n > 1024 nowadays.
    const primePair = ct.randomPrimePair(bitLength);
    const p = primePair[0];
    const q = primePair[1];
    // console.log(p, q);
    // console.log(`φ(${p}) =`, pt.eulerFunction(p));
    // console.log(`φ(${q}) =`, pt.eulerFunction(q));
    // console.log(`φ(${p*q}) =`, pt.eulerFunction(p * q));
    const keyPair = rsa.genKeyPair(p, q);
    console.log(keyPair.publicKey);

    const mList = ct.string2ascii(m);
    const cList = rsa.encrypt(mList, keyPair.publicKey);
    const c = ct.ascii2string(cList, true);
    console.log("crypto:", c);

    const dListTrue = rsa.decrypt(cList, keyPair.privateKey);
    console.log("answer:", ct.ascii2string(dListTrue));
    const t0 = new Date().getTime();
    const dListFound = rsa.decrypt(cList, rsa.bruteForceFindKey(keyPair.publicKey));
    console.log("guess:", ct.ascii2string(dListFound));
    const t1 = new Date().getTime();
    console.log({
        "bitLength": bitLength,
        "timeConsumed": `${(t1-t0)/1000}s`
    });
}

function run2() {
    for (let i = 2; i <= 3000; i++) {
        // you will find out that it's hard to find a euler function's value that is a prime
        if (pt.isPrime(pt.eulerFunction(i))) console.log(i, pt.eulerFunction(i));
    }
}

function run3() {
    let dlog = new Dlog();
    // when p is large enough, it would take some time to generate zpStar
    // but it's still quite fast to find the smallest generator
    let p = ct.randomPrimePair(16)[0];
    console.log(p);
    let zpStar = new Set(pt.relativePrimeList(p));
    console.log(zpStar.size);
    let g = dlog.findSmallestGenerator(zpStar, p);
    console.log(g);
}

function run4() {
    let dlog = new Dlog();
    const q = ct.randomPrimePair(14)[0];
    console.log(q)
    let g = dlog.genPrimeOrderSubgroupOfZpStar(q);
    console.log(g.size); // this number should equals q
    let pAndT = dlog.genPrimeEqualTQplusOne(q);
    console.log(pAndT);
    // the for loop below should only print out 1 by definition
    for (let each of g) {
        if (!dlog.isGenerator(g, each, pAndT.p)) console.log(each);
    }
}

function run5() {
    let dlog = new Dlog();
    // choose a bigger prime p and a smaller prime q
    // s.t. p = t * q + 1
    let q = ct.randomPrimePair(8)[0];
    while (q < 128) {
        q = ct.randomPrimePair(8)[0];
    }
    console.log("q", q);
    let p = 0;
    while (p <= q || ct.modularExp(p, 1, q) != 1) {
        p = ct.randomPrimePair(26)[0];
    }
    console.log("p", p);

    const publicInfo = dlog.genPublicInfo(p, q);
    console.log("g", publicInfo.g);

    const secretNumA = Math.floor(Math.random() * (q - 1)) + 1;
    const secretNumB = Math.floor(Math.random() * (q - 1)) + 1;
    console.log("a", secretNumA);
    console.log("b", secretNumB);

    const exchangedInfo = dlog.genExchangedInfo(secretNumA, secretNumB);
    const privateKey = dlog.genSharedPrivateKey();
    console.log("key", privateKey);

    // try to break
    const guessedKey = dlog.bruteForceFindKey(publicInfo, exchangedInfo);
    console.log("guess", guessedKey);
}

function run6() {
    const m = "If you can read this message, it means that you've succesfully implmented the Dlog algorithm!";
    console.log("message:", m);
}

for (let i of[18, 19, 20, 21, 22, 23, 24, 25]) {
    runRSA(i);
}