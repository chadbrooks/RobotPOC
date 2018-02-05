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
using System;

namespace Stryker.Robonet.Functions
{
    public static class TDMStatusCRUD
    {
        [FunctionName("TDMStatus")]
        public static async Task<HttpResponseMessage> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post", "delete", "put", Route = null)]HttpRequestMessage req, TraceWriter log)
        {
            log.Info("C# HTTP trigger function processed a request.");

            dynamic data = await req.Content.ReadAsAsync<TDMStatus>();

            string httpMethod = req.Method.ToString();
            switch (httpMethod)
            {
                case "POST":
                    // Create a new document
                    return await HandleNewTDMStatus(data, log, req);
                    //return req.CreateResponse(HttpStatusCode.OK, "POST METHOD USED");
                    break;
                case "DELETE":
                    await HandleDeleteTDMStatus(data, log, req);
                    return req.CreateResponse(HttpStatusCode.OK, "DELETE METHOD USED");
                    break;
                case "PUT":
                    string reqid = req.GetQueryNameValuePairs()
                        .FirstOrDefault(q => string.Compare(q.Key, "reqid", true) == 0)
                        .Value;
                    if (String.IsNullOrEmpty(reqid))
                    {
                        return req.CreateResponse(HttpStatusCode.NotFound, "Please pass a Request ID (REQID)");
                    }
                    return await HandleUpdateTDMStatus(reqid, data, log, req);
                    //return req.CreateResponse(HttpStatusCode.OK, "PUT METHOD USED");
                    break;
                default:
                    return req.CreateResponse(HttpStatusCode.OK, "Unsupported Method");
                    break;
            }

        }

        public static async Task<HttpResponseMessage> HandleNewTDMStatus(TDMStatus tdmstatus, TraceWriter log, HttpRequestMessage req)
        {
            //Double check the ID field
            if (String.IsNullOrEmpty(tdmstatus.id)) {
                tdmstatus.id = tdmstatus.REQID;
            }
            var storedDoc = await AzureCosmosDbManager.AddToCosmosDb(tdmstatus, log);

            if (storedDoc != null)
                log.Info($"New Patient has been stored successfully: {storedDoc.Id}");

            return req.CreateResponse(HttpStatusCode.OK, "Succesfully added a new TDM Status");
        }

        public static async Task<HttpResponseMessage> HandleUpdateTDMStatus(string REQID, TDMStatus tdmstatus, TraceWriter log, HttpRequestMessage req)
        {
            // TO DO:  Implement Update in AzureCosmosDbManager

            string id = await AzureCosmosDbManager.UpdateTDMStatus(REQID, tdmstatus, log);

            log.Info($"Updted TDM Status: {id}");

            return req.CreateResponse(HttpStatusCode.OK, "Succesfully updated TDM Status");
        }

        public static async Task<HttpResponseMessage> HandleDeleteTDMStatus(TDMStatus tdmstatus, TraceWriter log, HttpRequestMessage req)
        {
            bool success = AzureCosmosDbManager.ClearCollection(log);

            if (success)
            {
                var response = new HttpResponseMessage(HttpStatusCode.Accepted);
                return response;
            }
            else
            {
                var response = new HttpResponseMessage(HttpStatusCode.NotFound);
                return response;
            }
        }
    }
}
