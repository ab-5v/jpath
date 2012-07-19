all: build

build:
	requirer index.js jpath.js

prod: build
	uglifyjs -o jpath.min.js jpath.js

.PHONY: all
