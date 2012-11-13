/*
 * @author Warren Harrison / http://hungry-media.com/
 */

// populate UI
$('#minutes-tag').val(extensionOptions.minutes.tag);
$('#hours-tag').val(extensionOptions.hours.tag);
$('#days-tag').val(extensionOptions.days.tag);
extensionOptions.minutes.prefix ? $('#minutes-as-prefix').prop('checked', true) : $('#minutes-as-suffix').prop('checked', true);
extensionOptions.hours.prefix ? $('#hours-as-prefix').prop('checked', true) : $('#hours-as-suffix').prop('checked', true);
extensionOptions.days.prefix ? $('#days-as-prefix').prop('checked', true) : $('#days-as-suffix').prop('checked', true);
$('#hours-per-day').val( extensionOptions.days.hoursPer );
extensionOptions.minutes.generate ? $('#create-minutes-tags').prop('checked', true) : $('#create-minutes-tags').prop('checked', false);
extensionOptions.hours.generate ? $('#create-hours-tags').prop('checked', true) : $('#create-hours-tags').prop('checked', false);
extensionOptions.days.generate ? $('#create-days-tags').prop('checked', true) : $('#create-days-tags').prop('checked', false);
extensionOptions.includeClosed ? $('#include-closed').prop('checked', true) : $('#include-closed').prop('checked', false);
updateExamples();

// on each UI element update, save to local storage
$('input').change( function(e){
  switch(e.target.id){
    case 'minutes-tag':
      extensionOptions.minutes.tag = e.target.value;
      break;
    case 'hours-tag':
      extensionOptions.hours.tag = e.target.value;
      break;
    case 'days-tag':
      extensionOptions.days.tag = e.target.value;
      break;
    case 'hours-as-prefix':
      extensionOptions.hours.prefix = e.target.checked ? true : false;
      break;
    case 'hours-as-suffix':
      extensionOptions.hours.prefix = e.target.checked ? false : true;
      break;
    case 'days-as-prefix':
      extensionOptions.days.prefix = e.target.checked ? true : false;
      break;
    case 'days-as-suffix':
      extensionOptions.days.prefix = e.target.checked ? false : true;
      break;
    case 'create-minutes-tags':
      extensionOptions.minutes.generate = e.target.checked ? true : false;
      break;
    case 'create-hours-tags':
      extensionOptions.hours.generate = e.target.checked ? true : false;
      break;
    case 'create-days-tags':
      extensionOptions.days.generate = e.target.checked ? true : false;
      break;
    case 'hours-per-day':
      extensionOptions.days.hoursPer = e.target.value;
      break;
    case 'include-closed':
      extensionOptions.includeClosed = e.target.checked ? true : false;
      break;
  }
  localStorage['ExtensionOptions'] = JSON.stringify(extensionOptions);
  
	$('#status').html('Options Saved').show().delay(2000).fadeOut('fast');
	updateExamples();
});

function updateExamples(){
  var hrsPerDay = $('#hours-per-day').val();
  var defaultMins = 30;
  var defaultHrs = 24;
  var defaultDays = Math.round( ( defaultHrs / hrsPerDay ) * 10 ) / 10;
  var minsExample = $('#minutes-as-prefix:checked').length ? $('#minutes-tag').val() + defaultMins : defaultMins + $('#minutes-tag').val();
  var hrsExample = $('#hours-as-prefix:checked').length ? $('#hours-tag').val() + defaultHrs : defaultHrs + $('#hours-tag').val();
  var daysExample = $('#days-as-prefix:checked').length ? $('#days-tag').val() + defaultDays : defaultDays + $('#days-tag').val();
  $('#generated-example').empty();
  if( $('#minutes-tag').val() != '' ){
    $('#minutes-example').text( minsExample );
    if( $('#create-minutes-tags').prop('checked') ) $('#generated-example').append( minsExample + ' ');
  }
  if( $('#hours-tag').val() != '' ){
    $('#hours-example').text( hrsExample );
    if( $('#create-hours-tags').prop('checked') ) $('#generated-example').append( hrsExample + ' ');
  }
  if( $('#days-tag').val() != '' ){
    $('#days-example').text( daysExample );
    if( $('#create-days-tags').prop('checked') ) $('#generated-example').append( daysExample );
  }
}