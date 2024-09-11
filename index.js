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
const localhostLocation = {
    geonames_id: 1141909415,
    latitude: 21.307796478271484,
    longitude: -157.85919189453125,
    zip: '96801',
    continent: {
      code: 'NA',
      name: 'North America',
      name_translated: 'North America',
      geonames_id: 6255149,
      wikidata_id: 'Q49'
    },
    country: {
      alpha2: 'US',
      alpha3: 'USA',
      calling_codes: [ '+1' ],
      currencies: [ [Object] ],
      emoji: '🇺🇸'  ,
      ioc: 'USA',
      languages: [ [Object] ],
      name: 'United States',
      name_translated: 'United States',
      timezones: [
        'America/New_York',
        'America/Detroit',
        'America/Kentucky/Louisville',
        'America/Kentucky/Monticello',
        'America/Indiana/Indianapolis',
        'America/Indiana/Vincennes',
        'America/Indiana/Winamac',
        'America/Indiana/Marengo',
        'America/Indiana/Petersburg',
        'America/Indiana/Vevay',
        'America/Chicago',
        'America/Indiana/Tell_City',
        'America/Indiana/Knox',
        'America/Menominee',
        'America/North_Dakota/Center',
        'America/North_Dakota/New_Salem',
        'America/North_Dakota/Beulah',
        'America/Denver',
        'America/Boise',
        'America/Phoenix',
        'America/Los_Angeles',
        'America/Anchorage',
        'America/Juneau',
        'America/Sitka',
        'America/Metlakatla',
        'America/Yakutat',
        'America/Nome',
        'America/Adak',
        'Pacific/Honolulu'
      ],
      is_in_european_union: false,
      fips: 'US',
      geonames_id: 85633793,
      hasc_id: 'US',
      wikidata_id: 'Q30'
    },
    city: {
      fips: null,
      alpha2: null,
      geonames_id: 1141909415,
      hasc_id: null,
      wikidata_id: 'Q18094',
      name: 'Honolulu',
      name_translated: 'Honolulu'
    },
    region: {
      fips: 'US15',
      alpha2: 'US-HI',
      geonames_id: 85688671,
      hasc_id: 'US.HI',
      wikidata_id: 'Q782',
      name: 'Hawaii',
      name_translated: 'Hawaii'
    }
  };

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }) );
app.set("trust proxy", true);
app.use(express.json());

const ipBase = new Ipbase(ipBaseAPIKey);

const fahrenheitCountries = ["United States", "Bahamas", "Cayman Islands", "Palau", "Micronesia", "Marshall Islands"]; 

app.get('/', async (req, res) => {
    try {
        let userIP = req.ip;
        console.log("Client IP Address: " + userIP);

        let location;

        if (userIP == "::1") {
            // if localhost use location information for 4.4.4.4
            location = localhostLocation;
        }
        else {
            const result = await ipBase.info({
                ip: userIP
            });

            location = result.data.location;
        }

        const address = location.city.name + ", " + location.region.name + ", " + location.country.name;

        console.log("Client City: " + address);

        const units = fahrenheitCountries.includes(location.country.name) ? "imperial" : "metric";

        const weather = await axios.get(weatherURL, {
            params: {
                lat: location.latitude,
                lon: location.longitude,
                appid: weatherAPIKey,
                units: units
            }
        });

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
        
        console.log(`Forecast is: ${description} ${temperature} Humidity: ${humidity} ${wind}`);

        res.render("index.ejs", {address, description, icon, units, temperature, humidity, wind});
    } catch (error) {
        console.log(error);
        res.render("index.ejs", {error});
    }
});

app.listen(port, ()=> {
    console.log("Listening on port " + port);
});