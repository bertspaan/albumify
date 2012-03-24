#!/usr/bin/env python
#
#

import os
from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template
from django.utils import simplejson

class Album(db.Model):
	artist = db.StringProperty()
	title = db.StringProperty()
	uri = db.StringProperty(indexed=False)
	uid = db.StringProperty(indexed=True)
	added = db.DateTimeProperty(auto_now_add=True)
	order = db.IntegerProperty()

	templatePath = os.path.join(os.path.dirname(__file__), 'album.html')

	@staticmethod
	def getAll(uid):
		query = Album.all();
		query.filter("uid =", uid)
		query.order("order")
		return query

	@classmethod
	def get_by_id(cls, ids, parent=None, **kwargs):
		uid = kwargs['uid']
		album = super(Album, cls).get_by_id(ids, parent=parent, {})
		if uid != album.uid:
			raise "Not allowed"
		return album

	def delete(self, **kwargs):
		uid = kwargs['uid']
		if uid != self.uid:
			raise "Not allowed"
		db.Model.delete(self, **kwargs)

	def render(self):
		htmlAlbum = template.render(self.templatePath, {'album' : self})
		return htmlAlbum

class MainHandler(webapp.RequestHandler):

	def get(self):
		uid = self.request.get("uid")
		query = Album.getAll(uid)		
		htmlAlbums = [album.render() for album in query]
		template_values = {
			'albums' : htmlAlbums,
		}	
		indexTmplPath = os.path.join(os.path.dirname(__file__), 'webapp.html')
		self.response.out.write(template.render(indexTmplPath, template_values))

class AlbumAddHandler(webapp.RequestHandler):
	def get(self):
		uid = self.request.get("uid")
		query = Album.getAll(uid)		
		order = query.count() + 1
		artist = self.request.get('artist')
		title = self.request.get('title')
		uri	= self.request.get('uri')
		album = Album(artist=artist, title=title, uri=uri, uid=uid, order=order)
		album.put()
		html = album.render()
		json = simplejson.dumps({'result': 'success', 'data': html})
		self.response.out.write(json)

class AlbumDeleteHandler(webapp.RequestHandler):
	def get(self):
		albumId = int(self.request.get('id'))	
		album = Album.get_by_id(albumId, uid=self.request.get("uid"))
		try:
			album.delete()
			success = True
		except db.NotSavedError:
			success = False
		self.response.out.write(jsonSuccess(success))

class AlbumOrderHandler(webapp.RequestHandler):
	def get(self):
		order = 0
		uid = self.request.get("uid")
		ids = map(int, self.request.get('ids').split(','))			
		for albumId in ids:				
			album = Album.get_by_id(albumId, uid=uid)	
			if album is None:
				continue
			album.order = order
			try:
				album.put()
				order += 1
			except db.NotSavedError:
				self.response.out.write(jsonSuccess(False))
				return
		self.response.out.write(jsonSuccess(True))

class SpotifyAlbumAddHandler(webapp.RequestHandler):
	def get(self):
		uid = self.request.get("uid")
		query = Album.getAll(uid)		
		order = query.count() + 1
		artist = self.request.get('artist')
		title = self.request.get('title')
		uri	= self.request.get('uri')
		album = Album(artist=artist, title=title, uri=uri, uid=uid, order=order)
		album.put()
		json = simplejson.dumps({'id': album.key().id(), 'uri': uri})
		self.response.out.write(json)

class SpotifyAlbumsHandler(webapp.RequestHandler):
	def get(self):
		self.response.headers.add_header("Access-Control-Allow-Origin", "*")
		uid = self.request.get("uid")
		query = Album.getAll(uid)
		query.order('order')
		callback = self.request.get('callback')
		albums = []
		for album in query:				
			albums.append({'id': album.key().id(), 'uri': album.uri})
		json = simplejson.dumps({'albums': albums})
		if callback:
			self.response.headers["Content-Type"] = "application/javascript"		
			self.response.out.write(callback + '(' + json + ')')
		else:
			self.response.headers["Content-Type"] = "application/json"
			self.response.out.write(json)	

def jsonSuccess(succes):
	return '{"result":"success"}' if succes else '{"result":"failed"}'

def main():
	application = webapp.WSGIApplication([
		('/', MainHandler), ('/album/add', AlbumAddHandler), 
		('/album/delete', AlbumDeleteHandler), 
		('/album/order', AlbumOrderHandler),
		('/spotify/albums', SpotifyAlbumsHandler),
		('/spotify/add', SpotifyAlbumAddHandler),
	],debug=True)
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()
