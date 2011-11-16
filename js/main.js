$(document).ready(function() {
	$(".album").click(function() {
		var uri = $(this).attr("href");
		if ($.browser.webkit) {
			$("#open").attr("src", uri);
		} else {
			location.href = uri;
		}
	});	
});

//spotify:album:3NpEREN7HE6wImHtPpPK0H
//spotify:album:5YnNB8Wcs2150AcgTey3Cx

function spotifyLookUp(uri) {
	$.getJSON(
		'http://ws.spotify.com/lookup/1/.json', 
		{
			uri: uri, 
			extras: 'track'
		}, 
		function(data) {
			//var uri = data.album.tracks[0].href;
			var uri = data.album.href;
			var artist = data.album.artist;
			var title = data.album.name;
			
			$.getJSON(
				'http://ws.audioscrobbler.com/2.0/',
				{
					method: 'album.getinfo',
					api_key: '',
					format: 'json',
					artist: artist,
					album: title
				}, 					
				function(data) {
					var image = data.album.image[2]['#text'];			
					$("#albums").append('<li><a href="' + uri + '"><img src="' + image + '"/><span>' + artist + ' - ' + title + '</span></a></li>');
					
					$.getJSON(
						'album',
						{
							artist: artist,
							title: title,
							uri: uri,
							image: image 
						},
						function(data) {
							// vis!
						}
					)
				}
			);				
		}
	);
}

/*
var lastfm = new LastFM({
		apiKey    : 'c7b42c8420929b071f04dde846040232',
		apiSecret : '1cd5b5a511e734e70cf58174c6500e69'
	});
*/
/*
function lastfmLookUp() {
	lastfm.artist.getInfo({artist: 'The xx'}, {success: function(data){

		alert(data);
		
	}, error: function(code, message){
		alert(code + message);
	
	}});
}*/

var drop = document.querySelector('.drop');

addEvent(drop, 'dragover', cancel);
addEvent(drop, 'dragenter', cancel);

addEvent(drop, 'drop', function (e) {
	if (e.preventDefault) e.preventDefault();  
	if (e.dataTransfer.types) {  
		var link = e.dataTransfer.getData('text/html');
		var albumUri = link.match(/album\/(.*)\"/)[1];
		spotifyLookUp('spotify:album:' + albumUri);
	}
	return false;
});