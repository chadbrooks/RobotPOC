var fs = require('fs');
var util = require('util');
var path = require('path');
var { exec } = require('child_process');

var azure = require('azure-storage');
var Client = require('azure-iothub').Client;
var shortid = require('shortid');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');

var blobSvc = azure.createBlobService();
var queueSvc = azure.createQueueService();

const encryptPath = '/tmp/enc-dec/%s/enc/%s';
const decryptPath = '/tmp/enc-dec/%s/dec/%s';
const cleanupPath = '/tmp/enc-dec/%s/';
const encryptionScript = '/home/strykerpoc/device-authority-cli-212/run.sh';
const encPolicy = process.env.ENC_POLICY;
const decPolicy = process.env.DEC_POLICY;
const decScript = '/home/strykerpoc/device-authority-cli-212/run.sh -d "file" -p "%s" -i "%s" -o "%s"';
const encScript = '/home/strykerpoc/device-authority-cli-212/run.sh -e "file" -p "%s" -i "%s" -o "%s"';

setInterval(function() {
  queueSvc.getMessages('encrypt-queue', function(err, messages) {
    if(err) throw err;

    if(messages.length === 0) {
      return;
    }

    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    console.log('Got message...');
    var buff = new Buffer(messages[0].messageText, 'base64');  
    var message = JSON.parse(buff.toString('ascii'));
    message.session = shortid.generate();

    console.log(message);

    var srcParts = message.source.split('/');
    message.encPath = util.format(encryptPath, message.session, srcParts[1]) + '.enc';
    message.decPath = util.format(decryptPath, message.session, srcParts[1]);

    console.log('Creating tmp file directories...');
    mkdirp(path.dirname(message.decPath), function() {
      if(err) throw err;

      mkdirp(path.dirname(message.encPath), function(err) {
        if(err) throw err;


        console.log('Downloading encrypted blob...');
        blobSvc.getBlobToStream(srcParts[0], srcParts[1], fs.createWriteStream(message.decPath), function(err) {
          if(err) {
            console.log('Blob not found! Attempting to remove from queue');
            if(err.code == 'NotFound') {
              queueSvc.deleteMessage('decrypt-queue', messages[0].messageId, messages[0].popReceipt, function(err, res) { 
                if(err) throw err;
                console.log('Message removed!'); 
              });
            } else {
              throw err;
            }
          } else {
            console.log('Got file, encrypting');
            var encrypt = util.format(encScript, encPolicy, message.decPath, message.encPath);
            console.log('EXEC', encrypt);
            const child = exec(encrypt, (err, stdout, stderr) => {
              if (err) throw err;

              console.log('Uploading decrypted blob');
              var container = 'delivery';
              var destBlob = message.session + '/' + srcParts[1] + '.enc';
              blobSvc.createBlockBlobFromLocalFile(container, destBlob, message.encPath, function(err, result, response) {
                if(err) throw err;
                console.log('Removing temp directories...');
                rimraf(util.format(cleanupPath, message.session), function(err) {
                  console.log('Dequeuing message...');
                  console.log(message);
                  queueSvc.deleteMessage('encrypt-queue', messages[0].messageId, messages[0].popReceipt, function(err, res) {
                    if(err) throw err;

                    var connectionString = process.env.IOTHUB_CONSTR;
                    var client = Client.fromConnectionString(connectionString);

                    var methodParams = {
                      methodName: 'getTDM',
                      payload: { container: container,  blob: destBlob },
                      timeoutInSeconds: 30
                    };

                    // for offline device suppor
                    console.log('updating offline queue');
                    queueSvc.createMessage('offline-queue', new Buffer(JSON.stringify(methodParams)).toString('base64'), function(err) {
                        if(err) {
                            console.log('error writing to offline-queue', err);
                        } else {
                            console.log('offline-queue updated.');
                        }
                    });

                    client.invokeDeviceMethod(message.deviceId, methodParams, function (err, result) {
                      if (err) {
                        console.error('Failed to invoke method \'' + methodParams.methodName + '\': ' + err.message);
                      } else {
                        console.log(JSON.stringify(result, null, 2));
                      }
                    });


                    console.log('Complete!');
                    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
                  });
                });
              });
            });
          }
        });
      });
    });
  });
}, 5000);
