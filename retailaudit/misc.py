from __future__ import print_function

import sys

def debug (msg):
	print("[DBG] {}".format(msg), file=sys.stderr)
	