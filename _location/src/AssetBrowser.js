
// create an empty variable that we will use later as an object to take data from one function, store it inside of here in a global context, and later use it in another function.
let dataHandoff;

// load a given photo360
function loadPhoto360(){
    document.getElementById("photo360").src = document.getElementById("inputurl").value;
}

/* not currently being used
function updateCoordinates(){
document.getElementById("currentcoordinates").value = (String.prototype.concat( (String((potree.viewer.scene.getActiveCamera().position.x).toFixed(4))),",",(String((potree.viewer.scene.getActiveCamera().position.y).toFixed(4))),",",(String((potree.viewer.scene.getActiveCamera().position.z).toFixed(4))) ));
}
*/

// turn on the crosshair in the iframe
function enableCrosshair() {
    photo360.pano.setVariableValue("crosshair_display",true);
    photo360.pano.setVariableValue("compass_visible",true);
}

// turn off the crosshair in the iframe
function disableCrosshair() {
    photo360.pano.setVariableValue("crosshair_display",false);
}

// parses CSV file of coordinates.
function parseFileAndContinue() {

    // papa parse modified config object: see https://www.papaparse.com/docs#config
    // this tells papa parse how to treat the file, but the code inside complete: isn't executed until Papa.parse() is called somewhere.
    let config = {
        delimiter: "",	// auto-detect
        newline: "",	// auto-detect
        quoteChar: '"',
        escapeChar: '"',
        header: false,
        transformHeader: undefined,
        dynamicTyping: false,
        preview: 0,
        encoding: "",
        worker: false,
        comments: false,
        step: undefined,
        // once the data is parsed (Papa.parse()), tell papa parse what to do with it. we have to do this inside of this 'complete' object function. 
        complete: function(output) {

            // use tabulator to take our papa parse data and display it in a table that we configure in a specific way and specific location.
            // see tabulator docs: http://tabulator.info/docs/4.9
            let dataTable = new Tabulator("#input_table", { // tell tabulator to put the table in an element with this ID, in our case a div from earlier.
                data: output.data, // set the spreadsheet data to be our parsed data within the object papa parse created.
                autoColumns:true,
                layout:"fitColumns", // make spreadsheet fit page size evenly
                headerVisible:false,
                tooltips:true,
                selectable:"highlight", // don't let rows stay selected after clicking

                // create an event listener (e) for any given row. if we click on that row, parse only the data points (ENZ,XYZ,etc) and pass them into parseInputfromSheetAndContinue().
                rowClick:function(e, row) {
                    let selectedPoint = row.getData();

                    // pass in our cogo point data into our parser function along with the type of cogo point (PENZD, PNEZD, XYZ, etc)
                    parseInputfromSheetAndContinue(selectedPoint, cogo_format_value);

                    // debug
                    //console.log(selectedPoint);
                }
            });
        },
        error: undefined, // the rest of this object holds default papa parse settings. see docs to modify.
        download: false,
        downloadRequestHeaders: undefined,
        downloadRequestBody: undefined,
        skipEmptyLines: false,
        chunk: undefined,
        chunkSize: undefined,
        fastMode: undefined,
        beforeFirstChunk: undefined,
        withCredentials: undefined,
        transform: undefined,
        delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP] // this line is worth noting: we can add custom delimiters.
    }

    // establish inputs: get filename from our input field.
    let cogo_input_field = document.getElementById("csv_importer");
    let cogo_input_text = cogo_input_field.files[0]; // don't do files[x].name, papa parse expects an object. (or.. blob in this case)

    // debug
    //console.log(cogo_input_field);
    //console.log(cogo_input_field.files);
    //console.log(cogo_input_text);
    //console.log(cogo_input_text.name);
    
    // store our formatting type (e.g. PENZD)
    // *** AS OF NOW PENZD is the default, make this functionality do something later: preferably in the complete: key-value in the papa parse 'config' obj above.
    let cogo_format_text = document.getElementById("cogo_format_set");
    let cogo_format_value = cogo_format_text.value;
    console.log(cogo_format_value);

    // parse our CSV file into something we can work with (JSON). calls our config object's 'complete' function (above) upon completion.
    Papa.parse(cogo_input_text, config); // see https://www.papaparse.com/docs ('Parse Local Files'). 
                                         //parse( blob - an object we receive from our file input html tag, which we fetch the name of above.
                                         // , 'default' object - papa parse's obj that determines how to handle this data, which we modified above. )

}

