/*jslint node:true*/
var express = require("express");
var sentiment = require('sentiment');
var session = require('express-session');
var bodyParser = require('body-parser');
var fs = require('fs');
var port = (process.env.VCAP_APP_PORT || 8000);

var stream;
var text1,text2 , textfile,statetext1,statetext1,statefile;
var css= "<link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\">"
var DEFAULT_TOPIC = "Abdullatif Albaseer";

var app = express();

// Configure the app web container
app.configure(function() {
	app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
});


app.get('/twitterCheck', function (req, res) {
   
      res.send("Hello,   I am in your twitters.");
    
});

var tweetCount = 0;
var tweetTotalSentiment = 0;
var monitoringPhrase;



function resetMonitoring() {
	if (stream) {
		var tempStream = stream;
	    stream = null; 
		tempStream.destroySilent();
	}
    monitoringPhrase = "";
}

function beginMonitoring(phrase) {
    // cleanup if we're re-setting the monitoring
    if (monitoringPhrase) {
        resetMonitoring();
    }
    monitoringPhrase = phrase;
    tweetCount = 0;
    tweetTotalSentiment = 0;
    tweeter.verifyCredentials(function (error, data) {
        if (error) {
        	resetMonitoring();
            if (error.statusCode === 401)  {
            }
        } else {
            tweeter.stream('statuses/filter', {
                'track': monitoringPhrase
            }, function (inStream) {
            	
            	stream = inStream;
                stream.on('data', function (data) {
                    if (data.lang === 'en') 
                    {   
                        sentiment(data.text, function (err, result) {
                            tweetTotalSentiment += result.score;
                        });
                    }
                });
                stream.on('error', function (error, code) {
		            if (code === 420)  {
            		}
	                resetMonitoring();
                });
				stream.on('end', function (response) {
					if (stream) { 
		                resetMonitoring();
	                }
				});
				stream.on('destroy', function (response) {
	                resetMonitoring();
				});
            });
            return stream;
        }
    });
}

function sentimentImage() {
  
    return "/angry.png";
}

app.get('/',
    function (req, res) {


        var welcomeResponse = "<!DOCTYPE html><html>\n"+
             "<HEAD>\n" +
            "<title>file statment Analysis</title><link rel=\"stylesheet\"  href=\"style.css\">\n" +
            "</HEAD>\n" +
            "<BODY style=\"background-color:#F5DEB3\">\n" +
            "<P>\n" +
            "<div align=\"center\"><h1>Text analysis Application.</h1><br>\n" + 
            "<h2>This application to analysis the text statement or file<h2>\n" +
            "<FORM action=\"/comtext\" method=\"get\" >\n" +
            "<P>\n" +
            "<INPUT type=\"submit\" value=\"Text Analysis\" style=\"width:40%;height:30%;font-size:17px\">\n" +
            "</P>\n" + "</FORM>\n" +
            "<FORM action=\"/AnaFiles\" method=\"get\" >\n" +
            "<P>\n" +
            "<INPUT type=\"submit\" value=\" File analysis\" style=\"width:40%;height:30%;font-size:17px\">\n" +
            "</P>\n" + "</FORM>\n" +
             "</div></BODY></html>";
        if (!monitoringPhrase) {
            res.send(welcomeResponse);
        }
    });

app.get('/monitor', function (req, res) {
    beginMonitoring(req.query.phrase);
    res.redirect(302, '/');
});

app.get('/reset', function (req, res) {
    resetMonitoring();
    res.redirect(302, '/');
});

app.get('/comtext', function (req, res) {


var sh= "<HEAD>" +
             "<title>Text Analysis</title>\n" +
             "</HEAD>\n" +
             "<BODY style=\"background-color:#FFF5EE\">\n" +
             "<br><br><br><div align=\"center\"><P>\n" +
             "<form method=\"post\" action=\"/ctext\">\n" +
               "<h3>Enter the first statement   <br>  <input type=\"text\" name=\"Input1\" style=\"width:40%;height:8%;font-size:17px\" /><br><br>\n" +
               " Enter the second statement </h3> <input type=\"text\" name=\"Input2\" style=\"width:40%;height:8%;font-size:17px\"  /><br/><br>\n" +
               "<input type=\"submit\" value = \"Test\" style=\"width:40%;height:8%;font-size:17px\">\n" +
               "</form></p>\n" +
              
               "This page to analyse the two opinions about certain issue \n" + 
              "</P></div>\n" +
               "</BODY>";
    res.send(sh);
});

