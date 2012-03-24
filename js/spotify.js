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

function handleUri(uri) {
	var matcher = uri.match("spotify:(.+):.+");
	var sEntity = matcher[1];
	if(sEntity == "track") {
		models.Track.fromURI(uri, function(track) {
			saveAlbum(track.album);
		});
		return album 
	} else if(sEntity == "album") {
		models.Album.fromURI(uri, function(album) { 
			saveAlbum(album);
		});
	}
	alert("FOUT");
	return;
}

function saveAlbum(album) {
	$.getJSON(
		'http://albumify.appspot.com/album/add',
		{
			"artist": album.artist,
			"title": album.name,
			"uid": uid,
			"uri": album.uri
		},
		function(data) {
			var vlees = data;
			appendAlbum(album.uri);
		}
	)
}

function appendAlbum(uri) {
	models.Album.fromURI(uri, function(album) {
	   
	   var playerView = new views.Player();
	   var uri = album.data.uri;
	   playerView.context = album;

	   $('#albums').append('<li><div class="album"><span class="artist">' + album.data.artist.name + '</span><span class="title">' + album.data.name + '</span></div></li>');
	   $('#albums li div').last().prepend(playerView.node);

	});  
}

var AlbumifyApp = function() {

    sp = getSpotifyApi(1);
	
	jQuery.ajaxSettings.traditional = true;  
	
	models = sp.require("sp://import/scripts/api/models");
	views = sp.require("sp://import/scripts/api/views");
	uid = models.session.anonymousUserID;

	models.application.observe(models.EVENT.LINKSCHANGED, function() {
		var uris = sp.core.getLinks();
		for (var i = 0; i < uris.length; i++) {
			var uri = uris[i];
			handleUri(uri);
		}
	});
	
	function addAlbum(uri) {
		models.Album.fromURI(uri, function(album) {

			var playerView = new views.Player();
			var uri = album.data.uri;
			playerView.context = album;

			//$('#albums').append('<li><div class="album"><span class="artist">' + album.data.artist.name + '</span><span class="title">' + album.data.name + '</span><a class="delete" href="album/delete?id=vis">Delete</a></div></li>');
			//$('#albums li div').last().prepend(playerView.node);
			
			$('#albums').append('<li><div class="album"><div class="block panel"><div class="front"></div><div class="back"><div class="album-options"><span>Achterkant!</span></div></div></div><span class="artist">' + album.data.artist.name + '</span><span class="title">' + album.data.name + '</span><a class="delete">Options</a></div></li>');
			$('.front').last().prepend(playerView.node);
			
			$('.album .delete').click(function() {
				$(this).parents('.album').children('.block').addClass('flip');
			
			});
		});
	};

    this.start = function() {
		
		$.getJSON(
			'http://albumify.appspot.com/spotify/albums?uid=' + uid, 
			{ 'format':'jsonp'},
			function(data) {
				
				//albums = ["spotify:album:35w2w6W38bXCo4bG1akRe9", "spotify:album:6oCjJIyWNMF0uxbGDGq65o", "spotify:album:4nhQOvGsUFmEzhnYh2fgDj", "spotify:album:3yfisavFdGTrjFf9Ecpbio", "spotify:album:2gyoqhcdYUTxcgYxZQbFOD", "spotify:album:5nqgEyhPNugdoETdNlrief", "spotify:album:1x4VX5aPBAIBpbX32eweOE", "spotify:album:2JfoihpwOWLaCgYmxgRzG7", "spotify:album:2xykAbcaLmHmF9G4hUebwH", "spotify:album:5qSXvIPDtO2Gfv3CTRnPJD", "spotify:album:3hmNV7XrYwJOknTC1lhOBg", "spotify:album:4A366gjTrYQwmRtkTezF2W", "spotify:album:0jaD0L89ZEZUF49YghjDp0", "spotify:album:6ZCpZTUdnrBYV1zBIEbZ6r", "spotify:album:4ruhfnoG5GVLcK8z9MYQMo", "spotify:album:1EGgZgY8BFqFqAc7rq5j8r", "spotify:album:16YSqpVeT6R8KyvafdnttF", "spotify:album:5dBQ20ppdPxo5bqkoeTKnN", "spotify:album:0yMBLz3X4Jm16nc5sfxE6Y", "spotify:album:70W4zRpexYYJZRUauTxTMr", "spotify:album:7qW3WIgUs190iAHid51U6D", "spotify:album:2sHLF60ORpmqa1DXs2w5Lz", "spotify:album:6idKsZpZsfNfC6FFws8zL4", "spotify:album:0InkR5esL4V9dWG68Hy2qM", "spotify:album:12X80pgkHSjMDgAAS0HBdr", "spotify:album:38pjkeQZPyZGDfGaPEZzt9", "spotify:album:0C7sxExzbaHFgJfF1BM2NM", "spotify:album:77aNausiDMPqpNVHxDeoVK", "spotify:album:27dGFOlEBD1TKTRevAXprt", "spotify:album:1Vwkym9HsXyW3ZHaBxPC3t", "spotify:album:7qkhD8BT5oEEKzVzYTaKVX"];
				albums = data.albums
				
				for(var i in albums) {
					var uri = albums[i];
					appendAlbum(uri);

				}
			}
		);
		
    };
};
