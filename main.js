import { parseSyntax, run } from "./diceSyntaxParser.js";

const diceInput = document.querySelector("#diceInput");
const calculateButton = document.querySelector("#calculateButton");
const averages = document.querySelector("#avgs");
const medians = document.querySelector("#meds");

function parseAverages(r) {
    const avgs = []
    const sums = [];

    //The main array
    for (let i = 0; i < r.length; i++) {
        //0 = dice rolls, 1 = sums
        const row = r[i][0];
        sums.push(r[i][1]);
        avgs.push([]);
        //One throw
        for (let j = 0; j < row.length; j++) {
            const roll = row[j];
            //sum up the dice values
            let rollsum = 0;
            for (let k = 0; k < roll.length; k++) {
                rollsum += roll[k];
            }
            //save average
            let average = rollsum / roll.length;
            avgs[i].push(average);
        }
    }
    //Calculate average of sums
    let sumAvg = sums.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
    );
    sumAvg /= r.length;
    //now we have thousand row of averages
    //initialize array for the final results
    const finalAvgs = new Array(avgs[0].length).fill(0);

    //averages of averages
    //Go through the list of every iterations averages
    for (let i = 0; i < avgs.length; i++) {
        //Pick an iteration
        const a = avgs[i];
        for (let j = 0; j < a.length; j++) {
            finalAvgs[j] = finalAvgs[j] + a[j];
        }
    }
    //average the averages
    for (let i = 0; i < finalAvgs.length; i++) {
        finalAvgs[i] = finalAvgs[i] / avgs.length;
    }

    averages.textContent = `Dice roll averages: ${finalAvgs} Sum average: ${sumAvg}`;

    //sum median
    const sumMedian = math.median(sums);
    medians.textContent = `Sum median: ${sumMedian}`;
}

calculateButton.addEventListener("click", () => {
    const seq = parseSyntax(diceInput.value);
    const results = run(seq, 1000)
    parseAverages(results);
});