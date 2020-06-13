document.addEventListener("DOMContentLoaded", () => {
    getBrowserLocation(function (){
        getNearby();
    });
    isLoggedIn();   
});

  //Get current user's browser location
function getBrowserLocation(getDistances) {
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
    function success(pos) {
        var crd = pos.coords;
        document.getElementById("user_lat").value = `${crd.latitude}`;
        document.getElementById("user_lon").value = `${crd.longitude}`;
        getDistances();
    }
    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }
    navigator.geolocation.getCurrentPosition(success, error, options);
    //alert("lat: "+ document.getElementById("user_lat").value + " lon:" + document.getElementById("user_lon").value);
}

// Gets cities near user's browser. The city with its center nearest user is displayed in the navbar
function getNearby(){
    var userLat = document.getElementById("user_lat").value ;
    var userLon = document.getElementById("user_lon").value;

    payload = {
        lat: userLat,
        lon: userLon
    }
    
    var req = new XMLHttpRequest();
    req.open('POST', '/locate/get-near-places' , true)
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function () {
        //Process response
        if (req.status >= 200 && req.status < 400) {
            var resp = JSON.parse(req.responseText);
            
            const currLocation = resp.geonames[0].name? resp.geonames[0].name + ", " + resp.geonames[0].adminCode1 : " ";
            document.getElementById("currLoc").innerText = currLocation;
            // for (let index = 0; index < resp.geonames.length; index++) {
            //     console.log(resp.geonames[index].name + ", " + resp.geonames[index].adminCode1);
            // } 
                
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(JSON.stringify(payload));
}

function setNavbar(resp){
    if(resp.auth != "none"){
        //alert("Hello" + resp.auth.name);
        document.getElementById("greet").innerText = "Hi, " + resp.auth.name;
        document.getElementById("greet").setAttribute("href","./edititem");
        document.getElementById("usrInfo").hidden = false;
        document.getElementById("register").hidden = true;
        document.getElementById("usrLogin").hidden = true;
    } else {
        document.getElementById("usrInfo").hidden = true;
        document.getElementById("register").hidden = false;
        document.getElementById("usrLogin").hidden = false;
    }
}

function isLoggedIn() {
    var req = new XMLHttpRequest();
    req.open('GET', '/usr', true);
    req.addEventListener('load', function () {
        //Process response
        if (req.status >= 200 && req.status < 400) {
            var resp = JSON.parse(req.responseText);
            // Add a dropdown option for every category found in the data base
            setNavbar(resp);

        } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(null);
}