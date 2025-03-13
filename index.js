let header = document.getElementById("city");
let temp = document.getElementById("temp");
let high = document.getElementById("high");
let low = document.getElementById("low");
let weather = document.getElementById("weather");

navigator.geolocation.getCurrentPosition(success, error);

function success(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    console.log(`Latitude: ${lat}, Longitude: ${lon}`);
    getWeather(lat, lon); // Get weather directly with coordinates
}

function error() {
    console.log("Unable to retrieve location");
}

function convertUnixTimestamp(timestamp) {
    let date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function updateBackground(weatherCode, isDay) {
    let backgroundImage = "";

    if (!isDay) {
        backgroundImage = "night.png";
    } else {
        if (weatherCode === "Clear") {
            backgroundImage = "clear.png";
        } else if (weatherCode === "Few clouds") {
            backgroundImage = "clouds.png";
        } else if (weatherCode.includes("Clouds")) {
            backgroundImage = "cloudy.png";
        } else if (weatherCode.includes("Rain")) {
            backgroundImage = "rain.png";
        } else {
            backgroundImage = "clear.png";
        }
    }
    document.body.style.backgroundImage = `url('assets/${backgroundImage}')`;
}

async function getWeather(lat, lon) {
    let apiKey = "6b519ffe9190da1090d6f5882b99b565"; // Replace with your real API key
    let url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.cod === "200") {
            let city = data.city.name; // Get city name from API
            let forecasts = data.list;
            let currentTemp = forecasts[0].main.temp;
            let highTemp = Math.max(...forecasts.slice(0, 8).map(f => f.main.temp));
            let lowTemp = Math.min(...forecasts.slice(0, 8).map(f => f.main.temp));
            let weatherCode = forecasts[0].weather[0].main;
            let now = Math.floor(Date.now() / 1000);
            let isDay = now > data.city.sunrise && now < data.city.sunset;

            header.innerHTML = city;
            temp.innerHTML = Math.round(currentTemp) + "°C";
            high.innerHTML = Math.round(highTemp) + "°C";
            low.innerHTML = Math.round(lowTemp) + "°C";
            weather.innerHTML =
                forecasts[0].weather[0].description.charAt(0).toUpperCase() +
                forecasts[0].weather[0].description.slice(1) +
                ", feels like " +
                Math.round(forecasts[0].main.feels_like) +
                "°C" +
                "<br>Sunrise " +
                convertUnixTimestamp(data.city.sunrise) +
                ", Sunset " +
                convertUnixTimestamp(data.city.sunset);

            updateBackground(weatherCode, isDay);
        } else {
            console.log("City not found!");
        }
    } catch (error) {
        console.log("Error fetching data:", error);
    }
}
