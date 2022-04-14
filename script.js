function callWeatherAPI(lat, lon, unit) {
  return fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=99bb28ddc7a1edd5945358f2000facb6&units=${unit}`,
    {mode: 'cors'}
  );
};

// function callForecastAPI(city, unit) {
//   return fetch(
//     `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=99bb28ddc7a1edd5945358f2000facb6&units=${unit}`,
//     {mode: 'cors'}
//     );
// };

function callGeoAPI(city) {
  return fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=99bb28ddc7a1edd5945358f2000facb6`,
    {mode: 'cors'}
  );
};

function callOnecallAPI(lat, lon, unit) {
  return fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=99bb28ddc7a1edd5945358f2000facb6&units=${unit}`,
    {mode: 'cors'}
  );
};

async function getGeoData(city) {
  const geoResponse = await callGeoAPI(city);
  const geoResponseData = await geoResponse.json();
  console.log(geoResponseData);
  const geoData = {};
  geoData.name = geoResponseData[0].name;
  geoData.lat = geoResponseData[0].lat;
  geoData.lon = geoResponseData[0].lon;
  // console.log(geoData);
  return geoData;
};

async function getWeatherData(lat, lon, unit) {

  const weatherResponse = await callWeatherAPI(lat, lon, unit);
  const weatherResponseData = await weatherResponse.json();
  // console.log(weatherResponseData);

  const weatherData = {};
  weatherData.weather = weatherResponseData.weather[0];
  weatherData.main = weatherResponseData.main;
  weatherData.name = weatherResponseData.name;
  weatherData.wind = weatherResponseData.wind;
  console.log(weatherData);
  return weatherData;
};

async function getOnecallData(lat, lon, unit) {
  const onecallResponse = await callOnecallAPI(lat, lon, unit);
  const onecallResponseData = await onecallResponse.json();
  console.log(onecallResponseData);

  const onecallData = {};
  onecallData.daily = onecallResponseData.daily;
  console.log(onecallData);
  return onecallData;
};

function findDay(dt) {
  const dayNum = (new Date(dt * 1000)).getDay();
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[dayNum];
}

function createForecastDOM(forecastData, i) {
  const forecastDiv = document.createElement('div');
  forecastDiv.className = 'forecast';

  const day = document.createElement('p');
  day.className = 'forecast-day';
  if (i === 0) {
    day.textContent = 'today';
  } else {
    day.textContent = `${findDay(forecastData.daily[i].dt)}`;
  }

  const icon = document.createElement('img');
  icon.className = 'forecast-icon';
  icon.src = `http://openweathermap.org/img/wn/${forecastData.daily[i].weather[0].icon}@2x.png`;

  const tempHighLow = document.createElement('p');
  tempHighLow.className = 'forecast-temphighlow';
  tempHighLow.textContent = 
  `H: ${Math.round(forecastData.daily[i].temp.max)}° L: ${Math.round(forecastData.daily[i].temp.min)}°`;

  forecastDiv.append(day, icon, tempHighLow);

  return forecastDiv;
}

function forecastApeendDOM(forecastData) {
  let forecastDivs = [];
  for (let i = 0; i < 5; i++) {
    const forecastDiv = createForecastDOM(forecastData, i);
    forecastDivs.push(forecastDiv);
  }

  const newForecastDiv = document.createElement('div');
  newForecastDiv.className = 'forecast-container';
  newForecastDiv.append(...forecastDivs);

  const forecastDiv = document.querySelector('.forecast-container');
  forecastDiv.replaceWith(newForecastDiv);
};

function weatherAppendDOM(weatherData) {
  const name = document.createElement('p');
  name.className = 'weather-name';
  name.textContent = weatherData.name;
  
  const temp = document.createElement('p');
  temp.className = 'weather-temp';
  temp.textContent = `${Math.round(weatherData.main.temp)}°`;

  const description = document.createElement('p');
  description.className = 'weather-description';
  description.textContent = weatherData.weather.description;

  const tempHighLow = document.createElement('p');
  tempHighLow.className = 'weather-temphighlow';
  tempHighLow.textContent = 
  `H: ${Math.round(weatherData.main.temp_max)}° L: ${Math.round(weatherData.main.temp_min)}°`;

  const newWeatherDiv = document.createElement('div');
  newWeatherDiv.className = 'weather-container';
  newWeatherDiv.append(name, temp, description, tempHighLow);

  const weatherDiv = document.querySelector('.weather-container');
  weatherDiv.replaceWith(newWeatherDiv);
};

async function toggleUnit() {
  const btnUnitToggle = document.querySelector('.toggle input');
  const nameDiv = document.querySelector('.weather-name');
  if (nameDiv) {
    const unit = btnUnitToggle.checked ? 'imperial' : 'metric';
    const geoData = await getGeoData(initialize.currentCity);
    console.log(geoData);
    const weatherData = await getWeatherData(geoData.lat, geoData.lon, unit);
    const forecastData = await getOnecallData(geoData.lat, geoData.lon, unit);
    weatherAppendDOM(weatherData);
    forecastApeendDOM(forecastData);
  }
};

async function submit(e) {
  e.preventDefault();
  const inputSearch = document.querySelector('#input-search');
  const btnUnitToggle = document.querySelector('.toggle input');
  const formSearch = document.querySelector('form');

  const city = inputSearch.value || initialize.currentCity;
  const unit = btnUnitToggle.checked ? 'imperial' : 'metric';
  const geoData = await getGeoData(city);
  const weatherData = await getWeatherData(geoData.lat, geoData.lon, unit);
  const forecastData = await getOnecallData(geoData.lat, geoData.lon, unit);
  weatherAppendDOM(weatherData);
  forecastApeendDOM(forecastData);
  initialize.currentCity = geoData.name;
  formSearch.reset();
  inputSearch.focus();
};

const initialize = (() => {
  let currentCity = 'toronto';
  async function start() {
    const inputSearch = document.querySelector('#input-search');
    const formSearch = document.querySelector('form');
    inputSearch.focus();
    formSearch.onsubmit = submit;
  
    const btnUnitToggle = document.querySelector('.toggle input');
    btnUnitToggle.onclick = toggleUnit;

    const unit = btnUnitToggle.checked ? 'imperial' : 'metric';
    const geoData = await getGeoData(currentCity);
    const weatherData = await getWeatherData(geoData.lat, geoData.lon, unit);
    const forecastData = await getOnecallData(geoData.lat, geoData.lon, unit);
    weatherAppendDOM(weatherData);
    forecastApeendDOM(forecastData);
  };
  return {currentCity, start};
})();

initialize.start();

// let currentCity = 'toronto';
// const inputSearch = document.querySelector('#input-search');
// const formSearch = document.querySelector('form');
// inputSearch.focus();
// formSearch.onsubmit = submit;

// const btnUnitToggle = document.querySelector('.toggle input');
// btnUnitToggle.onclick = toggleUnit;


