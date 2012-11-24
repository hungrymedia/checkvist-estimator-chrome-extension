/*
 * @author Warren Harrison / http://hungry-media.com/
 */

/******************************************************************************

TO DO: 

******************************************************************************/

var url = document.location.toString();
var urlParts = url.split('/');
var rootAPIUrl = urlParts[0] + '//' + urlParts[2] + '/';
var listID = urlParts.pop().replace('#','');
var allTasks = {};
var extensionOptions = {};
var tagPatternMins = /^([0-9]+)m/;
var tagPatternHrs = /^([0-9]+)h/;
var tagPatternDays = /^([0-9]+)d/;
var numTasks = 0;

chrome.extension.sendRequest({command: "getOptions"}, function(response) {
  extensionOptions = response.answer;
  tagPatternMins = extensionOptions.minutes.prefix ?
                      new RegExp('^' + extensionOptions.minutes.tag + '([0-9]+)$') : 
                      new RegExp('^([0-9]+)' + extensionOptions.minutes.tag + '$');
  tagPatternHrs = extensionOptions.hours.prefix ?
                      new RegExp('^' + extensionOptions.hours.tag + '([0-9]+)$') : 
                      new RegExp('^([0-9]+)' + extensionOptions.hours.tag + '$');
  tagPatternDays = extensionOptions.days.prefix ? 
                      new RegExp('^' + extensionOptions.days.tag + '([0-9]+)$') : 
                      new RegExp('^([0-9]+)' + extensionOptions.days.tag + '$');
});


function main(){
  parseCurrentTags();
}

function parseCurrentTags(){
  $.getJSON(rootAPIUrl + 'checklists/' + listID + '/tasks.json').complete( function(data){
    var listData = JSON.parse(data.responseText);
    for(var task in listData){
      numTasks++;
      var thisID = listData[task].id;
      allTasks[thisID] = listData[task];
      allTasks[thisID]['minutes'] = 0;
      allTasks[thisID]['changed'] = false;
      distillToMinutes(thisID);
    }
    recalculateAll();
    tagAll();
  });
}

function recalculateAll(){
  for(var task in allTasks){
    if( allTasks[task].parent_id == 0){
      calculateChildMinutes(allTasks[task]);
    }
  }
}

function tagAll(){
  var taskIdx = 0;
  for(var task in allTasks){
    newTags = {};
    if(allTasks[task].minutes > 0){
      if( extensionOptions.minutes.generate ){
        extensionOptions.minutes.prefix ? 
          newTags[extensionOptions.minutes.tag + allTasks[task].minutes] = false : 
          newTags[allTasks[task].minutes + extensionOptions.minutes.tag] = false
      }
      if( extensionOptions.hours.generate ){
        var taskHours = Math.ceil( allTasks[task].minutes / 60 );
        extensionOptions.hours.prefix ? 
          newTags[extensionOptions.hours.tag + taskHours] = false : 
          newTags[taskHours + extensionOptions.hours.tag] = false
      }
      if( extensionOptions.days.generate ){
        var taskDays = Math.ceil( allTasks[task].minutes / 60 / extensionOptions.days.hoursPer );
        extensionOptions.days.prefix ? 
          newTags[extensionOptions.days.tag + taskDays] = false : 
          newTags[taskDays + extensionOptions.days.tag] = false
      }
    }
    taskIdx++;
    isLast = taskIdx == numTasks ? true : false;
    if( newTags != allTasks[task].tags ){
      allTasks[task].tags = newTags;
      allTasks[task].changed = true;
      updateTaskOnServer( allTasks[task], isLast )
    }
  }
}


function distillToMinutes(taskID){
  var thisTask = allTasks[taskID];
  var thisTaskTags = Object.keys(thisTask.tags);
  for( var tag in thisTaskTags ){
    var tagText = thisTaskTags[tag].toString();
    var matchesMins = tagPatternMins.exec(tagText);
    var matchesHrs = tagPatternHrs.exec(tagText);
    var matchesDays = tagPatternDays.exec(tagText);

    if( matchesMins && matchesMins.length > 0 ){ 
      thisTask.minutes = parseInt(matchesMins[1]);
    }else if( matchesHrs && matchesHrs.length > 0 ){ 
      thisTask.minutes = parseInt(matchesHrs[1] * 60);
    }else if( matchesDays && matchesDays.length > 0 ){
      thisTask.minutes = parseInt(matchesDays[1] * 60 * extensionOptions.days.hoursPer);
    }
  }
}

function calculateChildMinutes(task){
  if( task.tasks.length > 0 ){
    var ttlChildMinutes = 0;
    for( childTask in task.tasks ){
      var currentChildTask = allTasks[task.tasks[childTask]];
      calculateChildMinutes(currentChildTask);
      ttlChildMinutes += currentChildTask.minutes;
    }
    task.minutes = ttlChildMinutes;
  }
}

var numChanged = function(){
  n = 0
  for(var task in allTasks){
    if( allTasks[task].changed ){
      n++;
    }
  }
  return n;
};

function updateTaskOnServer( task, isLast ){
  if( task.changed == false ){
    return false;
  }
  var updateURL = rootAPIUrl + 'checklists/' + listID + '/tasks/' + task.id + '.json';
  var tagsCommaDelimited = Object.keys( task.tags ).join(',');
  // work around fact that API will not set tags to empty string
  if( tagsCommaDelimited == '' ){ 
    tagsCommaDelimited = ',';
  }
  $.ajax({
    type: 'PUT', 
    url: updateURL,
    data: {
      'task': { 
        'tags':  tagsCommaDelimited
      }
    }
  }).complete( function(d){
    // only reload page if we've updated the last changed tag
    if( isLast ){ document.location.reload(); }
    return true;
  });
}


function initTimeTagsClasses() {

  var count = 0;

  var doSetTags = function() {
    // If content is loaded or 10 seconds passed
    // Should _not_ consider tags in list names and wait for real content
    var hasLoadedContentWithTags = ($("#tags_content .tag").length + $(".topLevel .tag").length) > 0;
    if (hasLoadedContentWithTags || count > 100) {

      $(".tag").each(function(t) {
        var txt = $(this).text();
        if (tagPatternMins.test(txt) || tagPatternHrs.test(txt) || tagPatternDays.test(txt)) {
          $(this).addClass('timeTag');
        }
      });
    }
    else {
      count++;
      setTimeout(doSetTags, 100);
    }
  };

  doSetTags();
}

initTimeTagsClasses();
