module.exports = function (context, myBlob) {
    var source = context.bindingData.blobTrigger;
    var dest = source.replace('.enc', '');
    dest = dest.replace('enc', 'tdm');

    context.log("JavaScript blob trigger function processed blob \n Name:", context.bindingData.name, "\n Blob Size:", myBlob.length, "Bytes");
    context.done(null, {source: source, dest: dest});
};