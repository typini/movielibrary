//Global Variables
var movieList;
var movieCount = 0;
sessionStorage.setItem("forwardList", "");
sessionStorage.setItem("openSelector", "notOpen");
sessionStorage.setItem("sessionList", "");


//Order of Load:
//Store Global Variables
//Store Functions
//run libraryOnload().  

//Order of Functions:
// Pick Random Button -->  randomize() --> buttonPressAndStore() --> singleMovieRequest() --> clearAllTimeouts(), request --> getMovieInfo() [movieInfoRequest], screenCrossfade()
// Dropdown Menu -->  selectTitle() --> buttonPressAndStore() || clearAllTimeouts(), screenClear()

// Clear Button -->  buttonClear() --> clearAllTimeouts(), retractSelector(), screenClear() --> clearnInnerHTML x7
// Previous Pick Button -->  buttonBack()  --> setDropdown(), populateSingleMovie(cachedLast) ||  buttonClear()
// Alpha Select Button -->  setAlphas() --> expandSelector() || retractSelector()
// Genre Select Button -->  setGenres() --> expandSelector(), loadGenres || retractSelector()


//Loads the dropdown list with movies, tracks movie count, and saves the entire list to variable: movieList
function libraryOnload () {
    var loadLibrary = new XMLHttpRequest();

    loadLibrary.onload = function () {
        //load the dropdown menu
        movieList = JSON.parse(this.response);
        let d = document.getElementById('dropdown');
        var dropdownDefault = document.createElement('option');
        dropdownDefault.setAttribute('value', "xxxxxxxxx");
        dropdownDefault.innerHTML = "Please select a movie title";
        d.appendChild(dropdownDefault);
        
        for (var movie in movieList){
            if (movieList.hasOwnProperty(movie)){
                var dropdownEntry = document.createElement('option');
                dropdownEntry.setAttribute('value', movie);
                dropdownEntry.innerHTML = movieList[movie].title;
                d.appendChild(dropdownEntry);
                movieCount++;
            }
        }
        randomize();
    }

    loadLibrary.open("GET", "movielist.json");
    loadLibrary.send();
}


//loads movie poster, backdrop, and info for a single request, needs IMDB movie ID: tt#######
function singleMovieRequest(movieID) {
    clearAllTimeouts();
    let cb = document.getElementById("cinematicBackground");
    let mp = document.getElementById("moviePoster");
    
    var request = new XMLHttpRequest();
    
    request.onload = function() {
        var data = JSON.parse(this.response);
        //size options are:  w92, w154, w185, w300, w500, original
        mp.src = "https://image.tmdb.org/t/p/w185"+data.movie_results[0].poster_path;
        //size options are: w300, w780, w1280, and original
        getMovieInfo(data.movie_results[0].id);
        cb.style.backgroundImage = "url('https://image.tmdb.org/t/p/w1280"+data.movie_results[0].backdrop_path+"')";
        screenCrossfade();
    };

    var searchString = "https://api.themoviedb.org/3/find/"+movieID+"?api_key=960ab7b9eeb507dae598f52d6aeced9f&language=en&external_source=imdb_id";
    request.open("GET", searchString);
    request.send();

}

function screenCrossfade() {
    let cb = document.getElementById("cinematicBackground");
    let cs = document.getElementById("cinematicScreen");
    let mo = document.getElementById("movieOverview");
    //times * 1000 due to needing millisecond values
    let imageFadeOutTime = parseFloat(window.getComputedStyle(cs)['transitionDuration']) * 1000;

    cs.style.opacity = 0;
    cs.style.filter = "blur(40px)";
    mo.style.color = "rgba(0,0,0,0)";
    mo.style.opacity = "0";
    let textFadeOutTime = parseFloat(window.getComputedStyle(mo)['transitionDuration']) * 1000;
    setTimeout(function(){
        mo.style.color = "rgba(0,0,0,1)";
        mo.style.opacity = "1";
    }, textFadeOutTime);
    setTimeout(function(){
        cs.style.transition = "filter 0s ease-in 0s, opacity 0s ease-in 0s";
        cs.style.filter = "blur(0px)";
        cs.style.backgroundImage = cb.style.backgroundImage;
        cs.style.opacity = "1";
        setTimeout(function(){
            cs.style.transition = "filter 0.7s ease-in 0s, opacity 0.3s ease-in 0.4s";
        }, 20);
    }, (imageFadeOutTime));
}


