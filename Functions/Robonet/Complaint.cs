using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using System;
using System.IO;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Stryker.Robonet.Functions.Models;
using System.Collections.Generic;
using Stryker.Robonet.Functions.Common;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Queue;
using System.Configuration;

namespace Stryker.Robonet.Functions
{
    public static class Complaint
    {
        [FunctionName("Complaint")]
        public static async Task<HttpResponseMessage> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]HttpRequestMessage req, TraceWriter log)
        {
            log.Info("C# HTTP trigger function processed a request.");

            string reqid = req.GetQueryNameValuePairs()
                .FirstOrDefault(q => string.Compare(q.Key, "reqid", true) == 0)
                .Value;

            if (String.IsNullOrEmpty(reqid))
            {
                return req.CreateResponse(HttpStatusCode.NotFound, "Please pass a Request ID (REQID)");
            }

            // TO DO:  Implement Logic to initiate request for a complaint
            // Drop onto queue {requestId:'anything'} 
            // complaint-initiation queue


            // Mark as requested
            //List<Models.TDMStatus> tdmstatus = await AzureCosmosDbManager.ReadTDMStatus(reqid, log);
            //tdmstatus[0].CASEFILERTRSTATUS = "Requested";
            //string id = await AzureCosmosDbManager.UpdateTDMStatus(reqid, tdmstatus[0], log);

            // Now submit to IoTHub
            string connString = ConfigurationManager.AppSettings["StorageConnectionString"].ToString();

            // Retrieve storage account from connection string.
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(connString);
            CloudQueueClient queueClient = storageAccount.CreateCloudQueueClient();
            CloudQueue queue = queueClient.GetQueueReference(ConfigurationManager.AppSettings["ComplaintQueue"].ToString());
            queue.CreateIfNotExists();

            CloudQueueMessage message = new CloudQueueMessage("{requestId:'" + reqid + "'}");
            queue.AddMessage(message);


            return req.CreateResponse(HttpStatusCode.OK, "Initiated complaint request for " + reqid);
        }
    }
}


