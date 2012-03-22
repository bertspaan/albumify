#!/usr/bin/env python
#
#

import os
from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.api import users
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template
from django.utils import simplejson

class Album(db.Model):
	artist = db.StringProperty()
	title = db.StringProperty()
	uri = db.StringProperty(indexed=False)
	image = db.StringProperty(indexed=False)
	added = db.DateTimeProperty(auto_now_add=True)
	user = db.UserProperty()
	order = db.IntegerProperty()

	templatePath = os.path.join(os.path.dirname(__file__), 'album.html')

	@staticmethod
	def getAll():
		user = users.get_current_user()
		query = Album.all();
		query.filter("user =", user)
		query.order("order")
		return query

	@classmethod
	def get_by_id(cls, ids, parent=None, **kwargs):
		album = super(Album, cls).get_by_id(ids, parent=parent, **kwargs)
		if users.get_current_user() != album.user:
			raise "Not allowed"
		return album

	def delete(self, **kwargs):
		if users.get_current_user() != self.user:
			raise "Not allowed"
		db.Model.delete(self, **kwargs)

	def render(self):
		htmlAlbum = template.render(self.templatePath, {'album' : self})
		return htmlAlbum

class MainHandler(webapp.RequestHandler):

	def get(self):
		user = users.get_current_user()
		if user is None:
			self.redirect(users.create_login_url(self.request.uri))
			return
		query = Album.getAll()		
		htmlAlbums = [album.render() for album in query]
		template_values = {
			'albums' : htmlAlbums,
			'username' : user.nickname()				
		}	
		indexTmplPath = os.path.join(os.path.dirname(__file__), 'index.html')
		self.response.out.write(template.render(indexTmplPath, template_values))

class AlbumAddHandler(webapp.RequestHandler):
	def get(self):
		user = users.get_current_user()
		if user is None:
			self.redirect(users.create_login_url(self.request.uri))
			return
		query = Album.getAll()		
		order = query.count() + 1
		artist = self.request.get('artist')
		title = self.request.get('title')
		uri	= self.request.get('uri')
		image = self.request.get('image')
		album = Album(artist=artist, title=title, uri=uri, image=image, user=user, order=order)
		album.put()
		html = album.render()		
		json = simplejson.dumps({'result': 'success', 'data': html})
		self.response.out.write(json)

class AlbumDeleteHandler(webapp.RequestHandler):
	def get(self):
		user = users.get_current_user()
		if user is None:
			return
		albumId = int(self.request.get('id'))	
		album = Album.get_by_id(albumId)
		try:
			album.delete()
			success = True
		except db.NotSavedError:
			success = False
		self.response.out.write(jsonSuccess(success))

class AlbumOrderHandler(webapp.RequestHandler):
	def get(self):
		user = users.get_current_user()
		if user is None:
			return
		order = 0
		ids = map(int, self.request.get('ids').split(','))			
		for albumId in ids:				
			album = Album.get_by_id(albumId)			
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

class SpotifyAlbumsHandler(webapp.RequestHandler):
	def get(self):
		self.response.headers.add_header("Access-Control-Allow-Origin", "*")
		query = Album.getAll()		
		query.order('order')
		callback = self.request.get('callback')
		albums = []
		for album in query:				
			albums.append(album.uri)
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
		('/spotify/albums', SpotifyAlbumsHandler)
	],debug=True)
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()
