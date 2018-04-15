// var initMapLat;
// var initMapLng;

$(document).ready(function () {
    // Search Dropdowm Menu: Materialize function call
    $('select').material_select();
    // Map tabs : Materialize function call
    $('.tabs').tabs();

    //  Exisitn User : LOGIN  MODAL
    $("#modalBtn").click(function () {
        $("#modal1").modal();
    });
    //  New User : LOGIN  MODAL
    $("#modalBtn2").click(function () {
        $("#modal2").modal();
    });
    //  Map Tabs : Add a Tab MODAL
    $("#modalBtnTab").click(function () {
        $("#modalTabs").modal();
    });
    //  User Notes  MODAL
    $("#modalBtnNotes").click(function () {
        $("#modalNotes").modal();
    });
    //LOGIN MODAL
    $("#modalLoginBtn").click(function () {
        $("#modalLogin").modal();
    });
});

//var elem = document.querySelector('.fixed-action-btn');
//var instance = M.FloatingActionButton.init(elem, {
//  direction: 'left'
//});



var apiKey = "134929701576f37675a021f1de544eed";

initRest();

//populate initial map with veggie restaurants
function initRest() {
    cuisine_id = 308;
    entity_type = "city";
    city_id = 277;
    generalSearch = true;
    initMapLat = parseFloat(29.760);
    initMapLng = parseFloat(-95.369);
    getRestaurants();
};

//get location coordinates

//from form get:
//city -->query to get city code
//type of cuisine (provide dropdown) -->query to get cuisine code

//after showing restuarants on map, click on one (input code) to get daily menu, restaurant info, and reviews
//place to search a restaurant to also do this
var city; //from user
var cuisine; //from user
var restName;
var generalSearch;
$("#searchIt").on("click", function (event) {
    event.preventDefault();
    generalSearch = true;
    city = capUpper($("#city").val().trim());

    //if someone enters in a restaurant name, it's not a general search and the order of functions changes
    restName = capUpper($("#restaurant").val().trim());
    if (restName === "") {
        gereralSearch = true;
    }
    else {
        generalSearch = false;
    };
    city = capUpper($("#city").val().trim());


    if (generalSearch) {
        getCityInfo(function () {
            getCuisineInfo();
        })
    }
    else {
        getCityInfo(function () {
            getSpecificRest();
        })
    };
});

$(document).on("click", ".cuisineOptionBox", function () {
    event.preventDefault();
    var c = $(this).val();
    cuisine_id = "308%2C%20" + c;
    getRestaurants();
});

$(document).on("click", ".tabs a", function () {
    database.ref(uid).on("value", function (snapshot) {
        console.log(snapshot.val());//data inside uid
        tab1 = snapshot.val().tab1;
        tab2 = snapshot.val().tab2;
        tab3 = snapshot.val().tab3;
    });
    console.log(this.id);//the name of the tab
    console.log(this);
    //below isn't dry but it won't work in a loop
    if (this.id === "tab1") {
        console.log(tab1.tabName);
        getAddress = tab1.tabStreet;
        getCity = tab1.tabCity;
        userZip = tab1.tabZip;
        console.log(getAddress, getCity, userZip);
        formatAddress(getAddress, " ");
        formatAddress(getCity, " ");
        getLatLng();
        initMap();
    }
    if (this.id === "tab2") {
        console.log(tab2.tabName);
        getAddress = tab2.tabStreet;
        getCity = tab2.tabCity;
        userZip = tab2.tabZip;
        console.log(getAddress, getCity, userZip);
        formatAddress(getAddress, " ");
        formatAddress(getCity, " ");
        getLatLng();
        initMap();
    }
    if (this.id === "tab3") {
        console.log(tab3.tabName);
        getAddress = tab3.tabStreet;
        getCity = tab3.tabCity;
        userZip = tab3.tabZip;
        console.log(getAddress, getCity, userZip);
        formatAddress(getAddress, " ");
        formatAddress(getCity, " ");
        getLatLng();
        initMap();
    }
})

var queryUrlLocation;
var city_id;
var city_name;
var entity_type;
//gives location info for use in other queries; also gives suggestd city name from a search word (use this function for search??)
//gives location information for inputed city, Ex: name, city_id, city_type
function getCityInfo(callback) {
    queryUrlLocation = "https://developers.zomato.com/api/v2.1/locations?query=" + city;
    $.ajax({
        url: queryUrlLocation,
        method: "GET",
        headers: { "user-key": apiKey }
    }).then(function (response) {
        console.log("OZAIR IS HERE", response);
        city_id = response.location_suggestions[0].city_id;
        city_name = response.location_suggestions[0].city_name;
        initMapLat = parseFloat(response.location_suggestions[0].latitude);
        initMapLng = parseFloat(response.location_suggestions[0].longitude);
        entity_type = response.location_suggestions[0].entity_type;
        getRestaurants();
        callback();
    });
};

