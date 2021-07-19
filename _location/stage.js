// coordinate inputs
let inputN = 469844.831;
let inputE = 1295903.331;
let inputZ = 199.347;

// create empty n,e differences, distances arrays for later
let differences = new Array();
let distances = new Array();

// calculate northing & easting distances and pass them into an array along with the associated nodeID.
for (i = 0; i < pano.getNodeIds().length; i = i + 1) {

    let destN = Number(pano.getNodeUserdata(pano.getNodeIds()[i]).copyright); // store node northing in an easy-to-read variable
    let destE = Number(pano.getNodeUserdata(pano.getNodeIds()[i]).source); // store node easting in an easy-to-read variable
    let nodeTitle = pano.getNodeUserdata(pano.getNodeIds()[i]).title;

    // calculate absolute vertical distance
    let diffN = inputN - destN; // i originally wrapped this in Math.abs(), but these values get squared later so it doesn't matter.

    // calculate absolute horizontal distance
    let diffE = inputE - destE;

    // store this information in a new object that has the node ID and calculated n,e differences as well as original title and n,e
    let output = {
        'node': pano.getNodeIds()[i],
        'N': diffN,
        'E': diffE,
        'title': nodeTitle,
        'destN': destN,
        'destE': destE
    }

    // push this object to our array.
    differences.push(output);

}

// find nearest neighbor using pythagoreon theorem, based off of our calculated northing/easting distances above
for (d = 0; d < pano.getNodeIds().length; d = d + 1) {

    // get our northing and easting distances relative to the coordinate input
    let deltaN = differences[d].N;
    let deltaE = differences[d].E;
    //let test = differences[d].node;


    // calculate their distance from the given input using pythagoreon theorem.
    let distance = Math.sqrt((deltaN * deltaN) + (deltaE * deltaE));

    // store the node and its distance from the input coordinate. retain title and original n,e values as well.
    let output = {
        'node': pano.getNodeIds()[d],
        'distance': distance,
        'title': pano.getNodeUserdata(pano.getNodeIds()[d]).title,
        'northing': differences[d].destN,
        'easting': differences[d].destE
    }

    // push this object to our array.
    distances.push(output);

}

// this makes use of a callback function to specifically sort through objects in the array by their distance value, lowest to highest.
let sortByNearest = distances.sort((a, b) => {
    return (a.distance - b.distance);
});

// now that we sorted, the closest distance is in the first slot of the array. fetch this nodeID.
let nearestNeighborNode = distances[0].node;
let nearestNeighborTitle = distances[0].title;
let nearestNeighborNorthing = String(distances[0].northing);
let nearestNeighborEasting = String(distances[0].easting);

// print that node ID. this is our nearest neighbor!
console.log("Nearest node: " + nearestNeighbor);

//print its title, coordinates, too
console.log("Title: " + nearestNeighborTitle);
console.log("Northing: " + nearestNeighborNorthing);
console.log("Easting: " + nearestNeighborEasting);









// *** more examples ***

/*

// this makes use of a callback function to specifically sort through objects in the array by their E (easting) value, lowest to highest.
let example = differences.sort((a, b) => {
    return (a.E - b.E);
});

// now that we've sorted our array, we know which node has the shortest easting distance from our given input.
let shortestE = example[0].node;

//or do the whole thing again but sort by northing.
example = differences.sort((a, b) => {
    return (a.N - b.N);
});

let shortestN = example[0].node;

*/




// for testing - cycles through all nodes in a given tour and prints three of their user data fields.

/*

for (i = 0; i < pano.getNodeIds().length; i = i + 1) {

    console.log(pano.getNodeUserdata(pano.getNodeIds()[i]).customnodeid); // unique identifier, but so is node ID itself, we might not need this
    console.log(pano.getNodeUserdata(pano.getNodeIds()[i]).copyright); // northing
    console.log(pano.getNodeUserdata(pano.getNodeIds()[i]).source); // easting

}

*/





/* 

***same thing as lines 22-57, earlier version that only did one coordinate axis (e.g. northing)***

// calculate northing distances and pass them into an array along with the associated nodeID.
for (v = 0; pano.getNodeIds().length; v = v + 1) {

    // store node northing in an easy-to-read variable.
    let destN = Number(pano.getNodeUserdata(pano.getNodeIds()[v]).copyright);

    // calculate absolute vertical distance
    let diffN = Math.abs(inputN - destN);

    // store this info in a new object that has the node ID and a calculated northing difference.
    let outputN = {
        'node': pano.getNodeIds()[v],
        'N': diffN
    }

    // push this object to our array.
    differencesN.push(outputN);

}

// sort the array of northing distance values relative to the given input point so that we can retrieve the lowest value.
// this makes use of a callback function to specifically sort through objects in the array by their N (northing) value.
differencesN.sort((a, b) => {
    return (a.N - b.N);
});

// now that we've sorted our array, we know which node has the shortest northing distance from our given input.
let shortestN = differencesN[0].node;

*/