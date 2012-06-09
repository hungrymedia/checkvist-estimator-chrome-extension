var rootAPIUrl = 'https://beta.checkvist.com/'; 
var url = document.location.toString();
var urlParts = url.split('/');
var listID = urlParts.pop().replace('#','');
console.log("listID: " + listID);
var allTasks = {};
var tagPattern = 'hrs-';
/******************************************************************************

TO DO: 
- allow for customizable tag prefix or suffix for hours
- allow for option to use days with customizable tag prefix or suffix
- allow for choice of created tags in hours, days or both 

******************************************************************************/

$.getJSON(rootAPIUrl + 'checklists/' + listID + '/tasks.json').complete( function(data){
	var listData = JSON.parse(data.responseText);
	for(var task in listData){
		var thisID = listData[task].id;
		allTasks[thisID] = listData[task];
		allTasks[thisID]['hours'] = 0;
	}
	for( var t in allTasks ){
		if( allTasks[t].parent_id == 0 ){
			getChildTotal(allTasks[t].id);
		}
	}
	for( var t in allTasks ){
	  var thisTask = allTasks[t]
	  deleteTagsMatching(thisTask.id, tagPattern);
	  if( thisTask.hours > 0 ){
		  thisTask.tags[tagPattern + thisTask.hours] = false;
	  }
		updateTaskOnServer(thisTask.id);
	}
});

function getChildTotal(taskID){
	var thisTask = allTasks[taskID];
	if( thisTask.tasks.length == 0 ){
		// has no children, set its hours, clear hours tag
		var tags = Object.keys(thisTask.tags);
		for( var tag in tags ){
			var tagText = tags[tag].toString();
			if( tagText.substr(0, 4) == tagPattern ){
				thisTask.hours = parseFloat(tagText.substr(4));
			}
		}
	}else{
		for( var child in thisTask.tasks){
			getChildTotal(thisTask.tasks[child]);
			thisTask.hours += allTasks[thisTask.tasks[child]].hours;
		}
	}
}

function deleteTagsMatching(id, pattern){
	taskTags = Object.keys( allTasks[id].tags );
	var numDeletions = 0;
	for( var t in taskTags ){
		if( taskTags[t].substr(0, pattern.length) == pattern ){
			// don't bother to delete if the tag already matches the hours
			if( pattern + allTasks[id].hours != taskTags[t] ){
				delete allTasks[id].tags[taskTags[t]];
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
	updateURL = rootAPIUrl + 'checklists/' + listID + '/tasks/' + taskID + '.json';
	var tagsCommaDelimited = Object.keys( allTasks[taskID].tags ).join(',');
	$.ajax({
		type: 'PUT', 
		url: updateURL,
		data: {
			'task': { 
				'tags':  tagsCommaDelimited
			}
		}
	}).complete( function(d){ 
	});
}
