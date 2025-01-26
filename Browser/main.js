/* 
 * The aim of this script is to calculate the sum and the product of all the integers in an array. It has been tested in Brave and Chrome browsers running on 
   Intel(R) Core(TM) i5-8265U CPU @ 1.60GHz.

 * Performing the calculations in the main thread itself works fine. But for array sizes above 500K, the main thread gets blocked because the calculations
   get more and more CPU-intensive. Reach 1M elements, the page freezes, crashing the app after a while.

 * Dividing the array into smaller chunks, and doing partial calculations on separate Worker threads is the way to go. These threads work in the background
   concurrently, keeping the UI (on the main thread) responsive. The final output is the aggregate of the partial results that are sent back to the main thread.

 * After several trials, 30 chunks seem enough to handle upto 10 Million random numbers without any crash in less than 60 sec. The time taken is subject to the 
   hardware in play and the magnitude of numbers.
   
   -------
    NOTE:
   -------
    * Trying to copy Millions of numbers at once in the input field can freeze the browser.
    * For an efficient test, uncomment the fetch operation in the "createChunks" function to read a large dataset.
    * When using the provided test, there is no need for any input from the client, as the pertinent variable gets mutated anyways.
*/

document.querySelectorAll(".demo-btn").forEach(btn => {
    btn.onclick = () => console.log("I got Clicked.");
});

const threads = 30;

const btn = document.querySelector('button');
const loadingTxt = document.getElementById('loading-txt');
const resultDiv = document.getElementById('result');

let
    finalSum = BigInt(0),
    finalProduct = BigInt(1),
    jobsCounter = 0;

function showResults(sum, product) {
    const paraSum = document.getElementById('sum');
    const paraProd = document.getElementById('prod');

    btn.disabled = false;
    btn.style.cursor = 'pointer';
    loadingTxt.style.display = 'none';
    resultDiv.style.display = 'block';

    finalSum = BigInt(0);
    finalProduct = BigInt(1);
    jobsCounter = 0;

    paraSum.innerHTML = `<strong>Sum: </strong>${sum}`;
    return paraProd.innerHTML = `<strong>Product: </strong>${product}`;
}

/*
 * The second parameter is passed true when only one Worker is needed.
 * By default, it keep tracks of the completed jobs when multiple Workers are in motion.
*/
function initWorker(nums, onlyOneThread = false) {
    const worker = new Worker('worker.js');

    worker.onmessage = (event) => {
        const { sum, prod } = event.data;
        finalSum += sum;
        finalProduct *= prod;

        if (onlyOneThread) {
            showResults(finalSum, finalProduct);
            return worker.terminate();
        }
        if (++jobsCounter == threads) showResults(finalSum, finalProduct);
        return worker.terminate();
    }
    worker.onerror = (event) => {
        console.error(event.message);
        loadingTxt.textContent = 'Something Went Wrong!';
        return worker.terminate();
    }
    return worker.postMessage(nums);
}

async function createChunks({ value: data }) {
    try {
        let nums = data.split(",");

        // Read 10 Million numbers
        // const response = await fetch("data.txt");
        // nums = (await response.text()).split(",");

        if (Worker) {
            if (nums.length < threads) return initWorker(nums, true);

            const chunkSize = Math.round(nums.length / threads);
            let start = 0, end = chunkSize;

            for (let i = 1; i <= threads; i++) {
                const chunk = (i != threads) ? nums.slice(start, end) : nums.slice(start);
                initWorker(chunk);
                start = end;
                end += chunkSize;
            }
        } else console.log('Your Browser does not support Web Worker!');
    } catch (error) {
        console.error(error);
    }
}

function submitHandler(event) {
    event.preventDefault();

    const { nums } = event.target.elements;

    btn.disabled = true;
    btn.style.cursor = 'not-allowed';
    loadingTxt.style.display = 'block';
    resultDiv.style.display = 'none';

    // Render any DOM changes before the Workers are set in motion
    return setTimeout(() => createChunks(nums), 0);
}