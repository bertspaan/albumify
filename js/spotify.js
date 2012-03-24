$(document).ready(function() {	
	$("#albums").sortable({
		update: function(event, ui) {			
			var order = new Array();

			$('#albums li').each(function(index) {
			    order.push($(this).attr('data-internalid'));
			});			
			/*
			$.getJSON(
				'album/order',
				{
					ids: order.join(',')
				},
				function(data) {
					return data.result == 'success';
				}
			);
			*/
		}
	});
});

function addAlbums(data) {
	   console.log(data);
}



var AlbumifyApp = function() {

    var app = this;

    // Intentionally global;
    // Set up for spotify supplied components
    sp = getSpotifyApi(1);
	jQuery.ajaxSettings.traditional = true;  
	
    AlbumifyApp.Spotify = {
        Api: sp,
		/*Model: sp.require("sp://import/scripts/api/models"),
        View: sp.require("sp://import/scripts/api/views")*/
    };
	m = sp.require("sp://import/scripts/api/models");


    this.start = function() {
		
		$.getJSON(
			'http://albumify.appspot.com/spotify/albums?callback=?', 
			{ 'format':'jsonp'},
			function(data) {
				albums = data.albums
				for(var i in albums) {
					var uri = albums[i];
					m.Album.fromURI(uri, function(album) {
						$('#albums').append('<li><a href="' + album.data.uri + '"><img src="' + album.data.cover + '" /><a/></li>');
					});			
				}
			}
		);
		
		
		
	/*	for(var i in albums) {
			var uri = albums[i];
			m.Album.fromURI(uri, function(album) {
				$('#albums').append('<li><img src="' + album.data.cover + '" /></li>');
			});			
		}*/
    };
};