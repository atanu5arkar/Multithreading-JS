import { Worker } from "worker_threads";
import { readFileSync, writeFileSync } from "fs";

const threads = 30;

let
    finalSum = BigInt(0),
    finalProduct = BigInt(1),
    jobsCounter = 0;

function writeResults(sum, product) {
    writeFileSync("results.txt", `Sum:\n${sum}\n\nProduct:\n${product}`);
    return console.log("\nCalculation Completed.");
}

function initWorker(nums, onlyOneThread = false) {
    const worker = new Worker("./worker.mjs");

    worker.on("message", (data) => {
        const { sum, prod } = data;
        
        finalSum += sum;
        finalProduct *= prod;

        if (onlyOneThread) {
            writeResults(finalSum, finalProduct);
            return worker.terminate();
        }
        if (++jobsCounter == threads) writeResults(finalSum, finalProduct);
        return worker.terminate();
    });

    worker.on("error", (err) => {
        console.error(err);
        return worker.terminate();
    });
    return worker.postMessage(nums);
}

function createChunks() {
    let nums = readFileSync("../Browser/data.txt", { encoding: "utf-8" });
    nums = nums.split(",");

    // No need for multiple Workers for less numbers
    if (nums.length < threads) return initWorker(nums, true);

    const chunkSize = Math.round(nums.length / threads);
    let start = 0, end = chunkSize;

    for (let i = 1; i <= threads; i++) {
        const chunk = (i != threads) ? nums.slice(start, end) : nums.slice(start);
        initWorker(chunk);
        start = end;
        end += chunkSize;
    }

    // Some dummy code to show that the Main thread is free
    console.log("Hello, World.");
    return console.log("Workers are hitting hard!");
}

createChunks();