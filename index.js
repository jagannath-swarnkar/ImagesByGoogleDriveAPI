const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const express = require('express');
var app = express();

// app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


const SCOPES = ['https://www.googleapis.com/auth/drive'];

const TOKEN_PATH = 'token.json';


app.get('/image',(request,response)=>{

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), listFiles);
});
function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      // console.log('Files:');
      files.map((file) => {
        // console.log(`${file.name} (${file.id})`);
        if(file.name=='My_images'){
          link = ["https://drive.google.com/embeddedfolderview?id="+ file.id +"#grid"];
          // response.render(__dirname+'/project.ejs',{link:link[0]});
          drive.files.list({
            q:`'${file.id}' in parents`
          }, (err,data)=>{
            if(err) throw err
              const imageId = data.data.files
              var imgLink = []
              for(var i of imageId){

                imgLink.push("https://drive.google.com/uc?export=view&id="+i.id)
              }
              console.log(imgLink[0])
              response.render(__dirname+'/project.ejs',{imgLink:imgLink})
          }
          )
        }
      });
    } else {
      console.log('No files found.');
    }
  });
}
})
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}


function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}



app.listen(8000);