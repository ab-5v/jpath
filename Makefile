TESTS=test/spec/*.js

all: build

build:
	requirer index.js jpath.js

prod: build
	uglifyjs -o jpath.min.js jpath.js

test:
	mocha --reporter dot $(TESTS)

.PHONY: all test
