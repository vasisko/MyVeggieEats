var initMapLat;
var initMapLng;

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center:{ lat: initMapLat, lng: initMapLng}
    });

    
    // array of all the restaurants, with coordinates for its markers
    var markers=[];

    //if not searching a sepcific restaurant, run code
    if (generalSearch) {
        for (var i=0; i<allRestaurants.length; i++){
            var latInt = parseFloat(allRestaurants[i].location.latitude);
            var longInt=parseFloat(allRestaurants[i].location.longitude);
            markers[i] = {
                coords:{
                lat: latInt,
                lng: longInt
                },
                name: allRestaurants[i].name,
                imageURL: allRestaurants[i].image,
                avgRating: allRestaurants[i].user_rating.avg,
                address: allRestaurants[i].location.address,
                priceRange:getDollarSigns(allRestaurants[i].price)
                
            }
        };
    }

    // if specific restaurant is called, run code below
    if (!generalSearch) {
        var latInt = parseFloat(specificRest.location.latitude);
        var longInt=parseFloat(specificRest.location.longitude);
        markers = {
            coords:{
            lat: latInt,
            lng: longInt
            },
            name: specificRest.name,
            imageURL: specificRest.image,
            avgRating: specificRest.user_rating.avg,
            address: specificRest.location.address,
            priceRange:getDollarSigns(specificRest.price)
        }
    }



    function getDollarSigns(price) {                    // get the average price (#/5) in $ signs
        switch (price) {

            case 1:
                return "$"
                break;
            case 2:
                return "$$"
                break;
            case 3:
                return "$$$"
                break;

            case 4:
                return "$$$$"
                break;
            case 5:
                return "$$$$$"
                break;

            default:
        }
    }

    //if not searching a specific restaurant, add markers for all restaurants
    if (generalSearch) {
        for (var i = 0; i < markers.length; i++) {
            addRestaurantMarker(markers[i]);
        }
    }

    //if search a specific restaurant, only add one marker
    if (!generalSearch) {
        addRestaurantMarker(markers);
    }
    
    // Add a new restaurant marker 
    function addRestaurantMarker(newMarker) {
        var marker = new google.maps.Marker({
            position: newMarker.coords,
            map: map,
           // icon: "https://upload.wikimedia.org/wikipedia/en/2/24/SpongeBob_SquarePants_logo.svg"
           //icon: "https://cdn3.iconfinder.com/data/icons/food-set-3/91/Food_C235-20.png"          // leaf
           icon: "https://cdn3.iconfinder.com/data/icons/food-set-3/91/Food_C230-24.png"            // avacado image
        });

        // is there a specific icon to display? if so, set it. 
        if (newMarker.iconImage) {
            marker.setIcon(newMarker.iconImage);
        }

        // is there name to display? if so, display when icon is clicked
        if (newMarker.name) {
            var infoWindow = new google.maps.InfoWindow({
                content: newMarker.name
            });

            marker.addListener('click', function () {
                infoWindow.open(map, marker);
                if(newMarker.imageURL){
                $("#restaurant-photo").html(`<img src=${newMarker.imageURL}  class="responsive-img">`);
                }
                else{
                    var stockImage = "http://img1.cookinglight.timeinc.net/sites/default/files/styles/4_3_horizontal_-_1200x900/public/image/2017/07/main/veggie-tofu-stir-fry-ck.jpg?itok=V88FQY4y";
                    $("#restaurant-photo").html(`<img src=${stockImage} class="responsive-img">`);  
                }
                $("#restaurants-big").html(` <h2>${newMarker.name}</h2> <hr>`);

                $("#restaurant-info").html(`User Rating: ${newMarker.avgRating} <br><br>
                Average Price: ${newMarker.priceRange} <br> <br>Address: ${newMarker.address}`);
            

                
            });
        }
    }


}

//get info from form
// var getAddress=$("#getAddress");
var getAddress;
var getCity;

//var for functions below
var userZip;
var userAddress;
var userCity;
var queryUrlLatLng;

//makes user inputed address ready for google query
function formatAddress(string, separator){
    // console.log(string);
    // console.log(getAddress, getCity);
    if (string===getAddress){
        userAddress=string.split(separator);
        userAddress=userAddress.join("+");
        console.log(userAddress);
    }
    else{
        userCity=string.split(separator).join("+");
        console.log(userCity);
    }
};

//ajax call to get latitude and longitude from user address
function getLatLng(){
    queryUrlLatLng="https://maps.googleapis.com/maps/api/geocode/json?address="+userAddress+",+"+userCity+",+"+userZip+"&key=AIzaSyCwhOakfPVFjGYSWZ9KwaM8EH9lqw5cY1A";
    //above key is from kris, links to script tag at bottom of html

    console.log(queryUrlLatLng);
    $.ajax({
        url:queryUrlLatLng,
        method:"GET"
    }).then(function(response){
        console.log(response);
        initMapLat=response.results[0].geometry.location.lat;
        initMapLng=response.results[0].geometry.location.lng;
        initMap();
    });
};