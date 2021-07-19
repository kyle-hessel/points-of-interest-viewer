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
    let destN = Number(pano.getNodeUserdata(thisNode).copyright); // store node northing in an easy-to-read variable
    let destE = Number(pano.getNodeUserdata(thisNode).source); // store node easting in an easy-to-read variable
    let destZ = Number(pano.getNodeUserdata(thisNode).author); // store node elevation in an easy-to-read variable
    let nodeTitle = pano.getNodeUserdata(thisNode).title;
    let customID = pano.getNodeUserdata(thisNode).customnodeid;

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

////////////////////////////////
/// Begin Cory & Jeff's Code ///
////////////////////////////////

// Version 2.0 with improvements by Jeff (uses ATAN, less code / variables)
// I made some further tweaks to work in my code and further optimize some things. V3? ~Kyle

// Get target input from text boxes
var TargetX = document.getElementById("inputtargetx").value;
var TargetY = document.getElementById("inputtargety").value;
var TargetZ = document.getElementById("inputtargetz").value;
    
// Get setup position from Photo360 panorama node
var ObserverX = parseFloat(photo360.pano.getNodeUserdata().source);
var ObserverY = parseFloat(photo360.pano.getNodeUserdata().copyright);
var ObserverZ = parseFloat(photo360.pano.getNodeUserdata().author);

// Calculate deltas
var deltaX = TargetX - ObserverX;
var deltaY = TargetY - ObserverY;
var deltaZ = TargetZ - ObserverZ;

//Calculate Panorama Pan from observer to target
var targetPan = Math.atan2(-(TargetY - ObserverY), TargetX - ObserverX) * 180 / Math.PI;


//Calculate Horizontal distance 
var deltaHorizontal = Math.sqrt(Math.pow(TargetX - ObserverX, 2) + Math.pow(TargetY - ObserverY, 2));
    
//Calculate 3d distance 
var delta3D = Math.sqrt(Math.pow(TargetX - ObserverX, 2) + Math.pow(TargetY - ObserverY, 2) + Math.pow(TargetZ - ObserverZ, 2));

//Calculate Panorama Tilt from observer to target
var calcTilt = (Math.atan2(TargetZ - ObserverZ, deltaHorizontal) * (180 / Math.PI));

// 360: Set pano Pan
photo360.pano.setPanNorth(targetPan);
photo360.pano.setTilt(calcTilt);
    
// 3D: Set target
photo360.potree.viewer.scene.view.lookAt(TargetX,TargetY,TargetZ);

