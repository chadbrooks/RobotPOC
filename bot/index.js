'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var { exec } = require('child_process');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var iothub = require('azure-iothub');
var azure = require('azure-storage');
var blobSvc = azure.createBlobService();

var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client;

var deviceMetadata = {
    robotId: process.env.robotId,
    hospitalCode: process.env.hospitalCode,
    locationCode: process.env.locationCode,
    endorsements: process.env.endorsements,
    robotStatus: process.env.robotStatus
};

const encPolicy = process.env.ENC_POLICY;
const decPolicy = process.env.DEC_POLICY;
const pathTemplate = '/tmp/devices/%s/%s/';
const complaintTemplate = '/tmp/complaints/%s';
const complaintData = '/home/strykerpoc/code/data/%s.mp4';
const decScript = '/home/strykerpoc/device-authority-cli-212/run.sh -d "file" -p "%s" -i "%s" -o "%s"';
const encScript = '/home/strykerpoc/device-authority-cli-212/run.sh -e "file" -p "%s" -i "%s" -o "%s"';

console.log('BOT STARTING', deviceMetadata);
var constr = 'HostName=dapoc.azure-devices.net;DeviceId=%s;SharedAccessKey=%s';
var registry = iothub.Registry.fromConnectionString(process.env.IOTHUB_CONSTR);

registry.create({ deviceId: deviceMetadata.robotId }, function(err, deviceInfo, res) {
    if (err) {
        registry.get(deviceMetadata.robotId, startDevice);
    }
    if (deviceInfo) {
        startDevice(err, deviceInfo, res)
    }
});

function startDevice(err, device) {
    if (err) throw err;

    var connectionString = util.format(constr, device.deviceId, device.authentication.symmetricKey.primaryKey);
    console.log('device connecting to', connectionString);
    var client = DeviceClient.fromConnectionString(connectionString, Mqtt);
    client.open(function(err) {
        if (err) throw err;

        forceTwinSync(client, deviceMetadata);
        client.onDeviceMethod('sendComplaintData', function(req, res) {
            var dataPath = util.format(complaintData, req.payload.requestId);
            console.log('received', dataPath);

            var response = {};
            if(fs.existsSync(dataPath)) {
                var encFileName = path.basename(dataPath) + '.enc';
                var destPath = util.format(complaintTemplate, encFileName);
                var encrypt = util.format(encScript, encPolicy, dataPath, destPath);
                console.log('EXEC:', encrypt);
                mkdirp(path.dirname(destPath), function(err) {
                    if(err) throw err;

                    exec(encrypt, function(err, stdout, stderr) {
                        if(err) throw err;

                        console.log('file encrypted');
                        blobSvc.createBlockBlobFromLocalFile('complaint-data', encFileName, destPath, function(error, result, response){
                            if(err) throw err;
                            console.log('encrypted file uploaded');
                            res.send(200, JSON.stringify({ url: blobSvc.getUrl('complaint-data', encFileName) }), function(err) {});
                        });
                    });
                });          
            } else {
                res.send(404, "File not Found", function(err) {});
            }
        });

        client.onDeviceMethod('getTDM', function(req, res) {
            var filePath = util.format(pathTemplate, device.deviceId, 'enc') + req.payload.blob;
            console.log('TDM Ready');
            console.log('Making file directory', path.dirname(filePath));
            var encPath = filePath;
            var decPath = filePath.replace('.enc', '').replace('enc', 'tdm');
            mkdirp(path.dirname(encPath), function(err) {
                if(err) throw err;
                mkdirp(path.dirname(decPath), function(err) {
                    if(err) throw err;
                    blobSvc.getBlobToLocalFile(req.payload.container, req.payload.blob, encPath, function(err, result, response) {
                        if(err) throw err;

                        console.log('TDM Downloaded', filePath);
                        res.send(200, '', function(err) {
                            console.log('Ack Sent');
                        });

                        console.log('Decrypting file');
                        var decrypt = util.format(decScript, decPolicy, encPath, decPath);
                        console.log('EXEC:', decrypt);
                        const child = exec(decrypt, (err, stdout, stderr) => {
                            if (err) throw err;
                            console.log('TDM decrypted');
                            rimraf(path.dirname(encPath), function(err) {
                                if(err) throw err;
                                console.log('Encrypted file removed');
                            });
                        });
                    });
                });
            });
        });
    });
}

function forceTwinSync(client, device) {
    client.getTwin(function(err, twin) {
        if (err) throw err;

        console.log('Setting twin state');
        twin.properties.reported.update(device, function(err) {
            if (err) {
                console.error('could not update twin');
            } else {
                console.log('twin state reported');
            }
        });
    });
}

