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
let rsa = new RSA();
let dlog = new Dlog();

function run1() {
    let m = "If you can read this message, it means that you've succesfully implmented the RSA algorithm!";
    console.log("message:", m);
    // Due to the issue of computational precision,
    // 25 is the biggest number of bits that won't cause wrong results when converting to p, q to decimal,
    // and calculating p*q.
    // However, a RSA scheme is believed to be secure only when n > 1024 nowadays.
    let primePair = ct.randomPrimePair(22);
    let p = primePair[0];
    let q = primePair[1];
    // console.log(p, q);
    // console.log(`φ(${p}) =`, pt.eulerFunction(p));
    // console.log(`φ(${q}) =`, pt.eulerFunction(q));
    // console.log(`φ(${p*q}) =`, pt.eulerFunction(p * q));
    let keyPair = rsa.genKeyPair(p, q);
    console.log(keyPair.publicKey);

    let mList = ct.string2asciiCodeList(m);
    let cList = rsa.encrypt(mList, keyPair.publicKey);
    let c = ct.asciiCodeList2string(cList, true);
    console.log("crypto:", c);

    let dListTrue = rsa.decrypt(cList, keyPair.privateKey);
    console.log("answer:", ct.asciiCodeList2string(dListTrue));

    let dListFound = rsa.decrypt(cList, rsa.bruteForceFindKey(keyPair.publicKey));
    console.log("guess:", ct.asciiCodeList2string(dListFound));
}

function run2() {
    for (let i = 2; i <= 3000; i++) {
        // you will find out that it's hard to find a euler function's value that is a prime
        if (pt.isPrime(pt.eulerFunction(i))) console.log(i, pt.eulerFunction(i));
    }
}

function run3() {
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
    let m = "If you can read this message, it means that you've succesfully implmented the Dlog algorithm!";
    console.log("message:", m);
    // choose a bigger prime p and a smaller prime q
    // s.t. p = t * q + 1
    let p = 0;
    let q = ct.randomPrimePair(8)[0];
    while (q < 128) {
        q = ct.randomPrimePair(8)[0];
    }
    console.log("q", q);
    while (p <= q || ct.modularExp(p, 1, q) != 1) {
        p = ct.randomPrimePair(24)[0];
    }
    console.log("p", p);
    let keyPair = dlog.genKeyPair(p, q);
    console.log(keyPair.publicKey.g, keyPair.publicKey.h);

    // the way of encrypt and decrypt might be wrong
    let mList = ct.string2asciiCodeList(m);
    let cList = dlog.encrypt(mList, keyPair.publicKey, p);
    let c = ct.asciiCodeList2string(cList, true);
    console.log("crypto:", c);

    let dListTrue = dlog.decrypt(cList, keyPair.privateKey, keyPair.publicKey);
    console.log("answer:", ct.asciiCodeList2string(dListTrue));

    let dListFound = dlog.decrypt(cList, dlog.logBaseGofH(keyPair.publicKey), keyPair.publicKey);
    console.log("guess:", ct.asciiCodeList2string(dListFound));

    // console.log(keyPair.privateKey);
    // let ans = dlog.logBaseGofH(keyPair.publicKey);
    // console.log(ans);
}

run5();