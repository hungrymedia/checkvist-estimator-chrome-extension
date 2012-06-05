var url = document.location.toString();
var urlParts = url.split('/');
var listID = urlParts.pop().replace('#','');
console.log("listID: " + listID);
var taskHrs = {};
var taskContent = {};

$.getJSON('http://checkvist.com/checklists/' + listID + '/tasks.json').complete( function(data){
	var listData = JSON.parse(data.responseText);
	for(var task in listData){
		taskContent[listData[task].id] = listData[task].content;
		if( Object.keys(listData[task].tags).length > 0 ){
			var taskTags = Object.keys(listData[task].tags);
			for( var tag in taskTags ){
				if( taskTags[tag].substr(0, 4) == 'hrs-' ){
//					console.log(listData[task]);
					var hours = taskTags[tag].substr(4);
					if( taskHrs[listData[task].parent_id] == undefined ){
						taskHrs[listData[task].parent_id] = parseFloat(hours);
					}else{
						taskHrs[listData[task].parent_id] += parseFloat(hours);
					}
				}
			}
		}
	}
	console.log(taskHrs);
	// update parent tasks with calculated hours
	// /checklists/checklist_id/tasks/task_id.json
	var taskKeys = Object.keys(taskHrs);
	for( var key in taskKeys ){
		updateURL = 'http://checkvist.com/checklists/' + listID + '/tasks/' + taskKeys[key] + '.json';
		console.log(updateURL);
		$.ajax({
			type: 'PUT', 
			url: updateURL,
			data: {
				'task': { 
					'content':  taskContent[taskKeys[key]] + ' #hrs-' + taskHrs[taskKeys[key]] 
				}
			}
		}).complete( function(d){ 
			console.log(d);
		});
	}
});
