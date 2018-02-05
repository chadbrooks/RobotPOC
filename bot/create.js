'use strict';

var iothub = require('azure-iothub');
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client;

var device = {
  robotId: process.env.robotId,
  hospitalCode: process.env.hospitalCode,
  locationCode: process.env.locationCode,
  endorsements: process.env.endorsements,
  robotStatus: process.env.robotStatus
};

console.log('BOT STARTING', device);
var registry = iothub.Registry.fromConnectionString(process.env.IOTHUB_CONSTR);

registry.create({ deviceId: device.robotId }, function(err, deviceInfo, res) {
  if (err) {
    registry.get(device.robotId, printDeviceInfo);
  }
  if (deviceInfo) {
    printDeviceInfo(err, deviceInfo, res)
  }
});

function printDeviceInfo(err, deviceInfo, res) {
  if (deviceInfo) {
    console.log('DEVICE:', deviceInfo);
  }
}

