const userTab=document.querySelector("[data-userWeather]");
const searchTab=document.querySelector("[data-searchWeather]");
const userContainer=document.querySelector(".weather-container");
const grantAccessContainer=document.querySelector(".grant-location-container");
const searchForm=document.querySelector("[data-searchForm]");
const loadingScreen=document.querySelector(".loading-container");
const userInfoContainer=document.querySelector(".user-info-container");

//initially variables need to be defined
let currentTab=userTab;
const API_key="1cf6b48b32ae4c08b85029712cd1b4ad";
currentTab.classList.add("current-tab");

//ek kaam krna hai


function switchTab(clickedTab){
    if(clickedTab!=currentTab){
        currentTab.classList.remove("current-tab");
        currentTab=clickedTab;
        currentTab.classList.add("current-tab");
        if(!searchForm.classList.contains("active")){
            //if search form is not active, make it active
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }else{
            //if search form is active, make it inactive
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //now we need to check if user had already granted the location access or not
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click",() =>{
//pass clicked tab as input parameter
switchTab(userTab);
});
searchTab.addEventListener("click",() =>{
//pass clicked tab as input parameter 
switchTab(searchTab);
});

//check if cordinates are already present in session storage
function getfromSessionStorage(){
    const localCoordinates=sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        //if local coordinates not found
        grantAccessContainer.classList.add("active");
    }else{
        const coordinates=JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}
//async function because we are calling an API
async function fetchUserWeatherInfo(coordinates){
    const {lat,lon}=coordinates;
    //make grant container invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");
    //API call
    try{
        const response=await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`
        );
        const data=await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }catch(err){
        loadingScreen.classList.remove("active");   
        //handle error here
        console.log("error found");
    }
}

function renderWeatherInfo(weatherInfo){
//firstly we have to fetch the elements
const cityName=document.querySelector("[data-cityName]");
const countryIcon=document.querySelector("[data-countryIcon]");
const desc=document.querySelector("[data-weatherDesc]");
const weatherIcon=document.querySelector("[data-weatherIcon]");
const temp=document.querySelector("[data-temp]");
const windSpeed=document.querySelector("[data-windSpeed]");
const humidity=document.querySelector("[data-humidity]");
const cloudiness=document.querySelector("[data-cloudiness]");

//fetch values from weatherInfo object and put it in UI elements
cityName.innerText=weatherInfo?.name;
countryIcon.src=`https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
desc.innerText=weatherInfo?.weather?.[0]?.description;
weatherIcon.src=`http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
temp.innerText=`${weatherInfo?.main?.temp} °C`;
windSpeed.innerText=`${weatherInfo?.wind?.speed} m/s`;
humidity.innerText=`${weatherInfo?.main?.humidity} %`;
cloudiness.innerText=`${weatherInfo?.clouds?.all} %`;
}

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        //if browser does not support geolocation show alert
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position){
    const userCoordinates={
        lat:position.coords.latitude,
        lon:position.coords.longitude,
    };
    //store coordinates in session storage
    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton=document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click",getLocation);

const searchInput=document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName==="") return;
    else{
        fetchSearchWeatherInfo(cityName);
    }
});

async function fetchSearchWeatherInfo(city){
    //make loader visible
    loadingScreen.classList.add("active");
    //make user info container invisible
    document.querySelector(".error-container").classList.remove("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    //API call
    try{
        const response=await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`);
        const data=await response.json();
        loadingScreen.classList.remove("active");
        if (data.cod === "404" || data.cod === 404) {
            document.querySelector(".error-container").classList.add("active");
            return;
        }
        // SHOW WEATHER UI
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);

    } catch(err) {
        loadingScreen.classList.remove("active");
        console.log("error:", err);
    }
}


getfromSessionStorage();

