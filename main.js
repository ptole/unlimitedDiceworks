import { parseSyntax, run } from "./diceSyntaxParser.js";

const diceInput = document.querySelector("#diceInput");
const calculateButton = document.querySelector("#calculateButton");
const averages = document.querySelector("#avgs");
const medians = document.querySelector("#meds");
const graphdiv = document.querySelector("#graphdiv");

const mainScene = document.querySelector("#general");
const fortyScene = document.querySelector("#fortyk");

function parseResults(r) {
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

    createGraphs(r, sums);
}

function barChartPlotter(e) {
    var ctx = e.drawingContext;
    var points = e.points;
    var y_bottom = e.dygraph.toDomYCoord(0);

    ctx.fillStyle = e.color;

    // Find the minimum separation between x-values.
    // This determines the bar width.
    var min_sep = Infinity;
    for (var i = 1; i < points.length; i++) {
        var sep = points[i].canvasx - points[i - 1].canvasx;
        if (sep < min_sep) min_sep = sep;
    }
    var bar_width = Math.floor(2.0 / 3 * min_sep);

    // Do the actual plotting.
    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var center_x = p.canvasx;

        ctx.fillRect(center_x - bar_width / 2, p.canvasy,
            bar_width, y_bottom - p.canvasy);

        ctx.strokeRect(center_x - bar_width / 2, p.canvasy,
            bar_width, y_bottom - p.canvasy);
    }
}

function createGraphs(r, sums) {
    graphdiv.innerHTML = "";

    //count sums
    const countedsums = {};
    for (const num of sums) {
        countedsums[num] = countedsums[num] ? countedsums[num] + 1 : 1;
    }
    //create sums count graph
    const sumkeys = Object.keys(countedsums);
    const sumdata = [];
    for (let i = 0; i < sumkeys.length; i++) {
        sumdata.push([parseInt(sumkeys[i]), (parseInt(countedsums[sumkeys[i]]) / ITERATIONS) * 100]);
    }

    const sumel = document.createElement("div");
    graphdiv.appendChild(sumel);
    let g = new Dygraph(sumel, sumdata, {
        title: `Results`,
        xlabel: "Value [#]",
        ylabel: 'Percentage [%]',
        axisLineColor: '#c9d1d9',
        axes: { y: { axisLabelWidth: 72 } },
        plotter: barChartPlotter
    });

    graphdiv.appendChild(document.createElement('br'));


    //Initialize an array with empty arrays corresponding to how many different rolls the user inputted
    const collated = new Array(r[0][0].length).fill([]);
    //collate all rolls
    for (let i = 0; i < r.length; i++) {
        for (let j = 0; j < r[0][0].length; j++) {
            collated[j] = collated[j].concat(r[i][0][j]);
        }
    }

    //Calculate counts of results
    const counts = {};
    for (let i = 0; i < collated.length; i++) {
        counts[i] = {};
        for (const num of collated[i]) {
            counts[i][num] = counts[i][num] ? counts[i][num] + 1 : 1;
        }
    }


    //Create dice value graphs
    for (let i = 0; i < collated.length; i++) {
        const data = [];
        const keys = Object.keys(counts[i]);
        const totalval = [];
        //Calculate total value of the 10k dice rolls to get a perentage
        for (let j = 0; j < keys.length; j++) {
            totalval.push(parseInt(counts[i][keys[j]]));
        }
        const divider = totalval.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        );

        //Parse counts to dygraphs format
        for (let j = 0; j < keys.length; j++) {
            data.push([parseInt(keys[j]), (parseInt(counts[i][keys[j]])/divider)*100 ]);
        }

        const e = document.createElement("div");
        graphdiv.appendChild(e);
        let g = new Dygraph(e, data, {
            title: `Dice values - Roll ${i + 1}`,
            xlabel: "Value [#]",
            ylabel: 'Percentage [%]',
            axisLineColor: '#c9d1d9',
            axes: { y: { axisLabelWidth: 72 } },
            plotter: barChartPlotter
        });

        graphdiv.appendChild(document.createElement('br'));
    }
}

const ITERATIONS = 10000;
var CURRENTSCENE = "GENERAL";

calculateButton.addEventListener("click", () => {
    const seq = parseSyntax(diceInput.value);
    const results = run(seq, ITERATIONS);
    parseResults(results);
});

document.querySelector("#swapbtn").addEventListener("click",(e)=>{
    changeScene();
});

function changeScene(){
    if(CURRENTSCENE == "GENERAL"){
        mainScene.style.display = "none";
        fortyScene.style.display = "block";
        CURRENTSCENE = "40K";
    }else{
        mainScene.style.display = "block";
        fortyScene.style.display = "none";
        CURRENTSCENE = "GENERAL";
    }

}