//expects Movie API movieID
function getMovieInfo(movieID){
    var movieInfoRequest = new XMLHttpRequest();

    movieInfoRequest.onload = function () {
        var data = JSON.parse(this.response);
        document.getElementById("movieID").innerHTML = data.id;
        document.getElementById("movieTagline").innerHTML = data.tagline;
        document.getElementById("movieTitle").innerHTML = data.title;
        document.getElementById("movieGenres").innerHTML = "";
        data.genres.forEach(m => {
            var n = document.createElement("span");
            n.className = "genres";
            n.innerHTML = m.name;
            document.getElementById("movieGenres").appendChild(n);
        });
        document.getElementById("releaseDate").innerHTML = data.release_date.slice(0,4);
        document.getElementById("movieRuntime").innerHTML = data.runtime + " minutes";
        let mo = document.getElementById("movieOverview");
        let textFadeOutTime = parseFloat(window.getComputedStyle(mo)['transitionDuration']) * 1000;
        setTimeout(function(){
            document.getElementById("movieOverview").innerHTML = data.overview;
        }, textFadeOutTime);

    };

    var searchString = "https://api.themoviedb.org/3/movie/"+movieID+"?api_key=960ab7b9eeb507dae598f52d6aeced9f&language=en-US";
    movieInfoRequest.open("GET", searchString);
    movieInfoRequest.send();

}


//expects IMDB movieID
function buttonPressAndStore(movieID) {
    sessionStorage.forwardList = "";
    sessionStorage.sessionList.length > 0 ? sessionStorage.sessionList += ","+movieID : sessionStorage.sessionList = movieID;
    populateSingleMovie(movieID);
}


function populateSingleMovie(movieID){
    singleMovieRequest(movieID);
    //sending second argument as 1 makes them appear: style.display = inline-block, otherwise, style.display = none
    makeIconsAppear(movieID, 1);
}


//send val = 1 to make icons appear, any other value makes icons disappear.
function makeIconsAppear(movieID, val){
    var listOfFormats = ["VUDU", "AMAZON", "APPLE", "4K", "BLURAY3D", "BLURAY", "DVD", "MS"];
    listOfFormats.forEach(i => {
        if (val === 1 && movieList[movieID].loc.includes(i))
            document.getElementById(i).style.display = "inline-block";
        else 
            document.getElementById(i).style.display = "none";
    });
}


function buttonClear() {
    clearAllTimeouts();
    //sessionStorage.sessionList.length > 0 ? sessionStorage.sessionList += ",xxxxxxxxx" : sessionStorage.sessionList = "xxxxxxxxx";
    retractSelector();
    screenClear();
}


function screenClear(){
    makeIconsAppear(document.getElementById('dropdown').value, 0);
    document.getElementById("moviePoster").src = "./images/cinema.jpg";
    document.getElementById("dropdown").options[0].selected = true;
    clearInnerHTML("movieRuntime");
    clearInnerHTML("releaseDate");
    clearInnerHTML("movieID");
    clearInnerHTML("movieTitle");
    clearInnerHTML("movieTagline");
    clearInnerHTML("movieGenres");
    clearInnerHTML("movieOverview");
    document.getElementById("cinematicBackground").style.backgroundImage = "";
    document.getElementById("cinematicScreen").style.opacity = 0;
    document.getElementById("movieOverview").style.display = "none";
    document.getElementById("movieOverview").style.opacity = 0;
    setTimeout(function(){
        document.getElementById("movieOverview").style.removeProperty("display");
    }, parseFloat(window.getComputedStyle(document.getElementById("movieOverview"))['transitionDuration'] * 1000));
}


/*
function fadeToTransparant(elementID, transitionTime){
    let text = "opacity "+ (transitionTime / 1000) +"s ease 0s";
    document.getElementById(elementID).style.transition.length > 0 ? document.getElementById(elementID).style.transition.length += ", " + text : document.getElementById(elementID).style.transition.length = text;
    document.getElementById(elementID).style.opacity = "0";
}


function drop(elementID, transitionTime){
    let windowHeight = window.innerHeight;
    let topPosition = document.getElementById(elementID).getBoundingClientRect().top;
    //let text = "margin-top "+ (transitionTime / 1000) +"s ease-out 0s";
    //document.getElementById(elementID).style.transition.length > 0 ? document.getElementById(elementID).style.transition.length += ", " + text : document.getElementById(elementID).style.transition.length = text;
    document.getElementById(elementID).style.marginTop = (windowHeight - topPosition) + "px";
    document.getElementById(elementID).style.opacity = "0";
}
*/

function buttonBack(){

    while (sessionStorage.sessionList.slice(-9) === document.getElementById("dropdown").value){
        sessionStorage.sessionList = sessionStorage.sessionList.slice(0, -10);
    }

    /*while (sessionStorage.sessionList.slice(-9) === "xxxxxxxxx"){
        sessionStorage.sessionList = sessionStorage.sessionList.slice(0, -10);
    }*/
    
    let cachedLast = sessionStorage.sessionList.slice(-9);
    sessionStorage.forwardList.length > 0 ? sessionStorage.forwardList += "," + cachedLast : sessionStorage.forwardList = cachedLast;
    
    if (cachedLast.length > 0){
        setDropdown(movieList[cachedLast].title);
        populateSingleMovie(cachedLast);
    } else {
        sessionStorage.sessionList = "";
        buttonClear();
    }
}


