const util = require('util');
const cheerio = require('cheerio');
const iothub = require('azure-iothub');

const procedureLookup = {
    'PARTIAL_KNEE_ARTHROPLASTY': 'PKA',
    'TOTAL_KNEE_ARTHROPLASTY': 'TKA',
    'TOTAL_HIP_ARTHROPLASTY': 'THA'
}

module.exports = function (context, blob, devices) {
    const $ = cheerio.load(blob)
    const reqId = $('RequestID').text();
    const hc = $('HospitalKey').text();
    const pc = procedureLookup[$('Application').attr('key')];
    const fp = context.bindingData.uri;

/*
    const registry = iothub.Registry.fromConnectionString(process.env.IOT_CONSTR);
    var q = util.format("SELECT * FROM devices WHERE properties.reported.hospitalCode = '%s';", hc);
    var query = registry.createQuery(q, 100);
    context.log(JSON.stringify(query));
    query.nextAsTwin(function(err, results) {
        context.log('###########################');
        context.log(err.responseBody);
        context.log(process.env.IOT_CONSTR);
        context.log(q);
        context.log(results);
        context.log('###########################');
    });
*/

    context.bindings.encryptQueue = [];
    for(var i = 0; i < devices.length; i++) {
        var device = devices[i];
        if(device.hospitalCode === hc) {
            if(device.endorsements.includes(pc)) {
                device.package = fp;
                context.bindings.encryptQueue.push({ deviceId: device.robotId, source: context.bindingData.blobTrigger });
            }
        }
    }

    context.done();
};
