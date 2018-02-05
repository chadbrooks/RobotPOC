using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using System.Configuration;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System.Collections.Generic;
using Microsoft.ServiceBus.Messaging;
using Microsoft.WindowsAzure.Storage.Queue;
using Newtonsoft.Json;

namespace Stryker.Robonet.Functions
{
    public static class TDMFileInfo
    {
        [FunctionName("TDMFileInfo")]
        public static async Task<List<Models.TDMFileInfo>> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)]HttpRequestMessage req, TraceWriter log)
        {
            log.Info("C# HTTP trigger function processed a request.");

            // Call Event Hub
            //var client = EventHubClient.CreateFromConnectionString(ConfigurationManager.AppSettings["EventHubConnString"].ToString());

            //EventHubConsumerGroup group = client.GetDefaultConsumerGroup();
            //var receiver = group.CreateReceiver(client.GetRuntimeInformation().PartitionIds[0]);

            string connString = ConfigurationManager.AppSettings["StorageConnectionString"].ToString();

            // Retrieve storage account from connection string.
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(connString);
            CloudQueueClient queueClient = storageAccount.CreateCloudQueueClient();
            CloudQueue queue = queueClient.GetQueueReference(ConfigurationManager.AppSettings["offline-queue"].ToString());
            queue.CreateIfNotExists();

            queue.FetchAttributes();
            int? qc = queue.ApproximateMessageCount;
            int queuecount;

            if (!qc.HasValue)
            {
                queuecount = 0; 
            } else
            {
                queuecount = (int)qc;
            }

            List<CloudQueueMessage> messages = queue.PeekMessages(queuecount).ToList();
            List<Models.TDMFileInfo> listFileInfo = new List<Models.TDMFileInfo>();

            foreach (CloudQueueMessage msg in messages)
            {
                Models.TDMFileInfo fileinfo = new Models.TDMFileInfo();
                string Msg = msg.AsString;
                //dynamic data = JsonConvert.DeserializeObject(Msg);
                Models.OfflineQueue data = JsonConvert.DeserializeObject<Models.OfflineQueue>(Msg);
                fileinfo.FileName = data.payload.blob;
                fileinfo.URL = "https://dapoc.blob.core.windows.net/delivery/" + data.payload.blob;
                listFileInfo.Add(fileinfo);
            }


            //// parse query parameter
            //string name = req.GetQueryNameValuePairs()
            //    .FirstOrDefault(q => string.Compare(q.Key, "name", true) == 0)
            //    .Value;

            //name = "Chad";

            //string connString = ConfigurationManager.AppSettings["StorageConnectionString"].ToString();

            //// Retrieve storage account from connection string.
            //CloudStorageAccount storageAccount = CloudStorageAccount.Parse(connString);

            //// Create the blob client.
            //CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();

            //// Retrieve reference to a previously created container.
            //CloudBlobContainer container = blobClient.GetContainerReference("tdm");

            ////Now get the list of files in the container
            //List<IListBlobItem> list = container.ListBlobs().ToList();

            //List<Models.TDMFileInfo> listFileInfo = new List<Models.TDMFileInfo>();

            //foreach (CloudBlockBlob blob in list)
            //{
            //    Models.TDMFileInfo fileinfo = new Models.TDMFileInfo();
            //    fileinfo.DestinationRobot = "1001"; // Static for demo purposes
            //    fileinfo.FileName = blob.Name;
            //    fileinfo.URL = blob.SnapshotQualifiedUri.ToString();
            //    listFileInfo.Add(fileinfo);
            //}

            return listFileInfo;
        }
    }
}
