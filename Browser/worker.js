
onmessage = (event) => {
    const nums = event.data;

    const result = nums.reduce((acc, num) => {
        acc.sum += BigInt(num);
        acc.prod *= BigInt(num);
        return acc;
    }, { sum: BigInt(0), prod: BigInt(1) });

    return postMessage(result);
}