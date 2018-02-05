'use strict';

var shortid = require('shortid');
var Client = require('azure-iothub').Client;
var client = Client.fromConnectionString(process.env.IOT_CONSTR);

module.exports = function (context, complaint, devices) {   
    context.log('setting up bindings');
    for(var i = 0; i < devices.length; i++) {
        var device = devices[i];
        context.log(device);
        if(device.processed.includes(complaint.requestId)) {
            complaint.deviceId = device.robotId;
            break;
        }
    }

    if(complaint.deviceId) {
        var methodParams = {
            methodName: 'sendComplaintData',
            payload: { requestId: complaint.requestId },
            timeoutInSeconds: 30
        };

        context.log('Invoking device function.', complaint, methodParams);
        client.invokeDeviceMethod(complaint.deviceId, methodParams, function (err, result) {
            if (err) {
                context.log('Error', err.message);
            } else {
                context.log(JSON.stringify(result, null, 2));
            }

            complaint.PartitionKey = complaint.deviceId;
            complaint.RowKey = shortid.generate();

            complaint.packageUrl = Buffer.from(JSON.parse(result.payload).url).toString('base64');

            context.log('#################');
            context.log(complaint);
            context.log('#################');
            context.done(null, complaint);
        });
    } else {
        // Couldn't find the device, so we put this in the completed queue for notification.
        context.log('Completing complaint', complaint);
        context.done(null, complaint);
    }
};