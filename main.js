var http = require('http');                         //SetUp
var dt = require('./custommodule.js');              //Custom Module
const fs = require('fs');                           //File System IO
const rl = require('readline');                     //Readline
const { count } = require('console');
var formidable = require('formidable');

//Main
http.createServer(function (req, res) {             //Creates Server
    //   res.writeHead(200, {'Content-Type': 'text/html'});
    //   var myReadStream = fs.createReadStream(__dirname + '/index.html', 'utf8')
    if (req.url == '/fileupload') {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
          var oldpath = files.filetoupload.path;
          var newpath = 'C:\\Users\\Roberto H\\Desktop\\WhatsappAnalisis\\files\\' + files.filetoupload.name;
          fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
            res.write('File uploaded and moved!');
            // let file = newpath;
            readData(newpath);
            // tableCreate();
            res.end();
          });
     });
      } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
        res.write('<input type="file" name="filetoupload"><br>');
        res.write('<input type="submit">');
        res.write('</form>');
        return res.end();
      }
    }).listen(8080);


//Functions

//WhatsappLine object constructor
function WhatsappLine(date, time, person, text) {   
    this.date = date;
    this.time = time;
    this.person = person;
    this.text = text;
};

//Get position of nth occurrance of given substring
function getPosition(string, subString, index) {    
    return string.split(subString, index).join(subString).length;
}

//Word count
function WordCount(str) { 
    return str.split(" ").length -1;
}

//Gets unique persons, only works with WhatsappLine Objects
function getUniqueNames(arr1){       
    let counter = {}
    for(let i=0; i< arr1.length; i++){
        let val = arr1[i].person
        counter[val] =  (counter[val] || 0) +1;
    }
    console.log(counter)
}

function tableCreate() {
    var body = document.getElementsByTagName('body')[0];
    var tbl = document.createElement('table');
    tbl.style.width = '100%';
    tbl.setAttribute('border', '1');
    var tbdy = document.createElement('tbody');
    for (var i = 0; i < 3; i++) {
      var tr = document.createElement('tr');
      for (var j = 0; j < 2; j++) {
        if (i == 2 && j == 1) {
          break
        } else {
          var td = document.createElement('td');
          td.appendChild(document.createTextNode('\u0020'))
          i == 1 && j == 1 ? td.setAttribute('rowSpan', '2') : null;
          tr.appendChild(td)
        }
      }
      tbdy.appendChild(tr);
    }
    tbl.appendChild(tbdy);
    body.appendChild(tbl)
}






function readData(file){

//Opens file and reads it
const readInterface = rl.createInterface({   
    input: fs.createReadStream(file),
    output: process.stdout,
    console: false,
    terminal: false
});
let listOfLines = [];
let i = 0;
let counter = 0;
//Reads file line by line and creates objects out of each line
readInterface.on('line', function(line) {               //Reads file line by line
    let firstCharacter = line.charAt(0);                //Used to check if line is an actual line or something else
    let startOfName = line.indexOf("-") +2;
    let endOfName = getPosition(line, ":", 2) ;
    let endOfHour = startOfName -3;
    let lineDate = line.substring(0, 6);
    let lineTime = line.substring(9, endOfHour);
    let lineName = line.substring(startOfName, endOfName);
    let lineText = line.substring(endOfName+1);
    
    // console.log(firstCharacter)
    if(lineName.length < 20 && (line.includes(":")) && (/^.*?[0-9]$/.test(firstCharacter)) && (firstCharacter != " ") && (line.includes("/")) && (!line.includes("left")) && (!line.includes("added")) ) {        //if lineName is too long it means that the line is most likely a group statement (someona has been added,  or has left), as is if it does not have ":" or the first character isn't an integer
    listOfLines[i] = new WhatsappLine(lineDate,lineTime, lineName, lineText);
    i++;
    }  
    if((Number(firstCharacter) == NaN) || firstCharacter == " ") {              //Some text overflows to next line so it needs to be added to the last line's .text
    let previousLine = i-1;
    listOfLines[previousLine].text = listOfLines[previousLine].text.concat(line);
    // console.log(firstCharacter);
    }
});

//After it has read the file do this:
readInterface.on('close', function() {
    // console.log(listOfLines[4].text)
    getUniqueNames(listOfLines)
    let i =0;
    // for(let x in listOfLines){
    // console.log(listOfLines[i].person)
    // i++;
    // }
    // console.log(getPosition(listOfLines[55].text, ":",1))
});
} //<-- end of readData()