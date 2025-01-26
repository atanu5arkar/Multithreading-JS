import { parentPort } from "worker_threads";

parentPort.on("message", (nums) => {
    const result = nums.reduce((acc, num) => {
        acc.sum += BigInt(num);
        acc.prod *= BigInt(num);
        return acc;
    }, { sum: BigInt(0), prod: BigInt(1) });

    return parentPort.postMessage(result);
});