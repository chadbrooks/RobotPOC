using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using System;
using System.Configuration;
using Microsoft.WindowsAzure.Storage;
using Stryker.Robonet.Functions.Models;
using Microsoft.WindowsAzure.Storage.Blob;
using System.IO;

namespace Stryker.Robonet.Functions
{
    public static class ComplaintUpload
    {
        [FunctionName("ComplaintUpload")]
        public static async Task<HttpResponseMessage> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]HttpRequestMessage req, TraceWriter log)
        {
            log.Info("C# HTTP trigger function processed a request.");

            // Get request body
            dynamic data = await req.Content.ReadAsAsync<FileData>();

            // Convert to a Byte Array
            byte[] newBytes = Convert.FromBase64String(data.FileUpload);

            //string connString = ConfigurationManager.AppSettings["ChadStorageConnectionString"].ToString();
            string connString = ConfigurationManager.AppSettings["StorageConnectionString"].ToString();

            // Retrieve storage account from connection string.
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(connString);

            // Create the blob client.
            CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();

            // Retrieve reference to a previously created container.
            CloudBlobContainer container = blobClient.GetContainerReference("complaint-data");

            // Retrieve reference to a blob using the filename.
            CloudBlockBlob blockBlob = container.GetBlockBlobReference(data.FileName);

            using (var stream = new MemoryStream(newBytes, writable: false))
            {
                blockBlob.UploadFromStream(stream);
            }

            return req.CreateResponse(HttpStatusCode.OK, "File Uploaded Successfully");
        }
    }
}
