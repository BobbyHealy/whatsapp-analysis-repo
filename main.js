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
          var newpath = __dirname + '\\files\\' + files.filetoupload.name;
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

//UserData object constructor
function UserData(user, messages, word_count) {   
  this.user = user;
  this.messages = messages;
  this.word_count = word_count;
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
function getUniqueNames(whatsapp_lines){       
    let counter = {}
    for(let i=0; i< whatsapp_lines.length; i++){
        let val = whatsapp_lines[i].person
        counter[val] =  (counter[val] || 0) +1;
    }
    return counter //returns {name1: ammount_texts1, name2: ammount_texts2,...}
}

//Gets word count for each user
function getWordCount(whatsapp_lines){       
  let counter = {}
  for(let i=0; i< whatsapp_lines.length; i++){
      let val = whatsapp_lines[i].person
      let ammoun_words = WordCount(whatsapp_lines[i].text)
      counter[val] =  (counter[val] || 0) + ammoun_words;
  }
  return counter //returns {name1: ammount_words1, name2: ammount_words2,...}
}

function structureData(unique_data, user_word_count){
//turn {name1: ammount_texts1, name2: ammount_texts2,...} => [{user: name1, texts: ammount_texts1},{user: name2, texts: ammount, texts}]
 let userDataDB = [];
 let i =0;
 for(let key in unique_data){
   userDataDB[i] = new UserData(key, unique_data[key], user_word_count[key])
   i++
 }
 console.log(userDataDB)
}

//Runs the whole operation => opens file, reads it, and runs operations after finishing
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
let android = 0;
//Reads file line by line and creates objects out of each line
readInterface.on('line', function(line) {               //Reads file line by line
    let firstCharacter = line.charAt(0);                //Used to check if line is an android line or an iPhone line... or something else
    let startOfName, endOfName, endOfHour, lineDate, lineTime, lineName, lineText, condition;

    if((firstCharacter != "[" && i == 0) || android == 1){
    android = 1;
    startOfName = line.indexOf("-") +2;
    endOfName = getPosition(line, ":", 2) ;
    endOfHour = startOfName -3;
    lineDate = line.substring(0, 6);
    lineTime = line.substring(9, endOfHour);
    lineName = line.substring(startOfName, endOfName);
    lineText = line.substring(endOfName+1);
    condition = lineName.length < 20 && (line.includes(":")) && (/^.*?[0-9]$/.test(firstCharacter)) && (firstCharacter != " ") && (line.includes("/")) && (!line.includes("left")) && (!line.includes("added"));
    } else{
    android = 0;
    startOfName = line.indexOf("]") +2;
    endOfName = getPosition(line, ":", 3) ;
    endOfHour = startOfName -3;
    lineDate = line.substring(1, 6);
    lineTime = line.substring(13, endOfHour);
    lineName = line.substring(startOfName, endOfName);
    lineText = line.substring(endOfName+1);
    condition = lineName.length < 20 && (line.includes(":")) && (firstCharacter == "[") && (firstCharacter != " ") && (line.includes("/")) && (!line.includes("left")) && (!line.includes("added"));
    }
    
    // console.log(firstCharacter)
    if(condition) {        //if lineName is too long it means that the line is most likely a group statement (someona has been added,  or has left), as is if it does not have ":" or the first character isn't an integer
    listOfLines[i] = new WhatsappLine(lineDate,lineTime, lineName, lineText);
    i++;
    }  
    if((Number(firstCharacter) == NaN) || firstCharacter == " ") {              //Some text overflows to next line so it needs to be added to the last line's .text
    let previousLine = i-1;
    console.log()
    listOfLines[previousLine].text = listOfLines[previousLine].text.concat(line);
    // console.log(firstCharacter);
    }
});

//After it has read the file do this:
readInterface.on('close', function() {
    let x = getUniqueNames(listOfLines);
    let y = getWordCount(listOfLines);
    structureData(x,y);
    let i =0;
});
} //<-- end of readData()