/////////////////////////
/// Begin Kyle's Code ///
/////////////////////////

// coordinate inputs
let inputN = 469834.013;
let inputE = 1295854.817;
let inputZ = 172.482;

// create empty distances array for later
let distances = new Array();

// use northing, easting, and elevation distances from the input (coordinates) to the destination (node) to determine which node is the closest. store info in an object.
for (i = 0; i < pano.getNodeIds().length; i = i + 1) {

    let thisNode = pano.getNodeIds()[i];
    let destN = Number(pano.getNodeUserdata(pano.getNodeIds()[i]).copyright); // store node northing in an easy-to-read variable
    let destE = Number(pano.getNodeUserdata(pano.getNodeIds()[i]).source); // store node easting in an easy-to-read variable
    let destZ = Number(pano.getNodeUserdata(pano.getNodeIds()[i]).author); // store node elevation in an easy-to-read variable
    let nodeTitle = pano.getNodeUserdata(pano.getNodeIds()[i]).title;
    let customID = pano.getNodeUserdata(pano.getNodeIds()[i]).customnodeid;

    // calculate northing distance
    let diffN = inputN - destN; // i originally wrapped this in Math.abs(), but these values get squared below so it doesn't matter.

    // calculate easting distance
    let diffE = inputE - destE;

    // calculate elevation distance
    let diffZ = inputZ - destZ;

    // use both of these distances to get the absolute distance between the two points with pythagorean thorem.
    let distance2D = Math.sqrt((diffN * diffN) + (diffE * diffE));

    // use our elevation difference and our hypotneuse from the last line to get our 3D (true) distance, simply called distance.
    let distance = Math.sqrt((diffZ * diffZ) + (distance2D * distance2D));

    // store this information in a new object that has our nearest neighbor and other related information.
    let output = {
        'node': thisNode,
        'custom': customID,
        'title': nodeTitle,
        'distance2D': distance2D,
        'distance': distance,
        'northing': destN,
        'easting': destE,
        'elevation': destZ
    }

    // push this object to our array we created.
    distances.push(output);

}

// this makes use of a callback function to specifically sort through objects in the array by their distance value, lowest to highest.
let sortByNearest = distances.sort((a, b) => {
    return (a.distance - b.distance);
});

// now that we sorted, the closest distance is in the first slot of the array. fetch this node's information.
let nearestNeighborNode = distances[0].node;
let nearestNeighborCustom = distances[0].custom;
let nearestNeighborTitle = distances[0].title;
let nearestNeighborDistance2D = String(distances[0].distance2D.toFixed(4));
let nearestNeighborDistance = String(distances[0].distance.toFixed(4));
let nearestNeighborNorthing = String(distances[0].northing);
let nearestNeighborEasting = String(distances[0].easting);
let nearestNeighborElevation = String(distances[0].elevation);

// print that node ID. this is our nearest neighbor!
console.log("Nearest node: " + nearestNeighbor);

// print its title, coordinates, etc, too
console.log("Custom ID: " + nearestNeighborCustom);
console.log("Title: " + nearestNeighborTitle);
console.log("Distance from input: " + nearestNeighborDistance);
console.log("Distance (2D only): " + nearestNeighborDistance2D);
console.log("Northing: " + nearestNeighborNorthing);
console.log("Easting: " + nearestNeighborEasting);
console.log("Elevation: " + nearestNeighborElevation);


/*// for testing - cycles through all nodes in a given tour and prints three of their user data fields.

for (i = 0; i < pano.getNodeIds().length; i = i + 1) {

    console.log(pano.getNodeUserdata(pano.getNodeIds()[i]).customnodeid); // unique identifier, but so is node ID itself, we might not need this
    console.log(pano.getNodeUserdata(pano.getNodeIds()[i]).copyright); // northing
    console.log(pano.getNodeUserdata(pano.getNodeIds()[i]).source); // easting

}

*/
