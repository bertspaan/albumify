#!/usr/bin/env python
#
#

import os
from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.api import users
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template

class Album(db.Model):
	artist = db.StringProperty()
	title = db.StringProperty()
	uri = db.StringProperty()
	image = db.StringProperty()
	added = db.DateTimeProperty(auto_now_add=True)

class MainHandler(webapp.RequestHandler):
	def get(self):
		user = users.get_current_user()

		if user:		
			query = Album.all()		
			template_values = {
				'albums': query,
				'user': user.nickname()
			}		
			path = os.path.join(os.path.dirname(__file__), 'index.html')
			self.response.out.write(template.render(path, template_values))
		else:
			self.redirect(users.create_login_url(self.request.uri))

class AlbumHandler(webapp.RequestHandler):
	def get(self):
		artist = self.request.get('artist')
		title = self.request.get('title')
		uri	= self.request.get('uri')
		image = self.request.get('image')
		
		Album(artist=artist, title=title, uri=uri, image=image).put()
		
		self.response.out.write('succes')	

def main():
	application = webapp.WSGIApplication([('/', MainHandler), ('/album', AlbumHandler)], debug=True)
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()