// parse an inputted row from a spreadsheet (csv, xlsx, etc. converted to JSON and displayed with tabulator) that holds cogo point data (e.g. PENZD) and then pass into targetFromNearestNeighbor().
function parseInputfromSheetAndContinue(cogo_row, type) {

    let positionDataCogo = cogo_row.slice(1, 4);
    let positionDataXYZ = cogo_row;

    // debug
    //console.log(positionDataCogo);

    // enact different behaviors based on the type of cogo point
    // js didn't like using the same variable names in these cases, so I had to make different sets for each.
    switch (type) {

        // if PENZD, sort in the order given after slicing off P and D.
        case "PENZD":
            let pointE_PENZD = parseFloat(positionDataCogo[0]);
            let pointN_PENZD = parseFloat(positionDataCogo[1]);
            let pointZ_PENZD = parseFloat(positionDataCogo[2]);

            targetFromNearestNeighbor(pointE_PENZD, pointN_PENZD, pointZ_PENZD);

            break;

        // if PNEZD, swap N and E when passing into targetFromNearestNeighbor() after slicing P and D.
        case "PNEZD":
            let pointN_PNEZD = parseFloat(positionDataCogo[0]);
            let pointE_PNEZD = parseFloat(positionDataCogo[1]);
            let pointZ_PNEZD = parseFloat(positionDataCogo[2]);

            targetFromNearestNeighbor(pointE_PNEZD, pointN_PNEZD, pointZ_PNEZD);

            break;

        // if XYZ don't slice, just pass forward.
        case "XYZ":
            let pointX_XYZ = parseFloat(positionDataXYZ[0]);
            let pointY_XYZ = parseFloat(positionDataXYZ[1]);
            let pointZ_XYZ = parseFloat(positionDataXYZ[2]);

            targetFromNearestNeighbor(pointX_XYZ, pointY_XYZ, pointZ_XYZ);

            break;

        // default to PENZD if somehow nothing is provided.
        default:

            let pointE = parseFloat(positionDataCogo[0]);
            let pointN = parseFloat(positionDataCogo[1]);
            let pointZ = parseFloat(positionDataCogo[2]);

            targetFromNearestNeighbor(pointE, pointN, pointZ);
    }
}

// parse a single inputted coordinate from a textbox.
function parseInputFromTextAndContinue() {
    
    // Establish Inputs
    let cogo_input_text = document.getElementById("cogo_input");
    let cogo_input_value = cogo_input_text.value;

    let cogo_format_text = document.getElementById("cogo_format");
    let cogo_format_value = cogo_format_text.value;
    
    let delimiter_format_label = document.getElementById("delimiter");
    let delimiter_value = delimiter_format_label.value;
    
    // Establish Character Definitions for Delimiter Labels
    let inputX, inputY, inputZ;
    let delimiter_character;

    if (delimiter_value == "Comma") delimiter_character = ","
    if (delimiter_value == "Space") delimiter_character = " "
    if (delimiter_value == "Colon") delimiter_character = ":"
    if (delimiter_value == "Semicolon") delimiter_character = ";"	

    // Parse input based on Cogo Format + Delimiter
    if(cogo_format_value == "XYZ") {
        inputX = parseFloat(cogo_input_value.split(delimiter_character)[0]); 
        inputY = parseFloat(cogo_input_value.split(delimiter_character)[1]);
        inputZ = parseFloat(cogo_input_value.split(delimiter_character)[2]);
    }

    if(cogo_format_value == "PENZD") {
        inputX = parseFloat(cogo_input_value.split(delimiter_character)[1]); 
        inputY = parseFloat(cogo_input_value.split(delimiter_character)[2]);
        inputZ = parseFloat(cogo_input_value.split(delimiter_character)[3]);
    }  

    if(cogo_format_value == "PNEZD") {
        inputX = parseFloat(cogo_input_value.split(delimiter_character)[1]); 
        inputY = parseFloat(cogo_input_value.split(delimiter_character)[1]);
        inputZ = parseFloat(cogo_input_value.split(delimiter_character)[3]);
    }

    // now that our inputs are parsed, pass into targetFromNearestNeighbor.
    targetFromNearestNeighbor(inputX, inputY, inputZ);

}

