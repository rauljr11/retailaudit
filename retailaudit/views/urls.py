from __future__ import print_function

import os

import requests
import simplejson as json
from flask import make_response, render_template, request, redirect, url_for, session

from retailaudit import app
from retailaudit.views.api import skus_lists, transaction_lists

@app.route('/')
def index():
	args = {}
	args['img_url_base'] = app.config['API_URL']+app.config['IMAGE_URL']
	args['transaction_per_page'] = app.config['TRANSACTION_PER_PAGE']
	return render_template('pages/audit.html', args=args)

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])
def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload_image', methods=['POST'])
def upload_image():
	if 'file' not in request.files:
		return json.dumps({'status': 'error', 'message': 'File Image not found'})

	file_ = request.files['file']
	if file_.filename == '':
		return json.dumps({'status': 'error', 'message': 'No file received'})

	if not allowed_file(file_.filename):
		return json.dumps({'status': 'error', 'message': 'File type not allowed'})

	return json.dumps({'status': 'success', 'message': 'Image accepted'})

@app.route('/skus')
def get_skus():
	data = skus_lists()
	return json.dumps(data)

@app.route('/send_to_api', methods=['POST'])
def send_to_api():
	try:
		apiUrl = app.config['API_URL']+app.config['AUDIT_URL']
		productId = request.form.get('product_id')
		file_ = request.files['file']
		response = requests.post(apiUrl,
            files = {'file': (file_.filename, file_.stream)},
            data = {'product_id': productId, 'content_type': ''},
            timeout = 30
        )
		if response.status_code == 200:
			data = response.json()
			return json.dumps(data)
		else:
			app.dbg(response.status_code)
			return json.dumps({'status': 'error', 'message': 'Server returned an error'});

	except Exception, e:
		app.dbg(e)
		return json.dumps({'status': 'error', 'message': 'Server returned an error'});

@app.route('/transactions', methods=['GET','DELETE'])
def get_transactions():
	try:
		p = request.args.get('start')
		l = request.args.get('length')
		data = transaction_lists(request.method, p, l)
		return json.dumps(data)
	except Exception, e:
		app.dbg(e);
		return json.dumps({'status': 'error', 'message': 'Server returned an error'})
	
