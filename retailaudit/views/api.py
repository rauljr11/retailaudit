
from __future__ import print_function

import requests
import sys
import simplejson as json
from retailaudit import app

def do_request (method, uri, headers, data=None, json=None):
	try:
		res = requests.request(
				method.upper(),
				uri,
				headers = headers,
	            timeout = 30,
            	data = data if data else None,
            	json = json if json else None
			)

		if res.status_code == 200:
			return res.json()
		else:
			return []
	except Exception, e:
		app.dbg(e)
		return []

def skus_lists():
	sku_url = app.config['API_URL']+app.config['SKU_URL']
	data = do_request('get', sku_url, {'Content-type': 'application/json'})
	response = []
	if data is None:
		return {'data': [], 'status': 'error'}
	else:
		for x in data['data']:
			response.append({'value': x['product_id'], 'label': x['title']})

		return {'data': response, 'status': 'success'}

def transaction_lists(method, page, perPage):
	if (method == "DELETE") :
		transaction_url = app.config['API_URL']+app.config['TRANSACTIONS_URL']
	else:
		transaction_url = app.config['API_URL']+app.config['TRANSACTIONS_URL']+'?start='+page+'&length='+perPage
	
	data = do_request(method, transaction_url, {'Content-type': 'application/json'})
	return data