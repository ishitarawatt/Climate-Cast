const cityInput = document.querySelector(".search-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".f-values");

const API_KEY = "c3fd88b620ffab566e3163526a454287";

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="top-weather">
				<img class="weather-logo" src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png"></img>
				<div class="temperature">
				<h1>${(weatherItem.main.temp - 273.15).toFixed(2)}<span class="celcius">°C</span></h1>
				<p>${weatherItem.weather[0].description}</p>
				</div>
				</div>
        <div class="quality">
          <div class="card">
            <p class="a-amount">${weatherItem.main.pressure}</p>
            <p class="a-text">Pressure</p>
          </div>
          <div class="card">
            <p class="a-amount">${weatherItem.main.humidity}</p>
            <p class="a-text">Humidity</p>
          </div>
          <div class="card">
            <p class="a-amount">${weatherItem.wind.speed} M/S</p>
            <p class="a-text">Wind Speed</p>
          </div>
          <div class="card">
            <p class="a-amount">${weatherItem.wind.gust}</p>
            <p class="a-text">Gust</p>
          </div>
          <div class="card">
            <p class="a-amount">${(weatherItem.main.temp_min - 273.15).toFixed(2)} °C</p>
            <p class="a-text">Min Temperature</p>
          </div>
          <div class="card">
            <p class="a-amount">${(weatherItem.main.temp_max - 273.15).toFixed(2)} °C</p>
            <p class="a-text">Max Temperature</p>
          </div>
        </div>
        <div class="location">
					<ul>
						<li>${cityName}</li>
						<li><span id="date">${weatherItem.dt_txt.split(" ")[0]}</span><span id="time"></span></li>
					</ul>
				</div>
			</div>`
    } else {
        return `<li class="values">
        <h4>${weatherItem.dt_txt.split(" ")[0]}</h4>
        <h4>${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4>${weatherItem.wind.speed} m/s</h4>
        <h4>${weatherItem.main.humidity}%</h4>
        </li>`;
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt);
                const forecastDay = forecastDate.getDate();
                if (!uniqueForecastDays.includes(forecastDay)) {
                    uniqueForecastDays.push(forecastDay);
                    return true;
                }
                return false;
            });

            cityInput.value= ""
            weatherCardsDiv.innerHTML = "";
            currentWeatherDiv.innerHTML = "";

            console.log(fiveDaysForecast);
            fiveDaysForecast.forEach((weatherItem, index) => {
                if(index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
                
            });
        }).catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
};

const getCityCoordinates = () => {
        const cityName = cityInput.value.trim();
        if(!cityName) return;
        const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

        fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
            if(!data.length) return alert(`No coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        }).catch(() => {
            alert("An error occurred while fetching the coordinates!")
        });
}

    const getUserCoordinates = () => {
        navigator.geolocation.getCurrentPosition(
                position => {
                    const {latitude, longitude} = position.coords;
                    const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
                    fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                        const { name } = data[0];
                        getWeatherDetails(name, latitude, longitude);
                    }).catch(() => {
                        alert("An error occurred while fetching the city!")
                    }); 
                },
                error => {
                    if(error.code === error.PERMISSION_DENIED) {
                        alert("Geolocation request denied. Please reset location permission to grant access again.");
                    }
                }
        );
    }

    locationButton.addEventListener("click", getUserCoordinates);
    searchButton.addEventListener("click", getCityCoordinates);
    cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());