var queryUrlCuisines;
var cuisine_id;
var cuisine_name;
var allCuisines = []; //list of all cuisines and ids in obj

//gives list of cuisine types for a city
function getCuisineInfo() {
    if (!generalSearch) return;

    $.ajax({
        url: queryUrlCuisines,
        method: "GET",
        headers: { "user-key": apiKey }
    }).then(function (response) {
        for (var i = 0; i < response.cuisines.length; i++) {
            var r = response.cuisines[i].cuisine;
            allCuisines[i] = {
                "name": r.cuisine_name,
                "id": r.cuisine_id
            };
            allCuisines.push(r.cuisine_name);
            if (r.cuisine_name === cuisine) {
                cuisine_name = r.cuisine_name;
                cuisine_id = r.cuisine_id;
                console.log("308%2C%20" + r.cuisine_id); //cajun=491 //working
            };

            //create option, add class/attr/text, and append to dropdown menu
            var cuisineOption = $("<li>").addClass("cuisineOptionBox").attr("value", r.cuisine_id).text(r.cuisine_name);
            $(".select-dropdown").append(cuisineOption);
        };
    });
};

var allRestaurants = [];
var queryUrlRestaurants;
// list of restaurants for inputed cuisine and city, ex: vegetarian in Houston
//this function calls the initmap function
function getRestaurants() {
    // console.log("running getRestaurants; only on general search");
    // console.log(cuisine_id);
    if (!generalSearch) return;
    queryUrlRestaurants = "https://developers.zomato.com/api/v2.1/search?entity_id=" + city_id + "&entity_type=" + entity_type + "&cuisines=" + cuisine_id;


    // console.log(queryUrlRestaurants);
    // console.log(cuisine_id, entity_type, city_id); //keep this
    $.ajax({
        url: queryUrlRestaurants,
        method: "GET",
        headers: { "user-key": apiKey } //api key
    }).then(function (response) {
        // console.log(response.restaurants); //lists 20 restaurants //keep this
        for (var j = 0; j < response.restaurants.length; j++) {
            var r = response.restaurants[j].restaurant;
            var rl = r.location;
            var ru = r.user_rating;
            allRestaurants[j] = {
                "name": r.name,
                "id": r.id,
                "image": r.featured_image,
                "location": {
                    "address": rl.address,
                    "city": rl.city,
                    "latitude": rl.latitude,
                    "longitude": rl.longitude,
                    "zipcode": rl.zipcode
                },
                "menu": r.menu_url,
                "price": r.price_range,
                "user_rating": {
                    "avg": ru.aggregate_rating,
                    "rating_word": ru.rating_text,
                    "votes": ru.votes
                }
            };
        };
        initMap();
    });
};

var querySpecificRest;
var specific_rest_id;
var specificRest;
//function to get restaurant data from search bar
function getSpecificRest() {
    if (generalSearch) return;
    querySpecificRest = "https://developers.zomato.com/api/v2.1/search?entity_id=" + city + "&entity_type=" + entity_type + "&q="+restName; 
    $.ajax({
        url: querySpecificRest,
        method: "GET",
        headers: { "user-key": apiKey }
    }).then(function (response) {
        var r = response.restaurants[0].restaurant;
        var rl = r.location;
        var ru = r.user_rating;
        // console.log(response);
        if (r.name === restName) {
            specific_rest_id = r.id;

            querySpecificRest = "https://developers.zomato.com/api/v2.1/restaurant?res_id=" + specific_rest_id;
            $.ajax({
                url: querySpecificRest,
                method: "GET",
                headers: { "user-key": apiKey }
            }).then(function (response) {
                specificRest = {
                    "name": r.name,
                    "id": r.id,
                    "image": r.featured_image,
                    "location": {
                        "address": rl.address,
                        "city": rl.city,
                        "latitude": rl.latitude,
                        "longitude": rl.longitude,
                        "zipcode": rl.zipcode
                    },
                    "menu": r.menu_url,
                    "price": r.price_range,
                    "user_rating": {
                        "avg": ru.aggregate_rating,
                        "rating_word": ru.rating_text,
                        "votes": ru.votes
                    }
                }
                initMap();
            });
        }
        else {
            console.log("no restaurant by that name");
        };
    });
};

function capUpper(string) {
    var splitStr = string.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
    console.log(string);
};