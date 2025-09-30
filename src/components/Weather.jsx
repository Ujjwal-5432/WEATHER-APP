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
  const [loading, setLoading] = useState(false);
  const [lastSearchedCity, setLastSearchedCity] = useState("");

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
    if (city === "") {
      alert("Enter city name");
      return;
    }
    setLoading(true);
    try {
      // Current weather data
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${
        import.meta.env.VITE_APP_ID
      }`;
      const currentResponse = await fetch(currentWeatherUrl);
      const currentData = await currentResponse.json();
      
      if(!currentResponse.ok){
        alert(currentData.message);
        setLoading(false);
        return;
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
      
      // Save last searched city
      setLastSearchedCity(currentData.name);
      
      // 5-day forecast data
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${
        import.meta.env.VITE_APP_ID
      }`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();
      
      if(!forecastResponse.ok){
        console.error(forecastData.message);
        setLoading(false);
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
    setLoading(false);
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
    <div className="weather-container">
      {/* Animated Background Elements */}
      <div className="background-orb orb-1"></div>
      <div className="background-orb orb-2"></div>

      <div className="weather">
        {/* Search Bar */}
        <div className="search-bar">
          <input 
            ref={inputRef} 
            type="text" 
            placeholder="Search for a city..." 
            className="search-input"
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
            className="search-btn"
          />
        </div>

        {/* Last Searched City */}
        {lastSearchedCity && (
          <div className="last-searched">
            <span className="last-searched-label">Last searched:</span>
            <span className="last-searched-city">{lastSearchedCity}</span>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Fetching weather data...</p>
          </div>
        ) : weatherData ? (
          <>
            {/* Current Weather */}
            <div className="current-weather">
              <div className="weather-left">
                <p className="location">{weatherData.location}</p>
                <p className="temperature">{weatherData.temperature}°</p>
                <p className="description">{weatherData.description}</p>
              </div>
              <div className="weather-right">
                <img src={weatherData.icon} className="weather-icon" alt="Weather" />
              </div>
            </div>
            
            {/* Weather Stats */}
            <div className="weather-data">
              <div className="stat-card">
                <div className="stat-gradient"></div>
                <img src={humidity_icon} alt="Humidity" />
                <div className="stat-info">
                  <p className="stat-value">{weatherData.humidity}%</p>
                  <span className="stat-label">Humidity</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-gradient"></div>
                <img src={wind_icon} alt="Wind" />
                <div className="stat-info">
                  <p className="stat-value">{weatherData.windSpeed}</p>
                  <span className="stat-label">Wind km/h</span>
                </div>
              </div>
            </div>
            
            {/* 5-Day Forecast */}
            {forecastData.length > 0 && (
              <div className="forecast-container">
                <h3>5-Day Forecast</h3>
                <div className="forecast-items">
                  {forecastData.map((day, index) => (
                    <div key={index} className="forecast-item">
                      <div className="forecast-accent"></div>
                      <p className="forecast-day">{day.day}</p>
                      <img src={day.icon} className="forecast-icon" alt="Forecast" />
                      <p className="forecast-temp">{day.temp}°</p>
                      <p className="forecast-desc">{day.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🌤️</div>
            <p className="empty-title">No Data Yet</p>
            <p className="empty-subtitle">Search for a city to see weather information</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;