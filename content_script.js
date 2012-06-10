/*
 * @author Warren Harrison / http://hungry-media.com/
 */

/******************************************************************************

TO DO: 

******************************************************************************/

var rootAPIUrl = 'https://beta.checkvist.com/'; 
var url = document.location.toString();
var urlParts = url.split('/');
var listID = urlParts.pop().replace('#','');
console.log("listID: " + listID);
var allTasks = {};
var extensionOptions = {};
var tagPatternHrs = new RegExp();
var tagPatternDays = new RegExp();

chrome.extension.sendRequest({command: "getOptions"}, function(response) {
  extensionOptions = response.answer;
  tagPatternHrs = extensionOptions.hours.prefix ? 
                      new RegExp('^' + extensionOptions.hours.tag + '([0-9]+)$') : 
                      new RegExp('^([0-9]+)' + extensionOptions.hours.tag + '$');
  tagPatternDays = extensionOptions.days.prefix ? 
                      new RegExp('^' + extensionOptions.days.tag + '([0-9]+)$') : 
                      new RegExp('^([0-9]+)' + extensionOptions.days.tag + '$');

  $.getJSON(rootAPIUrl + 'checklists/' + listID + '/tasks.json').complete( function(data){
//    console.log(data.responseText);
  	var listData = JSON.parse(data.responseText);
  	for(var task in listData){
  		var thisID = listData[task].id;
  		allTasks[thisID] = listData[task];
  		allTasks[thisID]['hours'] = 0;
  		allTasks[thisID]['days'] = 0;
  		allTasks[thisID]['changed'] = false;
  	}
  	for( var t in allTasks ){
  		if( allTasks[t].parent_id == 0 ){
  			getChildTotal(allTasks[t].id);
  		}
  	}
  	for( var t in allTasks ){
  	  var thisTask = allTasks[t]
  	  scrubCurrentTags(thisTask.id);
  	  if( thisTask.hours > 0 && extensionOptions.hours.generate ){
  	    var thisTag = generateTag(thisTask.id, 'h');
  		  thisTask.tags[thisTag] = false;
  		  thisTask.changed = true;
  	  }
  	  if( thisTask.days > 0 && extensionOptions.days.generate ){
  	    var thisTag = generateTag(thisTask.id, 'd');
  		  thisTask.tags[thisTag] = false;
  		  thisTask.changed = true;
  	  }
  		if( thisTask.changed ) updateTaskOnServer(thisTask.id);
  	}
  });
});

function getChildTotal(taskID){
	var thisTask = allTasks[taskID];
	if( thisTask.tasks.length == 0 ){
		// has no children, set its hours
		var tags = Object.keys(thisTask.tags);
		for( var tag in tags ){
			var tagText = tags[tag].toString();
			// capture regexp results
			var matchesHrs = tagPatternHrs.exec(tagText);
			if( matchesHrs && matchesHrs.length > 0 ){ 
			  thisTask.hours = matchesHrs[1];
			  thisTask.days = Math.round( (thisTask.hours / extensionOptions.days.hoursPer) * 10) / 10;
		  }
			var matchesDays = tagPatternDays.exec(tagText);
			if( matchesDays && matchesDays.length > 0 ){ 
			  thisTask.days = matchesDays[1];
			  thisTask.hours = thisTask.days * extensionOptions.days.hoursPer;
		  }
		}
	}else{
		for( var child in thisTask.tasks){
			getChildTotal(thisTask.tasks[child]);
			thisTask.hours += parseInt(allTasks[thisTask.tasks[child]].hours);
			thisTask.days = Math.round( (thisTask.hours / extensionOptions.days.hoursPer) * 10) / 10;
		}
	}
}

function generateTag(id, type){
  var thisTask = allTasks[id];
	
  switch (type){
    case 'h':
      return extensionOptions.hours.prefix ? 
              extensionOptions.hours.tag + thisTask.hours : 
              thisTask.hours + extensionOptions.hours.tag;
      break;
    case 'd':
      return extensionOptions.days.prefix ? 
              extensionOptions.days.tag + thisTask.days : 
              thisTask.days + extensionOptions.days.tag;
      break;
  }
}

function scrubCurrentTags(id){
	taskTags = Object.keys( allTasks[id].tags );
	
	var numDeletions = 0;
	for( var t in taskTags ){
	  var hoursTag = generateTag(id, 'h');
	  var daysTag = generateTag(id, 'd');
		if( tagPatternHrs.test( taskTags[t] ) ){
			// don't bother to delete if the tag already matches the hours
			if( !extensionOptions.hours.generate || hoursTag != taskTags[t] ){
				delete allTasks[id].tags[taskTags[t]];
				allTasks[id].changed = true;
				numDeletions++;
			}
		}
		if( tagPatternDays.test( taskTags[t] ) ){
			// don't bother to delete if the tag already matches the days
			if( !extensionOptions.days.generate || daysTag != taskTags[t] ){
				delete allTasks[id].tags[taskTags[t]];
				allTasks[id].changed = true;
				numDeletions++;
			}
		}
	}
	if( numDeletions > 0 ){
		return true;
	}else{
		return false;
	}
}

function updateTaskOnServer( taskID ){
  if( allTasks[taskID].changed == false ){
    return false;
  }
	updateURL = rootAPIUrl + 'checklists/' + listID + '/tasks/' + taskID + '.json';
	var tagsCommaDelimited = Object.keys( allTasks[taskID].tags ).join(',');
	console.log(updateURL);
	console.log(tagsCommaDelimited);
//	return false;
	$.ajax({
		type: 'PUT', 
		url: updateURL,
		data: {
			'task': { 
				'tags':  tagsCommaDelimited
			}
		}
	}).complete( function(d){ 
	  return true;
	});
}
