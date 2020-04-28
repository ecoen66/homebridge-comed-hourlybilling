const axios = require('axios');
const setupCache = require('axios-cache-adapter').setupCache;

var Service, Characteristic;

const DEF_MIN_LUX = 0,
      DEF_MAX_LUX = 10000;

const PLUGIN_NAME   = 'homebridge-comed-hourlybilling';
const ACCESSORY_NAME = 'ComEd Hourly Billing';

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory(PLUGIN_NAME, ACCESSORY_NAME, HourlyBilling);
}

/**
 * Setup Cache For Axios to prevent additional requests
 */
const cache = setupCache({
  maxAge: 5 * 1000 //in ms
})

const api = axios.create({
  adapter: cache.adapter
})

/**
 * Main API request with site overview data
 *
 * @param {siteID} the SolarEdge Site ID to be queried
 * @param {apiKey} the SolarEdge monitoring API Key for access to the Site
 */
const getHourlyData = async() => {
	try {
	    return await api.get('https://hourlypricing.comed.com/api?type=currenthouraverage')
	} catch (error) {
	    console.error(error)
	}
}

/**
 * Gets and returns the accessory's value in the correct format.
 *
 * @param {siteID} the SolarEdge Site ID to be queried
 * @param {apiKey} the SolarEdge monitoring API Key for access to the Site
 * @param (log) access to the homebridge logfile
 * @return {bool} the value for the accessory
 */
const getHourlyValue = async (log) => {

	// To Do: Need to handle if no connection
	const hourlyData = await getHourlyData()

	if(hourlyData) {
		log.info('Data from API', hourlyData.data[0].price);
		if (hourlyData.data[0].price == null) {
			return 0
		} else {
			// Return positive value
			return Math.abs(hourlyData.data[0].price, 1)
		}
	} else {
		// No response hourlyData return 0
		return 0
	}
}

class HourlyBilling {
    constructor(log, config) {
    	this.log = log
    	this.config = config

    	this.service = new Service.LightSensor(this.config.name)

    	this.name = config["name"];
    	this.manufacturer = config["manufacturer"] || "ComEd";
	    this.model = config["model"] || "Hourly Billing";
	    this.minLux = config["min_lux"] || DEF_MIN_LUX;
    	this.maxLux = config["max_lux"] || DEF_MAX_LUX;
    }

    getServices () {
    	const informationService = new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
        .setCharacteristic(Characteristic.Model, this.model)

        this.service.getCharacteristic(Characteristic.CurrentAmbientLightLevel)
	      .on('get', this.getOnCharacteristicHandler.bind(this))

	    return [informationService, this.service]
    }

    async getOnCharacteristicHandler (callback) {
	    this.log(`calling getOnCharacteristicHandler`, await getHourlyValue(this.log))

	    callback(null, await getHourlyValue(this.log))
	}
}