app.get('/AnaFiles', function (req, res) {
var i=10000000;

var sh= "<HEAD>" +
            "<title>File Analysis page</title>\n" +
            "</HEAD>\n" +
            "<BODY style=\"background-color:#D8BFD8\">\n"+
"<img src=\"angry.png\" alt=\"Mountain View\" style=\"width:104px;height:102px\">\n"+
            "<div align=\"center\">\n" +
            "<P><br><br><br><br>\n" +
             "<form method=\"post\" action=\"/cfile\">\n" +
               "<h3>Enter the file path in the textbox <h3>  <input type=\"text\" name=\"Inputfile\" style=\"width:40%;height:8%;font-size:17px\"/><br><br>\n" +
               "<h2><input type=\"submit\" value = \"Test\" style=\"width:40%;height:8%;font-size:17px\"><h2>\n" +
               "</form>\n" +
            "</P>\n" +
             "</div></BODY>";
    res.send(sh);
});


app.get('/resulttext', function(req, res)
{
	
	var r2;
	var compreresult;
 
var r1 = sentiment(text1);
var r2=sentiment(text2);

if (r1.score > r2.score )
{
compreresult='The first opinion better than the second opinion ';
}
else if(r1.score < r2.score )
{
compreresult='The second opinion better than the first opinion ';
}
else 
{
compreresult='both opinion seem equal ';
}

 viewtext=('<body background-color=#FF00FF><div align="center"><table border=1px solid black bgcolor="#FEDCBA"><caption>The Result for the first opinion </caption><tr>  <td>Score :  </td><td>'+r1.score+'</td></tr><tr><td>Comparative   : </td><td>'+r1.comparative+'</td></tr><tr><td>Tokens  :   </td><td>'+r1.tokens+'</td></tr><tr><td>'+'Words Matched  :  </td><td>'+r1.words+'</td></tr><tr><td><tr><td>'+'Positive Words   :  </td><td>'+r1.positive+'</td></tr><tr><td>'+'Negative Words :  </td><td>'+r1.negative+'</td></tr></table><br/><br/><table border=1px solid black bgcolor="#FF00FF"><caption>The Result for the second opinion  </caption><tr><td>Score :  </td><td>'+r2.score+'</td></tr><tr><td>Comparative   : </td><td>'+r2.comparative+'</td></tr><tr><td>Tokens  :   </td><td>'+r2.tokens+'</td></tr><tr><td>'+'Words Matched  :  </td><td>'+r2.words+'</td></tr><tr><td><tr><td>'+'Positive Words   :  </td><td>'+r2.positive+'</td></tr><tr><td>'+'Negative Words :  </td><td>'+r2.negative+'</td></tr></table><table border=1px solid black bgcolor="#FF0066"><caption><h2>status </caption><tr><td><h2>'+compreresult+'</h2></td></tr></table></div></body>');

res.send(viewtext);
});
app.get('/resultfile', function(req, res)
{
	var Data,r1;
	var compreresult;

 
var fs = require("fs");
var fileName = textfile;
 
fs.exists(fileName, function(exists) {
  if (exists) {
    fs.stat(fileName, function(error, stats) {
      fs.open(fileName, "r", function(error, fd) {
        var buffer = new Buffer(stats.size);
 
        fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
          var data = buffer.toString("utf8", 0, buffer.length);
           r1 = sentiment(data);
         
                     if (r1.score > 0)
{
compreresult='The file text seems to be good  ';
}
else if(r1.score < 1 )
{
compreresult='The file seems to be bad  ';
}
else 
{
compreresult='The file seems to be accepted  ';
}

viewfile= ('<body background=#eeefff><div align="center">'+ compreresult + '<table border=1px solid black bgcolor="#FEDCBA"><caption>The Result for File </caption><tr>  <td>Score :  </td><td>'+r1.score+'</td></tr><tr><td>Comparative   : </td><td>'+r1.comparative+'</td></tr><tr><td>Tokens  :   </td><td WIDTH="50" HEIGHT="200">'+r1.tokens+'</td></tr><tr><td>'+'Words Matched  :  </td><td>'+r1.words+'</td></tr><tr><td><tr><td>'+'Positive Words   :  </td><td>'+r1.positive+'</td></tr><tr><td>'+'Negative Words :  </td><td>'+r1.negative+'</td></tr></table><br/><br/></div></body>')//<table border=1px solid black bgcolor="#FF00FF"><caption>The Result for Text </caption><tr><td>Score :  </td><td>'+r2.score+'</td></tr><tr><td>Comparative   : </td><td>'+r2.comparative+'</td></tr><tr><td>Tokens  :   </td><td>'+r2.tokens+'</td></tr><tr><td>'+'Words Matched  :  </td><td>'+r2.words+'</td></tr><tr><td><tr><td>'+'Positive Words   :  </td><td>'+r2.positive+'</td></tr><tr><td>'+'Negative Words :  </td><td>'+r2.negative+'</td></tr>');
res.send(viewfile)
          fs.close(fd);


        });
      });
    });
  }
});

               

});
app.post('/ctext', function(req, res){
 text1 = req.body.Input1;
 text2 = req.body.Input2;
 res.redirect('/resulttext');
});

app.post('/cfile', function(req, res){
	
 textfile = req.body.Inputfile;
 res.redirect('/resultfile');


});
app.listen(port);
console.log("Server listening on port " + port);