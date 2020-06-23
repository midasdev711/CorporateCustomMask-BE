require("dotenv").config();
var config = require("../config");
var formidable = require('formidable');
var fs = require('fs');
const { google } = require('googleapis');
const { GoogleSpreadsheet } = require('google-spreadsheet');
var emailSender = require('./emailSender');
var moment = require('moment');

const doc = new GoogleSpreadsheet(config.GOOGLE_SHEET_ID);

/**
* Describe with given media and metaData and upload it using google.drive.create method()
*/
function uploadFile(filePath, newFilename) {
  const JWTClient = new google.auth.JWT(
    config.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    config.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
    ['https://www.googleapis.com/auth/drive']
  );

  const drive = google.drive({ version: 'v3', auth: JWTClient });
  const fileMetadata = {
    'name': newFilename,
    parents: [config.GOOGLE_DRIVE_FOLDER_ID]
  };
  const media = {
    mimeType: 'image/jpeg',
    body: fs.createReadStream(filePath)
  };
  drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id'
  }, (err, file) => {
    if (err) {
      // Handle error
      console.error(err);
    } else {
      console.log('File Id: ', file.id);
    }
  });
}

async function addInfoToGoogleSheet(userInfo) {
  await doc.useServiceAccountAuth({
    client_email: config.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: config.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
  });
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  
  
  const newRow = await sheet.addRow({
    Companyname: userInfo.companyName,
    CompanyWebsite: userInfo.companyWebsite,
    City: userInfo.city,
    Province: userInfo.province,
    Country: userInfo.country,
    Filename: userInfo.filename,
    "Mask color1": userInfo.color1.hex,
    "Mask color2": userInfo.color2.hex,
    "Mask color3": userInfo.color3.hex,
    "Number of masks needed": userInfo.maskCountNeeded,
    "Required delivery date": userInfo.deliveryDate,
    Firstname: userInfo.firstName,
    Lastname: userInfo.lastName,
    Email: userInfo.email,
    Phone: userInfo.phone,
    'Uploaded Time': moment().format("YYYY-MM-DD h:mm:ss a"),
    Comment: userInfo.comment,
    "Input Language": userInfo.inputLanguage
  });
}

exports.upload = async (req, res) => {
  var form = new formidable.IncomingForm();
  let uploadedFilePath = "";
  let userInfo;
  form.parse(req, async (err, fields, files) => {
    userInfo = JSON.parse(fields.info);
    // generate file name
    await doc.useServiceAccountAuth({
      client_email: config.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: config.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
    });
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    const rows = await sheet.getRows();
    let uploadCount = 0;
    let index = 0;
    while (true) {
      if (rows[index] == undefined) {
        break;
      }
      if (rows[index].Email == userInfo.email) {
        uploadCount ++;
      }
      index ++;
    }
    uploadCount ++;

    let newFilename = `${userInfo.email}_${uploadCount}_${userInfo.filename}`;
    userInfo.filename = newFilename;
    // upload file to google drive
    
    uploadFile(uploadedFilePath, newFilename);

    addInfoToGoogleSheet(userInfo);

    // send email
    let from     = 'thierry@legaleriste.com',
        to       = userInfo.email,
        subject  = 'Image uploaded',
        text     = `New image '${newFilename}' uploaded`,
        html     = `<h1>HTML test</h1>`;

    emailSender.sendEmail(from, to, subject, text, html);
    res.status(200).send('');
  });

  form.on('fileBegin', function (name, file){
    file.path = __dirname + '/../upload/' + file.name;
    uploadedFilePath = file.path;
  });

  form.on('file', (name, file) => {
    // uploadFile(file);
  });
};
