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
			console.log(allTasks[t].id + ' has no parent.');
			getChildTotal(allTasks[t].id);
		}
	}
	for( var t in allTasks ){
			updateTaskOnServer(allTasks[t].id);
	}
});

function getChildTotal(taskID){
	var thisTask = allTasks[taskID];
	console.log('Processing task: ' + thisTask.id);
	if( thisTask.tasks.length == 0 ){
		console.log("Task has no children");
		// has no children, set its hours, clear hours tag
		var tags = Object.keys(thisTask.tags);
		console.log(tags);
		for( var tag in tags ){
			console.log('Processing tag: ' + tags[tag]);
			var tagText = tags[tag].toString();
			if( tagText.substr(0, 4) == tagPattern ){
				thisTask.hours = parseFloat(tagText.substr(4));
				console.log('Setting hours to : ' + thisTask.hours);
			}
		}
	}else{
		for( var child in thisTask.tasks){
			console.log('Found child task: ' + thisTask.tasks[child]);
			getChildTotal(thisTask.tasks[child]);
			thisTask.hours += allTasks[thisTask.tasks[child]].hours;
		}
	}
	if( deleteTagsMatching(thisTask.id, tagPattern) ){
		thisTask.tags[tagPattern + thisTask.hours] = false;
	}
}

function deleteTagsMatching(id, pattern){
	taskTags = Object.keys( allTasks[id].tags );
	var numDeletions = 0;
	for( var t in taskTags ){
		if( taskTags[t].substr(0, pattern.length) == pattern ){
			// don't bother to delete if the tag already matches the hours
			console.log(pattern + ' -- ' + allTasks[id].hours != taskTags[t]);
			if( pattern + allTasks[id].hours != taskTags[t] ){
				console.log("deleting tag: " + taskTags[t] + ' from :' + id);
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
		console.log(d);
	});
}
