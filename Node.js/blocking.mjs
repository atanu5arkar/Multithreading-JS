import { readFileSync } from "fs";

function calculate() {
    const nums = readFileSync("../Browser/data.txt", { encoding: "utf-8" }).split(",");

    const result = nums.reduce((acc, num) => {
        acc.sum += BigInt(num);
        acc.prod *= BigInt(num);
        return acc;
    }, { sum: BigInt(0), prod: BigInt(1) });

    console.log(result);

    // Other tasks
    return console.log("Hello there");
}

calculate();