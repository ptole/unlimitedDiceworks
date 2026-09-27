/**
 * Get function for drop highest dice roll
 * @param {Array} token of a dice expression 
 * @returns Function for drop highest dice roll
 */
function getDH(token) {
    const splt = token.split("d");

    const dlsplit = splt[2];

    const count = parseInt(splt[0]);
    const sides = parseInt(splt[1]);
    var dcount = 1;
    if (dlsplit.length > 1) {
        dcount = parseInt(dlsplit[1]);
    }
    return () => { return DH(count, sides, dcount); }
}

/**
 * Get function for drop lowest dice roll
 * @param {Array} token of a dice expression 
 * @returns Function for drop lowest dice roll
 */
function getDL(token) {
    const splt = token.split("d");

    const dlsplit = splt[2];

    const count = parseInt(splt[0]);
    const sides = parseInt(splt[1]);
    var dcount = 1;
    if (dlsplit.length > 1) {
        dcount = parseInt(dlsplit[1]);
    }

    return () => { return DL(count, sides, dcount); }
}

/**
 * Get function for keep highest dice roll
 * @param {Array} token of a dice expression 
 * @returns Function for keep highest dice roll
 */
function getKH(token) {
    const splt = token.split("d");
    const khsplit = splt[1].split("kh");
    const count = parseInt(splt[0]);
    const sides = parseInt(khsplit[0]);
    var kcount = 1;
    if (khsplit[1].length > 0) {
        kcount = parseInt(khsplit[1]);
    }
    return () => { return KH(count, sides, kcount); }
}

/**
 * Get function for exploding dice roll
 * @param {Array} token of a dice expression 
 * @returns Function for exploding dice roll
 */
function getExploding(token) {
    const splt = token.split("d");
    const count = parseInt(splt[0]);
    const sides = parseInt(splt[1].substring(-1));
    return () => { return explode(count, sides); }
}

/**
 * Get function for normal dice roll
 * @param {Array} token of a dice expression 
 * @returns Function for normal dice roll
 */
function getRoll(token) {
    const splt = token.split("d");
    const count = parseInt(splt[0]);
    const sides = parseInt(splt[1]);
    return () => { return roll(count, sides); }
}

/**
 * Roll dice, but keep only N highest
 * @param {Integer} count 
 * @param {Integer} sides 
 * @param {Integer} keep count of how many results are kept
 * @returns array of the type of value (r = roll) and dice values
 */
function KH(count, sides, keep) {
    const vals = roll(count, sides);
    //Keep highest N results, drop rest
    vals[1] = vals[1].splice(0, vals.length - keep - 1);
    return vals;
}

/**
 * Roll dice, but discard N highest
 * @param {Integer} count 
 * @param {Integer} sides 
 * @param {Integer} drop count of how many highest results will be discarded
 * @returns array of the type of value (r = roll) and dice values
 */
function DH(count, sides, drop) {
    let vals = roll(count, sides);
    vals[1] = vals[1].reverse();
    //Drop highest N results
    vals[1] = vals[1].splice(0, drop).reverse();
    return vals;
}

/**
 * Roll dice, but discard N lowest
 * @param {Integer} count 
 * @param {Integer} sides 
 * @param {Integer} drop count of how many smallest results will be discarded
 * @returns array of the type of value (r = roll) and dice values
 */
function DL(count, sides, drop) {
    const vals = roll(count, sides);
    //Drop lowest N results
    vals[1] = vals[1].splice(0, drop);
    return vals;
}

/**
 * LET IT RIDE with explosions.
 * @param {Integer} count 
 * @param {Integer} sides 
 * @returns array of the type of value (r = roll) and dice values
 */
function explode(count, sides) {
    const values = [];
    for (let i = 0; i < count; i++) {
        let val = 0;
        let stop = false;
        while (!stop) {
            let rslt = Math.floor(Math.random() * sides) + 1;
            //if max roll, roll again
            if (rslt != sides) { stop = true; }
            val += rslt;
        }
        values.push(val);
    }
    return ["r", values];
}

/**
 * LET IT RIDE
 * @param {Integer} count 
 * @param {Integer} sides 
 * @returns array of the type of value (r = roll) and dice values
 */
function roll(count, sides) {
    const values = [];
    for (let i = 0; i < count; i++) {
        values.push(Math.floor(Math.random() * sides) + 1);
    }
    return ["r", values];
}

/**
 * Split user input to tokens and operations
 * @param {String} str user inputted dice syntax 
 * @returns parsed dice expressions and basic addition and substraction operators
 */
function _split(str) {
    const ops = [];
    for (let i = 0; i < str.length; i++) {
        if (str[i] == '+' || str[i] == '-') {
            ops.push(str[i]);
        }
    }
    //Strip away + and - signs
    const tokens = str.split(/[\+-]/);

    return [tokens, ops];
}

const LUT = {
    "dl": getDL,
    "dh": getDH,
    "kh": getKH,
    "!": getExploding,
    "d": getRoll
}

function _parse(arr) {

    const sequence = [];
    const LUTKeys = Object.keys(LUT); //string keys from the lookup table for ease of use

    for (let i = 0; i < arr.length; i++) {
        let found = false;
        for (let j = 0; j < LUTKeys.length; j++) {
            let k = LUTKeys[j];
            //Check if the token has amatch from LUT i.e. is not a static number
            if (arr[i].includes(k)) {
                //Add corresponding function to the sequence
                sequence.push(LUT[k](arr[i]));
                found = true;
                break;
            }

        }
        //if there's noting from LUT, it's a static number
        if (!found) {
            sequence.push(() => { const stat = parseInt(arr[i]); return ["s", stat]; });
        }
    }

    return sequence;
}

/**
 * Parse the dice syntax
 * @param {String} str user inputted string 
 * @returns array of sequences and operations
 */
export function parseSyntax(str) {
    const splt = _split(str);
    const sequence = _parse(splt[0]);
    const ops = splt[1];

    return [sequence, ops];
}

/**
 * Runs the sequence
 * @param {Array} seqops output of parseSyntax 
 * @returns array of dice results and total sum 
 */
function runSequence(seqops) {
    const sequence = seqops[0];
    const ops = seqops[1];

    let results = [];
    let sum = 0;

    //Assume if there's gonna be a add/sub it's prolly gonna be a addition
    let curOP = '+';

    for (let i = 0; i < sequence.length; i++) {
        //Pick first 
        const s = sequence[i]();
        //if the type of the sequence is a roll, add it to the dice results
        if (s[0] === 'r') {
            results.push(s[1]);

            for (let j = 0; j < s[1].length; j++) {
                //add or subtract from the sum as per what's the next operator
                if (curOP == '+') {
                    sum += parseInt(s[1][i]);
                }
                else {
                    sum -= parseInt(s[1][i]);
                }
            }
        } else {
            //Add static results to the sum
            if (curOP == '+') {
                sum += parseInt(s[1]);
            }
            else {
                sum -= parseInt(s[1]);
            }
        }

        //Take the next add/sub from the list
        if (ops.length > 0) { curOP = ops.shift(); }
    }

    return [results, sum];
}

/**
 * Run the dice sequence N times
 * @param {Array} seqops output of parseSyntax 
 * @param {Integer} count amount of repetitions  
 * @returns array of arrays of dice values for every expression and total sums
 */
export function run(seqops, count) {
    const results = []
    for (let i = 0; i < count; i++) {
        results.push(runSequence(seqops));
    }
    return results;
}