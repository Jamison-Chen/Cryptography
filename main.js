import {
    RSA
} from "./rsa.js";
import {
    PrimeTool
} from "./prime.js";
let rsa = new RSA();
let pt = new PrimeTool();

let m = "If you can read this message, it means that you've succesfully implmented the RSA algorithm!";
console.log("message:", m);

// Due to the issue of computational precision,
// 13 is the biggest number of bits that won't cause wrong results when decrypting.
// However, a RSA scheme is believed to be secure only when n > 1024 nowadays.
let primePair = rsa.randomPrimePair(13);
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

// console.log(pt.relativePrimeList(100).length, pt.eulerFunction(100));