function setDropdown (movieTitle) {
    let d = document.getElementById("dropdown");

    for (let i = 1; i <= movieCount; i++){
        if (d.options[i].text === movieTitle){
            d.options[i].selected = true;
            return;
        }
    }
}


function clearInnerHTML(ID){
    document.getElementById(ID).innerHTML = "";
}


function selectTitle(){
    if (document.getElementById("dropdown").value != "xxxxxxxxx")
        buttonPressAndStore(document.getElementById('dropdown').value);
    else {
        clearAllTimeouts();
        screenClear();
    }
}


function randomize(){
    //plus one is to avoid picking "Please select a movie title" option
    var pickOne = Math.floor(Math.random() * movieCount);
    buttonPressAndStore(Object.keys(movieList)[pickOne]);
    document.getElementById("dropdown").selectedIndex = pickOne + 1;
}


function setAlphas() {

    if (sessionStorage.openSelector != "alphas"){
        sessionStorage.openSelector = "alphas";

        var s = document.getElementById("selector");
        expandSelector(window.getComputedStyle(s).getPropertyValue("height"));
        
        s.innerHTML = "";

        var t = document.createElement('li');
        t.setAttribute("onmousedown", "clickedOnSelectorItem(this.id)");
        t.setAttribute("id", "poundInList");
        t.setAttribute("class", "alphas");
        t.innerHTML = "#";

        s.appendChild(t);

        for (let x = "A".charCodeAt(0); x <= "Z".charCodeAt(0); x++) {
            var u = document.createElement('li');
            u.setAttribute("onmousedown", "clickedOnSelectorItem(this.id)");
            u.setAttribute("id", String.fromCharCode(x)+"InList");
            u.setAttribute("class", "alphas");
            u.innerHTML = String.fromCharCode(x);
            s.appendChild(u);
        }

        s.style.height = "auto";
        s.style.visibility = "visible";

    } else {
        retractSelector();
    }
    
}

function setGenres() {

    if (sessionStorage.openSelector != "genres"){
        sessionStorage.openSelector = "genres";


        var s = document.getElementById("selector");

        var loadGenres = new XMLHttpRequest();

        loadGenres.onload = function () {

            //load the genres buttons
            var genreList = JSON.parse(this.response);

            expandSelector(window.getComputedStyle(s).getPropertyValue("height"));
            s.innerHTML = "";
            genreList.genres.forEach( n => {
                if (n.hasOwnProperty("name")){
                    var t = document.createElement('li');
                    t.setAttribute("onmousedown", "clickedOnSelectorItem(this.id)");
                    t.setAttribute("id", n.name);
                    t.setAttribute("class", "genres");

                    t.innerHTML = n.name;
                    s.appendChild(t);
                }
            });
            
        }

        var searchString = "https://api.themoviedb.org/3/genre/movie/list?api_key=960ab7b9eeb507dae598f52d6aeced9f&language=en-US";
        loadGenres.open("GET", searchString);
        loadGenres.send();

        s.style.height = "auto";
        s.style.visibility = "visible";

    } else {
        retractSelector();
    }
    
}

function expandSelector(h){
    var s = document.getElementById("selector");
    console.log(h);
    s.style.height = h;
    s.style.padding = "15px";
    s.style.overflow = "scroll";
}

function retractSelector(){
    var s = document.getElementById("selector");
    s.style.height = "0px";
    s.style.padding = "0px 15px";
    s.style.overflow = "hidden";
    sessionStorage.openSelector = "notOpen";
}

function clickedOnSelectorItem(e){
    document.getElementById(e).innerHTML = "@";
}

function multipleMovieRequest(){
    
}

function clearAllTimeouts(){
    var id = window.setTimeout(function() {}, 0);
    while (id--) {
        window.clearTimeout(id); // will do nothing if no timeout with id is present
    }
}



if (typeof(Storage) !== "undefined") {
    //alert("Storage available");
} else {
    alert("Notice:  Storage for this web browser is not available, the \"recent\" and \"back\" buttons will not work.");
}

libraryOnload();


//General Comments Section

//Get Info
//https://api.themoviedb.org/3/movie/13465?api_key=960ab7b9eeb507dae598f52d6aeced9f&language=en-US

//search tt#ID from imdb
//https://api.themoviedb.org/3/find/tt0274558?api_key=960ab7b9eeb507dae598f52d6aeced9f&language=en-US&external_source=imdb_id
