import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import Ipbase from '@everapi/ipbase-js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const weatherURL = "https://api.openweathermap.org/data/2.5/weather";
const weatherAPIKey = process.env.weatherAPIKey;
const ipBaseAPIKey = process.env.ipBaseAPIKey;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }) );
app.set("trust proxy", true);
app.use(express.json());

const ipBase = new Ipbase(ipBaseAPIKey);

const fahrenheitCountries = ["United States", "Bahamas", "Cayman Islands", "Palau", "Micronesia", "Marshall Islands"]; 

app.get('/', async (req, res) => {
    let userIP = req.ip;
    if (userIP == "::1") {
        // if localhost set user's IP to a random location
        userIP = "4.4.4.4";
    }
    try {
        console.log("Client IP Address: " + userIP)
        const result = await ipBase.info({
            ip: userIP
        });        
        console.log("IP Location: ");
        const location = result.data.location;
        console.log(location);

        const units = fahrenheitCountries.includes(location.country.name) ? "imperial" : "metric";

        const weather = await axios.get(weatherURL, {
            params: {
                lat: location.latitude,
                lon: location.longitude,
                appid: weatherAPIKey,
                units: units
            }
        });
        console.log("Weather Call: ")
        console.log(weather.data);

        const address = location.city.name + ", " + location.region.name + ", " + location.country.name;
        const description = weather.data.weather[0].description;
        const icon  = weather.data.weather[0].icon;
        const temp = weather.data.main.temp;
        const humidity = weather.data.main.humidity; 
        const windSpeed = weather.data.wind.speed;
        let wind, temperature;
        
        if (units === "metric") {
            wind =  (windSpeed * 3.6).toPrecision(3) + " KM/H";
            temperature = temp = " ° C"; 
        }
        else {
            wind =  windSpeed + " MPH";
            temperature = temp + " ° F"; 
        }       

        res.render("index.ejs", {address, description, icon, units, temperature, humidity, wind});
    } catch (error) {
        console.log(error);
        res.render("index.ejs", {error});
    }
});

app.listen(port, ()=> {
    console.log("Listening on port " + port);
});