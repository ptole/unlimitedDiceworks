import { parseSyntax, run } from "./diceSyntaxParser.js";

const diceInput = document.querySelector("#diceInput");
const calculateButton = document.querySelector("#calculateButton");
const averages = document.querySelector("#avgs");
const medians = document.querySelector("#meds");

function parseAverages(r) {
    const avgs = []
    //The main array
    for (let i = 0; i < r.length; i++) {
        //0 = dice rolls, 1 = sums
        const row = r[i][0];
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
            let average = rollsum/roll.length;
            avgs[i].push(average);
        }
    }
    //now we have thousand row of averages
    const finalAvgs = [];
    //averages of averages
    for(let i = 0; i < avgs.length; i++){
         const a = avgs[i];
        for(let j = 0; j < a.length; j++ ){

        }    
    }
}

calculateButton.addEventListener("click", () => {
    const seq = parseSyntax(diceInput.value);
    const results = run(seq, 1000)
});