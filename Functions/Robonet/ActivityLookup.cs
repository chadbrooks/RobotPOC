using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using System.Collections.Generic;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System.Configuration;
using System.IO;
using Stryker.Robonet.Functions.Models;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace Stryker.Robonet.Functions
{
    public static class ActivityLookup
    {
        [FunctionName("ActivityLookup")]
        public static async Task<List<Models.ActivityLookup>> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]HttpRequestMessage req, TraceWriter log)
        {
            log.Info("C# HTTP trigger function processed a request.");

            WebClient client = new WebClient();
            Stream stream = client.OpenRead("https://robotnetstorage.blob.core.windows.net/lookup/lookup.json");
            StreamReader reader = new StreamReader(stream);
            string content = reader.ReadToEnd();

            dynamic data = JsonConvert.DeserializeObject<List<Models.ActivityLookup>>(content);

            // List<Models.ActivityLookup> listAL = new List<Models.ActivityLookup>();

            return data;

        }
    }
}
