using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Microsoft.Azure.WebJobs.Host;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Stryker.Robonet.Functions.Common
{
    public static class AzureCosmosDbManager
    {
        public static async Task<Document> AddToCosmosDb(Object data, TraceWriter log)
        {
            Document storedDoc = null;

            try
            {
                string endpointUrl = ConfigurationManager.AppSettings["Azure.CosmosDb.Url"].ToString();

                string primaryKey = ConfigurationManager.AppSettings["Azure.CosmosDb.Key"].ToString();

                string databaseName = ConfigurationManager.AppSettings["Azure.CosmosDb.Name"].ToString();

                string collectionName = ConfigurationManager.AppSettings["Azure.CosmosDb.Collection"].ToString();

                DocumentClient client = new DocumentClient(new Uri(endpointUrl), primaryKey);

                storedDoc = await client.CreateDocumentAsync(UriFactory.CreateDocumentCollectionUri(databaseName, collectionName), data);

                log.Info("TDMStatus record created successfully");

                return await Task.FromResult(storedDoc);
            }
            catch (Exception ex)
            {
                log.Info("Creating a new TDMStatus record in cosmos db failed : " + ex.Message);
                return await Task.FromResult(storedDoc);
            }

        }

        public static async Task<List<Models.TDMStatus>> ReadTDMStatus(string REQID, TraceWriter log)
        {
            log.Info("Entered ReadTDMStatus");
            string endpointUrl = ConfigurationManager.AppSettings["Azure.CosmosDb.Url"].ToString();
            string primaryKey = ConfigurationManager.AppSettings["Azure.CosmosDb.Key"].ToString();
            string databaseName = ConfigurationManager.AppSettings["Azure.CosmosDb.Name"].ToString();
            string collectionName = ConfigurationManager.AppSettings["Azure.CosmosDb.Collection"].ToString();
            
            DocumentClient client = new DocumentClient(new Uri(endpointUrl), primaryKey);

            IQueryable<Models.TDMStatus> crossPartitionQuery;

            if (String.IsNullOrEmpty(REQID)) {

                // Get All
                crossPartitionQuery = client.CreateDocumentQuery<Models.TDMStatus>(
                    UriFactory.CreateDocumentCollectionUri(databaseName, collectionName),
                    new FeedOptions { EnableCrossPartitionQuery = true });
            } else
            {
                // Get One
                crossPartitionQuery = client.CreateDocumentQuery<Models.TDMStatus>(
                    UriFactory.CreateDocumentCollectionUri(databaseName, collectionName),
                    new FeedOptions { EnableCrossPartitionQuery = true })
                    .Where(m => m.REQID == REQID);
            };    

            List<Models.TDMStatus> TDMStatusList = new List<Models.TDMStatus>();

            TDMStatusList = crossPartitionQuery.ToList();

            return await Task.FromResult(TDMStatusList);
        }

        public static async Task<string> UpdateTDMStatus(string REQID, Models.TDMStatus tdmstatus, TraceWriter log)
        {
            log.Info("Entered UpdateTDMStatus");
            string endpointUrl = ConfigurationManager.AppSettings["Azure.CosmosDb.Url"].ToString();
            string primaryKey = ConfigurationManager.AppSettings["Azure.CosmosDb.Key"].ToString();
            string databaseName = ConfigurationManager.AppSettings["Azure.CosmosDb.Name"].ToString();
            string collectionName = ConfigurationManager.AppSettings["Azure.CosmosDb.Collection"].ToString();

            DocumentClient client = new DocumentClient(new Uri(endpointUrl), primaryKey);

            //client.ReadDocumentAsync()

            Models.TDMStatus cosmosdoc;
            //Document cosmosdoc;

            // Get record
            cosmosdoc = client.CreateDocumentQuery<Models.TDMStatus>(
                UriFactory.CreateDocumentCollectionUri(databaseName, collectionName),
                new FeedOptions { EnableCrossPartitionQuery = true })
                .Where(m => m.REQID == REQID)
                .AsEnumerable()
                .FirstOrDefault();

            cosmosdoc.REQID = tdmstatus.REQID;
            cosmosdoc.TDMLOC = tdmstatus.TDMLOC;
            cosmosdoc.ROBID = tdmstatus.ROBID;
            cosmosdoc.OPSTATUS = tdmstatus.OPSTATUS;
            cosmosdoc.CASEFILERTRSTATUS = tdmstatus.CASEFILERTRSTATUS;
            cosmosdoc.DELSTATUS = tdmstatus.DELSTATUS;

            ResourceResponse<Document> response =  await client.ReplaceDocumentAsync(UriFactory.CreateDocumentUri(databaseName, collectionName, cosmosdoc.id), cosmosdoc);

            return "Completed Update.  Charge:" + response.RequestCharge;
            //return await Task.FromResult(TDMStatusList);
        }
        public static bool ClearCollection(TraceWriter log)
        {
            log.Info("Entered Clear Collection");
            string endpointUrl = ConfigurationManager.AppSettings["Azure.CosmosDb.Url"].ToString();
            string primaryKey = ConfigurationManager.AppSettings["Azure.CosmosDb.Key"].ToString();
            string databaseName = ConfigurationManager.AppSettings["Azure.CosmosDb.Name"].ToString();
            string collectionName = ConfigurationManager.AppSettings["Azure.CosmosDb.Collection"].ToString();

            DocumentClient client = new DocumentClient(new Uri(endpointUrl), primaryKey);

            var db = client.CreateDatabaseQuery()
                              .Where(d => d.Id == databaseName)
                              .AsEnumerable()
                              .FirstOrDefault();

            var col = client.CreateDocumentCollectionQuery(db.SelfLink)
                              .Where(c => c.Id == collectionName)
                              .AsEnumerable()
                              .FirstOrDefault();
            client.DeleteDocumentCollectionAsync(col.SelfLink);

            DocumentCollection dc = new DocumentCollection();
            dc.Id = collectionName;
            client.CreateDocumentCollectionAsync(db.SelfLink, dc);

            log.Info("Collection was cleared");
            return true;
        }
    }
}
