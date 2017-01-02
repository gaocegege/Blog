#!/usr/bin/python
import sys
import time
import os.path

def writeTemplate(objname):
	today = time.strftime('%Y-%m-%d-')
	filename = today + objname + '.md'
	if os.path.exists(filename):
		print "Error: file content."
		return;
	f = open(filename, 'w')
	f.write("---\nlayout: post\ntitle: \"\"\ndescription: \nheadline:\nmodified: " + today[:-1] + "\ncategory: \ntags: []\nimagefeature:\nmathjax: false\nchart:\ncomments: true\nfeatured: true\n---\n")
	f.write("""## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commerical use.
""")
	print "Write Done."

def main():
	if len(sys.argv) != 2:
		print "Error: argv."
		return;
	filename = sys.argv[1]
	writeTemplate(filename)

main()