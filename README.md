# homebridge-comed-hourlybilling
A [ComEd](https://www.comed.com/Pages/default.aspx) Hourly Billing plugin for
[Homebridge](https://github.com/nfarina/homebridge).  This creates a Light Sensor in homekit,
 where the LUX reading is actually the current hour average price.

This code is heavily based on the work of Stog's [homebridge-fronius-inverter](https://github.com/Stog/homebridge-fronius-inverter) accessory.

# Installation
Run these commands:

    % sudo npm install -g homebridge
    % sudo npm install -g homebridge-comed-hourlybilling


NB: If you install homebridge like this:

    sudo npm install -g --unsafe-perm homebridge

Then all subsequent installations must be like this:

    sudo npm install -g --unsafe-perm homebridge-comed-hourlybilling

# Configuration

Example accessory config (needs to be added to the homebridge config.json):
 ...

		"accessories": [
        	{
				"name": "ComEd Rate",
				"manufacturer": "ComEd",
				"model": "Hourly Billing"
				"accessory": "ComEd Hourly Billing"
        	}
      	]
 ...

### Config Explanation:

Field           			| Description
----------------------------|------------
**accessory**         | (required) Must always be "ComEd Hourly Billing".
**name**              | (required) The name you want to use for for the power level widget.
**manufacturer**			| (optional) This shows up in the homekit accessory Characteristics.
**model**             | (optional) This shows up in the homekit accessory Characteristics.
**refreshInterval**   | (optional) The refresh interval in minutes for polling ComEd.
