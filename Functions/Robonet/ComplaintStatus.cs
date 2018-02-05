using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using System.Configuration;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;

namespace Stryker.Robonet.Functions
{
    public static class ComplaintStatus
    {
        [FunctionName("ComplaintStatus")]
        public static async Task<HttpResponseMessage> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]HttpRequestMessage req, TraceWriter log)
        {
            log.Info("C# HTTP trigger function processed a request.");

            string connString = ConfigurationManager.AppSettings["StorageConnectionString"].ToString();
            // Retrieve storage account from connection string.
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(connString);
            CloudTableClient client = storageAccount.CreateCloudTableClient();

            string httpMethod = req.Method.ToString();
            switch (httpMethod)
            {
                case "GET":
                    // retreive the records in the table
                    CloudTable table = client.GetTableReference("complaints");
                    var tabledata = table.ExecuteQuery(new TableQuery<Models.Complaint>()).ToList();

                    return req.CreateResponse(HttpStatusCode.OK, tabledata);

                    break;
                case "DELETE":
                    // Implement Delete
                    return req.CreateResponse(HttpStatusCode.OK, "DELETE METHOD USED");
                    break;

                default:
                    return req.CreateResponse(HttpStatusCode.OK, "Unsupported Method");
                    break;
            }

        }
    }
}
