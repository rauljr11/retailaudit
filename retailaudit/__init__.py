#
# File: py/retailaudit/__init__.py
# Author: Raul Peremne Jr
#

from flask import Flask
from retailaudit import config, misc
from retailaudit.proxy import ReverseProxied

app = Flask(__name__)
app.config.from_object(config)
app.wsgi_app = ReverseProxied(app.wsgi_app)

app.dbg = misc.debug

import retailaudit.views.urls
import retailaudit.views.api