// creates a dataset of nearest neighbor nodes from the given coordinate sorted from closest to farthest; accounts for the entire tour.
// afterwards, moves us to the nearest neighbor (distances[0]) and calls another function to aim us directly at our inputted point.
// hence the name, targetFromNearestNeighbor.
function targetFromNearestNeighbor(E, N, Z) {

    let distances = new Array(); // create empty distances array for later.
    let currentPos = 0; // declare arbitrary position variable for the distances array.

    // find the nearest neighbor and set up our array
    
    // determine northing, easting, and elevation distances from the input (coordinates) to the destination (node) to determine which node is the closest. store info in an object.
    // do this for every node.
    for (i = 0; i < photo360.pano.getNodeIds().length; i = i + 1) {

        let thisNode = photo360.pano.getNodeIds()[i];
        let destN = parseFloat(photo360.pano.getNodeUserdata(thisNode).copyright); // store node northing in an easy-to-read variable
        let destE = parseFloat(photo360.pano.getNodeUserdata(thisNode).source); // store node easting in an easy-to-read variable
        let destZ = parseFloat(photo360.pano.getNodeUserdata(thisNode).author); // store node elevation in an easy-to-read variable
        let nodeTitle = photo360.pano.getNodeUserdata(thisNode).title;
        let customID = photo360.pano.getNodeUserdata(thisNode).customnodeid;

        // calculate northing distance from input Y
        let diffN = N - destN;

        // calculate easting distance input X
        let diffE = E - destE;

        // calculate elevation distance input Z
        let diffZ = Z - destZ;

        // use both of these distances to get the distance between the two points with pythagorean thorem.
        let distance2D = Math.sqrt((diffN * diffN) + (diffE * diffE));

        // use our elevation (z) distance and our hypotenuse (c=sqrt(a^2+b^2)) from the last line to get our 3D (true) distance, simply called distance.
        let distance = Math.sqrt((diffZ * diffZ) + (distance2D * distance2D));

        // store this information in a new object that has our nearest neighbor and other related information.
        let output = {
            'node': thisNode,
            'custom': customID,
            'title': nodeTitle,
            'distance2D': distance2D,
            'distance': distance, // our distance to the given input from this node.
            'northing': destN,
            'easting': destE,
            'elevation': destZ,
            'deltaX': diffE, // individual distance differences.
            'deltaY': diffN,
            'deltaZ': diffZ,
            'relativeX': E, // hold onto our original inputs that we used to get this information.
            'relativeY':  N,
            'relativeZ': Z
        }

        // push this object to our array we created earlier.
        distances.push(output);

        // this makes use of a callback function to specifically sort through objects in the array by their distance value, lowest to highest.
        let sortByNearest = distances.sort((a, b) => {
            return (a.distance - b.distance);
        });

    }

    // now that we sorted, the closest distance is in the first slot of the array (index 0). fetch this node's information.
    let nearestNeighborNode = distances[0].node;
    let nearestNeighborCustom = distances[0].custom;
    let nearestNeighborTitle = distances[0].title;
    let nearestNeighborDistance2D = String(distances[0].distance2D.toFixed(4));
    let nearestNeighborDistance = String(distances[0].distance.toFixed(4));
    let nearestNeighborNorthing = String(distances[0].northing);
    let nearestNeighborEasting = String(distances[0].easting);
    let nearestNeighborElevation = String(distances[0].elevation);

    // // print that node ID. this is our nearest neighbor!
    // console.log("Nearest node: " + nearestNeighborNode);

    // // print its title, coordinates, etc, too
    // console.log("Custom ID: " + nearestNeighborCustom);
    // console.log("Title: " + nearestNeighborTitle);
    // console.log("Distance from input: " + nearestNeighborDistance);
    // console.log("Distance (2D only): " + nearestNeighborDistance2D);
    // console.log("Northing: " + nearestNeighborNorthing);
    // console.log("Easting: " + nearestNeighborEasting);
    // console.log("Elevation: " + nearestNeighborElevation);

    // Go to our nearest neighbor.
    photo360.pano.openNext("{" + nearestNeighborNode + "}");

    // set our current distances array index to 0 since we're at the nearest neighbor (used for navigating to other neighbors later).
    currentPos = 0;

    // calculate pan and tilt for nearest neighbor so that we aim at our input from this node.
    calculatePanTilt(distances, currentPos);

    // debug
    //console.log(distances);

    // pass our currentPosition (the nearest neighbor) and our sorted distances array containing every node into a getter/setter hybrid function.
    // this function will set these values (getOrSetNodes("set", positionInArray, array) and store them in a global object other functions can talk to.
    getOrSetNodes("set", currentPos, distances);

    // update our distance display to show the distance for this node.
    updateDistanceDisplay();

    // move potree to our nearest neighbor node if we want
    //photo360.potree.viewer.scene.view.position.set(distances[0].easting, distances[0].northing, distances[0].elevation);

    // orient potree to look at what p2vr is looking at, regardless of if we're at the same position or not.
    // NOTE: if potree hasn't been loaded yet, function will error out early if this isn't at the bottom.
    photo360.potree.viewer.scene.view.lookAt(E, N, Z);

}

