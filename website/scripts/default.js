// Robonet Sample Application

var gTDMStatus;
var gActivityStatus;


$(function () {
    'use strict';

    var debug = true; 
    var UploadType = 1; // 1=TDM; 2=Complaint

      // Set the Demo Date / Time
      // Includes a 45 minute offset
      var currdt = new Date();
      var dr = new Date(currdt.getTime() - (45 * 60000));
      document.getElementById("txtCurrentDateTime").innerHTML = '<p><b>Demo Data Arrival Time: </b>' + dr.toISOString() + '</p>';

    function logMsg(msg){
        if (debug == true) {
            console.log(msg);
        }
    }

    function Notify(msg){
        document.getElementById("notify-msg").innerHTML = msg;
        document.getElementById("notify-msg2").innerHTML = msg;
    }


    // Show the TDM Div
    $('#tdm-upload').on('click', function () {
        // Show the class
        HideAll();
        $('.TDMUpload').show();
    });
    

    // Show the complaint div
    $('#complaint-retrieval').on('click', function () {
        HideAll();
        $('.ComplaintRetrieval').show();
    });

    // Show the Edge App div
    $('#edge-application').on('click', function () {
        HideAll();
        $('.EdgeApplication').show();
        GetTDMFileList();
    }); 
    
    function GetTDMFileList(){
        // div-TDMFileList
        $.ajax({
            url: config.TDMFileURL,
            type: "GET",
            //data: JSON.stringify(myJSON),  
            contentType: "application/json",
            success:function(response){
                logMsg(response);
                var html = "";
                for (var i = 0; i < response.length; i++)
                {
                    html = html + "<div><a href='" + response[i].URL + "'>" + response[i].FileName + "</a></div>";
                }
                document.getElementById("div-TDMFileList").innerHTML = html;
            },
            error: function(error){
                logMsg(error);
            }
        });
    }

    // Upload TDM!!
    $("#btn-upload").on("click", function (e) {
        var file = $('#image-file')[0].files[0];
        var upload = new Upload(file);
        UploadType = 1;
        // mabye check size or type here with upload.getSize() and upload.getType()
        // execute upload
        upload.doUpload();
    });

    $("#btn-comupload").on("click", function (e) {
        var file = $('#complaint-file')[0].files[0];
        var upload = new Upload(file);
        UploadType = 2;
        // mabye check size or type here with upload.getSize() and upload.getType()
        // execute upload
        upload.doUpload();
    });

    $("#btn-TDMStatus").on("click", function (e) {
        var myJSON = {id: '', REQID:'', TDMLOC:'', DELSTATUS:'', ROBID:'', OPSTATUS:'', CASEFILERTRSTATUS:'' };
        var LOCArray = ['USFL','USCA','EUGR','EUUK','USNY','APIN','USDC'];        
        myJSON.id = Math.floor((Math.random() * 1000000) + 1);
        myJSON.REQID = myJSON.id;
        myJSON.TDMLOC = LOCArray[Math.floor(Math.random() * LOCArray.length)];
        myJSON.DELSTATUS = "abc";
        myJSON.OPSTATUS = "abc";
        myJSON.CASEFILERTRSTATUS = "abc";
        myJSON.ROBID = Math.floor((Math.random() * 10000) + 1);

        $.ajax({
            url: config.TDMStatusURL,
            type: "POST",
            data: JSON.stringify(myJSON),  
            contentType: "application/json",
            //"Content-Type": 'application/json',
            success:function(response){
                // If we have success, set the token value
                //var r=JSON.parse(response);
                logMsg(response);
                GetTDMStatus();
                Notify("Successfully created a new TDMStatus record")
            },
            error: function(error){
                logMsg(error);
            }
        });
    });

    $("#btn-complaintstatus").on("click", function (e) {
        $.ajax({
            url: config.ComplaintStatusURL,
            type: "Get",
            contentType: "application/json",
            success:function(response){
                    logMsg(response);
                    //document.getElementById("notify-msg").innerHTML = response;
                    var htmlfordiv = "<table border='1'><tr><td>requestId</td><td>deviceId</td><td>Timestamp</td>" + 
                    "<td>packageUrl</td></tr>";
                    for (var i = 0; i <response.length; i++){
                        var dt = new Date(response[i].Timestamp);
                        htmlfordiv = htmlfordiv + "<tr><td>" + response[i].requestId + "<td>" + response[i].deviceId + "</td>" + 
                        "<td>" + dt.toISOString() + "</td><td>" + response[i].packageUrl + "</td></tr>";
                    }
                    htmlfordiv = htmlfordiv + "</table>";
                    document.getElementById("div-complaintstatus").innerHTML = htmlfordiv;
                },
            error: function(error){
                logMsg(error);
            }
        });
    });

    $("#btn-DeleteTDMStatus").on("click", function (e) {
        $.ajax({
            url: config.TDMStatusURL,
            type: "Delete",
            contentType: "application/json",
            success:function(response){
                logMsg(response);
                document.getElementById("notify-msg").innerHTML = response;
                GetTDMStatus();
            },
            error: function(error){
                logMsg(error);
            }
        });
    });

    $("#btn-GetTDMStatus").on("click", function (e) {
        GetTDMStatus();
    });

    function GetTDMStatus() {
        $.ajax({
            url: config.ActivityLookupURL,
            type: "Get",
            contentType: "application/json",
            success:function(response){
                var htmlfordiv = "<table border='1'><tr><td>robotId</td><td>hospitalCode</td><td>locationCode</td>" +
                                 "<td>endorsements</td><td>status</td><td>processed</td><td>Request Complaint Data" +
                                 "</td></tr>";
                gActivityStatus = response;
                for (var i = 0; i <response.length; i++){
                    htmlfordiv = htmlfordiv + "<tr><td>" + response[i].robotId + "<td>" + response[i].hospitalCode + "</td>" + 
                    "<td>" + response[i].locationCode + "</td>" + "<td>" + response[i].endorsements + "</td>" 
                    + "<td>" + response[i].status + "</td>" + "<td>" + response[i].processed + "</td><td>" ;
                    if (response[i].processed.length > 0){
                        htmlfordiv = htmlfordiv + "<button onclick=requestComplaint('" + i + "')>Request</button>"
                    }
                    htmlfordiv = htmlfordiv + "</td></tr>";
                }
                htmlfordiv = htmlfordiv + "</table>";
                document.getElementById("div-results").innerHTML = htmlfordiv;
                logMsg(response);
            },
            error: function(error){
                logMsg(error);
            }
        });
        // $.ajax({
        //     url: config.GetTDMStatusURL,
        //     type: "Get",
        //     //data: JSON.stringify(myJSON),  
        //     contentType: "application/json",
        //     //"Content-Type": 'application/json',
        //     success:function(response){
        //         // var t = {'<>':'div','html':'${REQID} ${TDMLOC} ${DELSTATUS} ${ROBID} ${OPSTATUS} '  };
        //         // var htmlfordiv = json2html.transform(response,t);
        //         var htmlfordiv = "<table border='1'><tr><td>REQID</td><td>TDMLOC</td><td>DELSTATUS</td>" +
        //                          "<td>ROBID</td><td>OPSTATUS</td><td>CASEFILERTRSTATUS</td><td>Request Complaint Data" +
        //                          "</td><td>Update</td></tr>";
        //         gTDMStatus = response;
        //         for (var i = 0; i <response.length; i++){
        //             htmlfordiv = htmlfordiv + "<tr><td>" + response[i].REQID + "<td>" + response[i].TDMLOC + "</td>" + 
        //             "<td>" + response[i].DELSTATUS + "</td>" + "<td>" + response[i].ROBID + "</td>" 
        //             + "<td>" + response[i].OPSTATUS + "</td>" + "<td>" + response[i].CASEFILERTRSTATUS + "</td>" + 
        //             "<td><button onclick=requestComplaint('" + i + "')>Request</button></td>" +
        //             "<td><button onclick=updateComplaint('" + response[i].REQID + "','" + 
        //             response[i].TDMLOC + "','" + response[i].DELSTATUS + "','" + response[i].ROBID + "','"
        //             + response[i].OPSTATUS + "','" + response[i].CASEFILERTRSTATUS + "'" +
        //             ")>Update</button></td></tr>";
        //         }
        //         htmlfordiv = htmlfordiv + "</table>";
        //         document.getElementById("div-results").innerHTML = htmlfordiv;
        //         logMsg(response);
        //     },
        //     error: function(error){
        //         logMsg(error);
        //     }
        // });
    };

    function HideAll() {
        $('.TDMUpload').hide();
        $('.ComplaintRetrieval').hide();
        $('.EdgeApplication').hide();
    }

    var Upload = function (file) {
        this.file = file;
    };
    
    Upload.prototype.getType = function() {
        return this.file.type;
    };
    Upload.prototype.getSize = function() {
        return this.file.size;
    };
    Upload.prototype.getName = function() {
        return this.file.name;
    };
    Upload.prototype.doUpload = function () {
        var that = this;
        var formData = new FormData();
    
        // add assoc key values, this will be posts values
        formData.append("file", this.file, this.getName());
        formData.append("upload_file", true);

        var reader = new FileReader();
        reader.readAsDataURL(this.file);
        var fileName = this.file.name;
        reader.addEventListener("load", function(){
            var base64encoded = reader.result;
            var pos = base64encoded.indexOf("base64,") + 7;
            base64encoded = base64encoded.slice(pos,base64encoded.length);

            var myJSON = {FileUpload:'', FileName:''};
            myJSON.FileName = fileName;
            myJSON.FileUpload = base64encoded;

            var UploadURL;
            if (UploadType == 1){
                UploadURL = config.TDMUploadURL;
            } else {
                UploadURL = config.ComplaintUploadURL;
            }

            $.ajax({
                type: "POST",
                url: UploadURL,
                xhr: function () {
                    var myXhr = $.ajaxSettings.xhr();
                    if (myXhr.upload) {
                        myXhr.upload.addEventListener('progress', that.progressHandling, false);
                    }
                    return myXhr;
                },
                success: function (data) {
                    // your callback here
                    $('.progress-wrp').show();
                    Notify(data);
                    $('.progress-wrp').hide();
                },
                error: function (error) {
                    // handle error
                },
                async: true,
                data: JSON.stringify(myJSON),
                contentType: "application/json",
                cache: false,
                processData: false,
                timeout: 60000
            });

        })

    };
    
    Upload.prototype.progressHandling = function (event) {
        var percent = 0;
        var position = event.loaded || event.position;
        var total = event.total;
        var progress_bar_id = "#progress-wrp";
        if (event.lengthComputable) {
            percent = Math.ceil(position / total * 100);
        }
        // update progressbars classes so it fits your code
        $(progress_bar_id + " .progress-bar").css("width", + percent + "%");
        $(progress_bar_id + " .status").text(percent + "%");
    };

});