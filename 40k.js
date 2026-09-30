const diceCount = document.querySelector("#diceCount");
const toHitInput = document.querySelector("#toHit");
const hitCrit = document.querySelector("#hitCrit");
const toWoundInput = document.querySelector("#toWound");
const woundCrit = document.querySelector("#woundCrit");
const toSvInput = document.querySelector("#toSv");
const lethalInput = document.querySelector("#let");
const devInput = document.querySelector("#dev");
const susInput = document.querySelector("#sus");
const fortygraphs = document.querySelector("#fortygraphs");


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

function rollD6(count) {
    const values = [];
    for (let i = 0; i < count; i++) {
        values.push(Math.floor(Math.random() * 6) + 1);
    }
    return values;
}

function collateData(data){
    const counted = {};
    for (const num of data) {
        counted[num] = counted[num] ? counted[num] + 1 : 1;
    }
    //create sums count graph
    const keys = Object.keys(counted);
    const result = [];
    for (let i = 0; i < keys.length; i++) {
        result.push([parseInt(keys[i]), (parseInt(counted[keys[i]]) / data.length) * 100]);
    }

    return result;
}

function parseResults(results){
    //Get counts of everything and jam em into the object,
    const data = {
        hit:[],
        wound:[],
        save:[],
        damage:[]
    };
    let allHits = [];
    let allWounds = [];
    let allSaves = [];
    let allDamage = [];

    for (let i = 0; i < results.length; i++) {
        allHits = allHits.concat(results[i].hit);    
        allWounds = allWounds.concat(results[i].wound);
        allSaves = allSaves.concat(results[i].save);
        allDamage.push(results[i].damage);
    }

    data.hit = collateData(allHits);
    data.wound = collateData(allWounds);
    data.save = collateData(allSaves);
    data.damage = collateData(allDamage);

    createGraphs(data);
}


function createGraphs(data){
    fortygraphs.innerHTML = '';

    const hitgraph = document.createElement('div');
    fortygraphs.appendChild(hitgraph);
    let hg = new Dygraph(hitgraph, data.hit, {
        title: `Hit roll`,
        xlabel: "Value [#]",
        ylabel: 'Percentage [%]',
        axisLineColor: '#c9d1d9',
        axes: { y: { axisLabelWidth: 72 } },
        plotter: barChartPlotter
    });

    fortygraphs.appendChild(document.createElement('br'));

    const woundgraph = document.createElement('div');
    fortygraphs.appendChild(woundgraph);
    let wg = new Dygraph(woundgraph, data.wound, {
        title: `Wound roll`,
        xlabel: "Value [#]",
        ylabel: 'Percentage [%]',
        axisLineColor: '#c9d1d9',
        axes: { y: { axisLabelWidth: 72 } },
        plotter: barChartPlotter,
    });

    fortygraphs.appendChild(document.createElement('br'));

    const savegraph = document.createElement('div');
    fortygraphs.appendChild(savegraph);
    let sg = new Dygraph(savegraph, data.save, {
        title: `Save roll`,
        xlabel: "Value [#]",
        ylabel: 'Percentage [%]',
        axisLineColor: '#c9d1d9',
        axes: { y: { axisLabelWidth: 72 } },
        plotter: barChartPlotter
    });

    fortygraphs.appendChild(document.createElement('br'));

    const damagegraph = document.createElement('div');
    fortygraphs.appendChild(damagegraph);
    let dg = new Dygraph(damagegraph, data.damage, {
        title: `Damage instances`,
        xlabel: "Value [#]",
        ylabel: 'Percentage [%]',
        axisLineColor: '#c9d1d9',
        axes: { y: { axisLabelWidth: 72 } },
        plotter: barChartPlotter
    });
}




document.querySelector("#clearbtn").addEventListener("click", () => {
    diceCount.value = 10;
    toHitInput.value = 4;
    toWoundInput.value = 4;
    toSvInput.value = 4;
    hitCrit.value = 6;
    woundCrit.value = 6;
    lethalInput.checked = false;
    devInput.checked = false;
    susInput.value = 0;
});

var RUNNING = false;
const runbtn = document.querySelector("#mathhammer");
runbtn.addEventListener("click", () => {
    if(RUNNING){return;}
    RUNNING = true
    const results = performRolls();
    parseResults(results);
    RUNNING = false;
})

function performRolls(){
    const results = [];

    const count = parseInt(diceCount.value);
    const toHit = parseInt(toHitInput.value);
    const toCHit = parseInt(hitCrit.value);
    const toWound = parseInt(toWoundInput.value);
    const toCWound = parseInt(woundCrit.value);
    const toSave = parseInt(toSvInput.value)
    const lethal = lethalInput.checked;
    const devastating = devInput.checked;
    const sustained = parseInt(susInput.value);

    for (let i = 0; i < 10000; i++) {
        results.push(performSequence(count,toHit,toCHit,toWound,toCWound,toSave,lethal,devastating,sustained));
    }

    return results;
}

function performSequence(count,toHit,toCHit,toWound,toCWound,toSave,lethal,devastating,sustained) {
    var critHits = 0;
    var hits = [];
    var critWounds = 0;
    var wounds = [];
    var saveRoll = [];
    var damage = 0;

    var rawHitResults = [];
    var rawWoundResults = [];
    var rawSaveResults = [];

    //Start rolling
    rawHitResults = rollD6(count);
    critHits = rawHitResults.filter(x => x == toCHit).length;
    hits = rawHitResults.filter((value)=> value >= toHit);
    //Check sustains and lethals
    var diceToWound = 0;
    var diceToSave = 0;
    if(sustained > 0){diceToWound += (critHits * sustained);}
    if(lethal){
        diceToSave += critHits;
        //Filter out crits
        for(let i = toCHit; i<7; i++){
            hits = hits.filter(x => x !== i);
        }
    }
    diceToWound += hits.length;

    //Roll to wound
    rawWoundResults = rollD6(diceToWound);
    critWounds = rawWoundResults.filter(x => x == toCWound).length;
    wounds = rawWoundResults.filter((value)=> value >= toWound);
    //Check devastating wounds
    if(devastating){
        damage += critWounds;
        //Filter out wounds
        for(let i = toCWound; i<7; i++){
            wounds = wounds.filter(x => x !== i);
        }
    }
    diceToSave += wounds.length;
    //Roll to save
    rawSaveResults = rollD6(diceToSave);
    saveRoll = rawSaveResults.filter((value)=> value < toSave);
    damage += saveRoll.length;

    return {hit:rawHitResults, wound: rawWoundResults, save:rawSaveResults, damage:damage}
}