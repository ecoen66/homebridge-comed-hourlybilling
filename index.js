const axios = require('axios');
const api = axios.create({})


var Service, Characteristic;

const DEF_MIN_LUX = 0,
      DEF_MAX_LUX = 10000;

const interval = 15 // Minutes

const PLUGIN_NAME   = 'homebridge-comed-hourlybilling';
const ACCESSORY_NAME = 'ComEd Hourly Billing';

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory(PLUGIN_NAME, ACCESSORY_NAME, HourlyBilling);
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
			this.refreshInterval = config["refreshInterval"] === undefined ? (interval * 60000) : (config["refreshInterval"] * 60000)
			this.timer = setTimeout(this.poll.bind(this), this.refreshInterval)
			this.poll()
    }

    getServices () {
    	const informationService = new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
        .setCharacteristic(Characteristic.Model, this.model)
	    return [informationService, this.service]
    }

	async poll() {
		if(this.timer) clearTimeout(this.timer)
		this.timer = null
		try {
	    const hourlyData = await api.get('https://hourlypricing.comed.com/api?type=currenthouraverage')
				.catch(err => {
						this.log.error('Error getting current billing rate %s',err)
				})
			if(hourlyData) {
				this.log.info('Data from API', hourlyData.data[0].price);
				if (hourlyData.data[0].price == null) {
					this.service.getCharacteristic(Characteristic.CurrentAmbientLightLevel).updateValue(0)
					} else {
					// Return positive value
					this.service.getCharacteristic(Characteristic.CurrentAmbientLightLevel).updateValue( Math.abs(hourlyData.data[0].price, 1))
				}
			} else {
				// No response hourlyData return 0
				this.service.getCharacteristic(Characteristic.CurrentAmbientLightLevel).updateValue(0)
			}
		} catch (error) {
				console.error(error)
		}
		this.timer = setTimeout(this.poll.bind(this), this.refreshInterval)
	}
}
