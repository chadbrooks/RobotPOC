using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Stryker.Robonet.Functions.Models;
using Stryker.Robonet.Functions.Common;
using System.Collections.Generic;

namespace Stryker.Robonet.Functions
{
    public static class GetTDMStatus
    {
        [FunctionName("GetTDMStatus")]
        public static async Task<List<TDMStatus>> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)]HttpRequestMessage req, TraceWriter log)
        {
            log.Info("C# HTTP trigger function processed a request.");

            //List<TDMStatus> tdmstatus = new List<TDMStatus>();

            string reqid = req.GetQueryNameValuePairs()
                        .FirstOrDefault(q => string.Compare(q.Key, "reqid", true) == 0)
                        .Value;

            List<Models.TDMStatus> tdmstatus = await AzureCosmosDbManager.ReadTDMStatus(reqid,log);

            return tdmstatus;


        }
    }
}
