import React, { useEffect, useRef, useState } from "react";
import "./Weather.css";
import search_icon from "../assets/search.png";
import clear_icon from "../assets/clear.png";
import cloud_icon from "../assets/cloud.png";
import drizzle_icon from "../assets/drizzle.png";
import rain_icon from "../assets/rain.png";
import snow_icon from "../assets/snow.png";
import wind_icon from "../assets/wind.png";
import humidity_icon from "../assets/humidity.png";

const Weather = () => {
  const inputRef = useRef();
  const [weatherData, setWeatherData] = useState(false);
  const [forecastData, setForecastData] = useState([]);

  const allIcons = {
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": cloud_icon,
    "03n": cloud_icon,
    "04d": drizzle_icon,
    "04n": drizzle_icon,
    "09d": rain_icon,
    "09n": rain_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "13d": snow_icon,
    "13n": snow_icon,
  };
  
  const search = async (city) => {
    if (city == "") {
      alert("Enter city name");
      return;
    }
    try {
      // Current weather data
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${
        import.meta.env.VITE_APP_ID
      }`;
      const currentResponse = await fetch(currentWeatherUrl);
      const currentData = await currentResponse.json();
      
      if(!currentResponse.ok){
        alert(currentData.message)
        return
      }
      
      console.log(currentData);
      const icon = allIcons[currentData.weather[0].icon] || clear_icon;
      setWeatherData({
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed,
        temperature: Math.floor(currentData.main.temp),
        location: currentData.name,
        icon: icon,
        description: currentData.weather[0].description
      });
      
      // 5-day forecast data
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${
        import.meta.env.VITE_APP_ID
      }`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();
      
      if(!forecastResponse.ok){
        console.error(forecastData.message);
        return;
      }
      
      console.log("Forecast data:", forecastData);
      
      // Process forecast data to get one forecast per day
      const dailyForecasts = processForecastData(forecastData.list);
      setForecastData(dailyForecasts);
      
    } catch (error) {
      setWeatherData(false);
      setForecastData([]);
      console.log(error);
    }
  };
  
  // Process forecast data to get one forecast per day
  const processForecastData = (forecastList) => {
    const dailyData = [];
    const today = new Date().getDate();
    
    // Group forecasts by day
    const dailyMap = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.getDate();
      
      // Skip today's forecast
      if (day === today) {
        return;
      }
      
      // Use the date as the key
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = {
          date: date,
          icon: allIcons[item.weather[0].icon] || clear_icon,
          temp: Math.floor(item.main.temp),
          description: item.weather[0].description,
          day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
        };
      }
    });
    
    // Convert map to array and take only 5 days
    Object.values(dailyMap).forEach(day => {
      if (dailyData.length < 5) {
        dailyData.push(day);
      }
    });
    
    return dailyData;
  };

  useEffect(() => {
    search("jhansi");
  }, []);

  return (
    <div className="weather">
      <div className="search-bar">
        <input 
          ref={inputRef} 
          type="text" 
          placeholder="Search city..." 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              search(inputRef.current.value);
            }
          }}
        />
        <img
          onClick={() => search(inputRef.current.value)}
          src={search_icon}
          alt="Search"
        />
      </div>
      
      {weatherData ? (
        <>
          <div className="current-weather">
            <div className="weather-left">
              <p className="temperature">{weatherData.temperature}°C</p>
              <p className="location">{weatherData.location}</p>
              {weatherData.description && (
                <p className="forecast-desc">{weatherData.description}</p>
              )}
            </div>
            <div className="weather-right">
              <img src={weatherData.icon} className="weather-icon" alt="Weather" />
            </div>
          </div>
          
          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} alt="Humidity" />
              <div>
                <p>{weatherData.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className="col">
              <img src={wind_icon} alt="Wind" />
              <div>
                <p>{weatherData.windSpeed} km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
          
          {/* 5-Day Forecast Section */}
          {forecastData.length > 0 && (
            <div className="forecast-container">
              <h3>5-Day Forecast</h3>
              <div className="forecast-items">
                {forecastData.map((day, index) => (
                  <div key={index} className="forecast-item">
                    <p className="forecast-day">{day.day}</p>
                    <img src={day.icon} className="forecast-icon" alt="Forecast" />
                    <p className="forecast-temp">{day.temp}°C</p>
                    <p className="forecast-desc">{day.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="loading">
          <p>Search for a city to see weather information</p>
        </div>
      )}
    </div>
  );
};

export default Weather;
