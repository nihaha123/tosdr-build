var Mustache = require('mustache')
var fs = require('fs');

var services = {}
var points = {};
var topics = {};
var cases = {}
var templates = {};

function addFile(path, storage) {
  try {
    var obj = JSON.parse(fs.readFileSync(path));
    return storage[obj.id] = obj;
  } catch(e) {
    console.log(e, path);
  } 
}
function loadTemplates(){
  var path = 'templates/'
  var files = fs.readdirSync(path)
  for(var i=0; i < files.length ; i++){
    var filename = files[i];
    var m;
    if( m = filename.match(/(.*)\.mustache$/) ) {
      try{
        templates[m[1]] = Mustache.compile( fs.readFileSync(path+filename).toString() );
      } catch(e) {
        console.log(filename, " : Error loading template!", e)
      }
    }
  }
  return templates;
}

function loadIndex(name){
  try {
    return JSON.parse(fs.readFileSync('index/'+name+'.json'));
  } catch(e) {
    console.log('Error loadIndex : '+name, e)
  }
}

function loadTopics(){
  var path = 'topics/';
  var index = loadIndex('topics');
  var files = fs.readdirSync(path);
  for(var i = 0; i < files.length ; i++){
    var filename = files[i];
    
    if(filename.match(/\.json$/))
      try {
         var obj = JSON.parse(fs.readFileSync(path+filename));
         obj.points = index[obj.id].map(function(point_id){
           if(!points[point_id])
             console.log("!!! Point "+point_id+" of Topic "+obj.id+"not found");
           return points[point_id];
          }).filter(function(t){return t});
         obj.cases = [];
         topics[obj.id] = obj;
       } catch(e) {
         console.log(e, filename);
       }
  }
}
function loadServices(){
  var path = 'services/';
  var index = loadIndex('services');
  var files = fs.readdirSync(path);
  for(var i = 0; i < files.length ; i++){
    var filename = files[i];
    
    if(filename.match(/\.json$/))
      try {
         var obj = JSON.parse(fs.readFileSync(path+filename));
        try { 
          obj.points = index[obj.id].points.map(function(point_id){
            return points[point_id];
          })
        } catch(e){
          console.log("no points found for " , filename, index[obj.id], e)
        }
        obj.links = index[obj.id].links;
        services[obj.id] = obj;
       } catch(e) {
         console.log(e, filename);
       }
  }
}


function extend_point(obj){
  var badge = "";
  var icon = "";
  var sign = "";
  if(obj.tosdr) {
    if (obj.tosdr.point == 'good') {
      badge = 'success';
      icon = 'thumbs-up';
      sign = '+';
    } else if (obj.tosdr.point == 'bad') {
      badge = 'warning';
      icon = 'thumbs-down';
      sign = '-';
    } else if (obj.tosdr.point == 'blocker') {
      badge = 'important';
      icon = 'remove';
      sign = '×';
    } else if (obj.tosdr.point == 'neutral') {
      badge = 'neutral';
      icon = 'asterisk';
      sign = '⋅';
    } else {
      badge = '';
      icon = 'question-sign';
      sign = '?';
    }
    obj.badge = badge;
    obj.sign = sign;
    obj.icon = icon;
  }
  return obj;
}

function loadCases(){
  cases = {};
  var files = fs.readdirSync('cases/');
  for(var i=0; i < files.length; i++){
    if( files[i].match(/\.json$/) ){
      var data = addFile('cases/'+files[i], cases);
      extend_point(data);
      topics[data.topic].cases.push(data)
    }
  }
};
function loadPoints() {
  points={};
  var files = fs.readdirSync('points/');
  for(var i=0; i<files.length; i++) {
    if(files[i].match(/\.json$/)) {
      var data = addFile('points/'+files[i], points);
      extend_point(data);
    }
  }
}
loadPoints();
loadTopics();
loadServices();
loadCases();
loadTemplates();

module.exports = {
  services : services,
  points : points,
  topics : topics,
  cases : cases,
  templates :templates
}