// handoff function sets the input into a global object, or gets this information and provides it.
// when setting, provide all three inputs. when getting, only provide the first: ignore the last two.
function getOrSetNodes(type, pos = 0, arr = []) {

    if (type === "set") {

        // populate our object, created at the very top of our script.
        dataHandoff = {
            "setupPosition": pos,
            "arrayOfNodes": arr
        }

    // return our array or array position.
    } else if (type === "getArr") {
        return dataHandoff.arrayOfNodes;
    } else if (type === "getPos") {
        return dataHandoff.setupPosition;
    }

}

// move to next nearest neighbor using our distances array
function nextNearestNeighbor() {

    // retrieve the array and our current position from our handoff function, which looks at our global object called dataHandoff.
    distances = getOrSetNodes("getArr");
    currentPos = getOrSetNodes("getPos");

    // only execute if our array has already been populated by targetFromNearestNeighbor().
    // AND
    // only execute if we aren't already at the nearest neighbor.
    if (distances.length > 0 && currentPos > 0) {

        // increment our array position.
        currentPos = currentPos - 1;
        getOrSetNodes("set", currentPos, distances);

        // go to the node that matches that array position.
        photo360.pano.openNext("{" + String(distances[currentPos].node) + "}");

        // orient this node to the input coordinates.
        calculatePanTilt(distances, currentPos);

        // update our distance display to show the distance for this node.
        updateDistanceDisplay();
    }
}

// move to next furthest neighbor using our distances array
function nextFurthestNeighbor() {

    distances = getOrSetNodes("getArr");
    currentPos = getOrSetNodes("getPos");

    // only execute if our array has already been populated by targetFromNearestNeighbor().
    // AND
    // only execute if we aren't already at the farthest neighbor.
    if (distances.length > 0 && currentPos < distances.length) {

        //decrement our array position.
        currentPos = currentPos + 1;
        getOrSetNodes("set", currentPos, distances);

        // go to the node that matches that array position.
        photo360.pano.openNext("{" + String(distances[currentPos].node) + "}");

        // orient this node to the input coordinates.
        calculatePanTilt(distances, currentPos);

        // update our distance display to show the distance for this node.
        updateDistanceDisplay();
    }
}

// aim the given node at the provided input coordinates. meant to be used with arrays holding many tour nodes (objects).
function calculatePanTilt(array, pos) {

    let deltaX = array[pos].deltaX;
    let deltaY = array[pos].deltaY;
    let deltaZ = array[pos].deltaZ;
    let distance2D = array[pos].distance2D;

    // calculate panorama pan from observer (current node) to target (input)
    let targetPan = (Math.atan2(deltaX, -(deltaY)) * (180 / Math.PI) + 180);

    // calculate panorama tilt from observer to target
    let calcTilt = (Math.atan2(deltaZ, distance2D) * (180 / Math.PI));

    // 360: set pano pan and tilt to look at our input from nearest neighbor.
    photo360.pano.setPanNorth(targetPan);
    photo360.pano.setTilt(calcTilt);

}

// updates the distance display field on the page every time we go to a new node.
function updateDistanceDisplay() {

    // retrieve the array and our current position from our handoff function, which looks at our global object called dataHandoff.
    distances = getOrSetNodes("getArr");
    currentPos = getOrSetNodes("getPos");

    distanceDisplay = document.getElementById("distance_display");

    distanceDisplay.innerHTML = `3D Distance: ${distances[currentPos].distance.toFixed(3)} Survey Feet || Horizontal Distance: ${distances[currentPos].distance2D.toFixed(3)} Survey Feet`;

}