import {
    RSA
} from "./rsa.js";
import {
    PrimeTool
} from "./prime.js";
import {
    Dlog
} from "./discreteLog.js";
let rsa = new RSA();
let pt = new PrimeTool();
let dlog = new Dlog();

function run1() {
    let m = "If you can read this message, it means that you've succesfully implmented the RSA algorithm!";
    console.log("message:", m);
    // Due to the issue of computational precision,
    // 25 is the biggest number of bits that won't cause wrong results when converting to p, q to decimal,
    // and calculating p*q.
    // However, a RSA scheme is believed to be secure only when n > 1024 nowadays.
    let primePair = rsa.randomPrimePair(22);
    let p = primePair[0];
    let q = primePair[1];
    // console.log(p, q);
    // console.log(`φ(${p}) =`, pt.eulerFunction(p));
    // console.log(`φ(${q}) =`, pt.eulerFunction(q));
    // console.log(`φ(${p*q}) =`, pt.eulerFunction(p * q));
    let keyPair = rsa.genRSAKeyPair(p, q);
    console.log(keyPair.publicKey);

    let mList = rsa.string2asciiCodeList(m);
    let cList = rsa.encrypt(mList, keyPair.publicKey);
    let c = rsa.asciiCodeList2string(cList, true);
    console.log("crypto:", c);

    let dListTrue = rsa.decrypt(cList, keyPair.privateKey);
    console.log("answer:", rsa.asciiCodeList2string(dListTrue));

    let dListFound = rsa.decrypt(cList, rsa.bruteForceFindKey(keyPair.publicKey));
    console.log("guess:", rsa.asciiCodeList2string(dListFound));
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
    let p = rsa.randomPrimePair(16)[0];
    console.log(p);
    let zpStar = new Set(pt.relativePrimeList(p));
    console.log(zpStar.size);
    let g = dlog.findSmallestGenerator(zpStar, p);
    console.log(g);
}

function run4() {
    const q = rsa.randomPrimePair(14)[0];
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
    const q = rsa.randomPrimePair(20)[0];
    const group = dlog.genPrimeOrderSubgroupOfZpStar(q);
    const pAndT = dlog.genPrimeEqualTQplusOne(q);
    console.log(pAndT);

    // the 0th element in the groupArray below must be the identity,
    // which isn't a generator,
    // so we choose the 1st one instead.
    let g = Array.from(group)[1];
    let h = dlog.getRandomElemInGroup(group);
    console.log({
        "g": g,
        "h": h
    });

    let ans = dlog.logBaseGofH(group, g, h);
    console.log(ans);
}

run5();