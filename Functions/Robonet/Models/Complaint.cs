using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Stryker.Robonet.Functions.Models
{
    public class Complaint : TableEntity
    {
        //public int RowKey { get; set; }
        //public DateTime Timestamp { get; set; }
        public int trackingId { get; set; }
        public string requestId { get; set; }
        public int deviceId { get; set; }
        public string packageUrl { get; set; }
    }
}
