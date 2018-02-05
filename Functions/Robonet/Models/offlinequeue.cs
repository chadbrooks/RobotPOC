using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Stryker.Robonet.Functions.Models
{
    public class OfflineQueue
    {
        public string methodName { get; set; }
        public payload payload { get; set; }
        public string timmeoutInSeconds { get; set; }
    }

    public class payload
    {
        public string container { get; set; }
        public string blob { get; set; }
    }
}
