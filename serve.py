import os
from retailaudit import app

extra_dirs = ['retailaudit/templates', 'retailaudit/static']
extra_files = extra_dirs[:]
for extra_dir in extra_dirs:
    for dirname, dirs, files in os.walk(extra_dir):
        for filename in files:
            filename = os.path.join(dirname, filename)
            if os.path.isfile(filename):
                extra_files.append(filename)

if __name__ == '__main__':
	app.run(port=int(app.config['PORT']),
		extra_files=extra_files,
		threaded=True,
		debug=True)          