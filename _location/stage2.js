/* This code aims at a specific inputted coordinate (NEZ) relative to the node we are currently viewing from.
    Written by Cory Hessel, modified by Jeff McKinney, and reworked by Kyle Hessel. */

// Version 2.0 with improvements by Jeff (uses ATAN, less code / variables)
// I made a lot of changes to make this work similar to my code above and further optimize some things. V3? ~Kyle

function target360(E, N, Z) {

        // Get setup position from current Photo360 panorama node
        let ObserverX = Number(photo360.pano.getNodeUserdata().source);
        let ObserverY = Number(photo360.pano.getNodeUserdata().copyright);
        let ObserverZ = Number(photo360.pano.getNodeUserdata().author);

        // Calculate deltas for current node
        let deltaX = E - ObserverX;
        let deltaY = N - ObserverY;
        let deltaZ = Z - ObserverZ;

        //Calculate Panorama Pan from observer (current node) to target (input)
        let targetPan = (Math.atan2(deltaX, -(deltaY)) * (180 / Math.PI) + 180);

        //Calculate 2D distance (topdown)
        let deltaH = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
            
        //Calculate 3d distance, factoring in elevation.
        let delta3D = Math.sqrt((deltaH * deltaH) + (deltaZ * deltaZ));

        //Calculate Panorama Tilt from observer to target
        let calcTilt = (Math.atan2(deltaZ, deltaH) * (180 / Math.PI));

        // 360: Set pano Pan
        photo360.pano.setPanNorth(targetPan);
        photo360.pano.setTilt(calcTilt);
            
        // 3D: Set target
        photo360.potree.viewer.scene.view.lookAt(E, N, Z);

}