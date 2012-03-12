$(document).ready(function() {
	$(".album").click(function() {
		var uri = $(this).attr("href");
		if ($.browser.webkit) {
			$("#open").attr("src", uri);
		} else {
			location.href = uri;
		}
	});	
	
	$("#albums").sortable({
		update: function(event, ui) {
			//event.preventDefault();    	
			//var index = ui.item.index();	          
			//var id = $('#albums li:nth-child(' + index + ')').attr('data-internalid');			

			var order = new Array();

			$('#albums li').each(function(index) {
			    order.push($(this).attr('data-internalid'));
			});			
			
			$.getJSON(
				'album/order',
				{
					ids: order.join(',')
				},
				function(data) {
					return data.result == 'success';
				}
			);
			
		}
	});
	
	$("#albums").on("click", ".delete", function(event){
		event.preventDefault();
		var album = $(this).parent('li');
		return albumDelete(album);
	});
	
	$('#header').on('click', '#delete', function(event){
		event.preventDefault();
		$('.delete').toggleClass('hidden');
	});
	
/*	$(".delete").click(function(event) {
		event.preventDefault();
		var album = $(this).parent('li');
		albumDelete(album);
	});*/
});


function albumDelete(albumListItem) {
	var id = albumListItem.attr('data-internalid');
	$.getJSON(
		'album/delete',
		{
			id: id
		},
		function(data) {				
			if (data.result == 'success') {
				albumListItem.remove();
				return true;
			} else {
				return false;
			}			
		}			 
	);
}

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
					api_key: 'c7b42c8420929b071f04dde846040232',
					format: 'json',
					artist: artist,
					album: title
				}, 					
				function(data) {
					var image = data.album.image[2]['#text'];				
					$.getJSON(
						'album/add',
						{
							artist: artist,
							title: title,
							uri: uri,
							image: image 
						},
						function(data) {
							if (data.result == 'success') {
								$("#albums").append(data.data);
							}
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

function getUri(link) {
	// Apparently windows and Mac clients use : and / as separators respectively
	var result = link.match(/album[/:]{1}(.*)\"/)[1];
	return result;
}

addEvent(drop, 'drop', function (e) {
	if (e.preventDefault) e.preventDefault();  
	if (e.dataTransfer.types) {  
		var link = e.dataTransfer.getData('text/html');
		var albumUri = getUri(link);
		spotifyLookUp('spotify:album:' + albumUri);
	}
	return false;
});