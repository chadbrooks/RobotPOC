using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Stryker.Robonet.Functions.Models
{
    public class ActivityLookup
    {
        public int robotId { get; set; }
        public string hospitalCode { get; set; }
        public string locationCode { get; set; }
        public List<string> endorsements { get; set; }
        public bool status { get; set; }
        public List<object> processed { get; set; }
    }
}
