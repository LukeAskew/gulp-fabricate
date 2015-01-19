var assert = require('assert');
var fabricate = require('../');
var fs = require('fs');
var gutil = require('gulp-util');
var minify = require('html-minifier').minify;

describe('gulp-fabricate', function () {

	it('should assemble a template', function (cb) {

		var stream = fabricate({
			layout: 'default',
			layouts: './test/fixtures/templates/layouts/**/*',
			materials: './test/fixtures/templates/materials/**/*',
			data: './test/fixtures/data/**/*.json',
		});

		var expected = minify(fs.readFileSync('./test/fixtures/expected.html', 'utf-8'), { collapseWhitespace: true });

		stream.on('end', cb);

		stream.write(new gutil.File({
			contents: new Buffer(fs.readFileSync('./test/fixtures/templates/pages/index.html', 'utf-8'))
		}));

		stream.on('data', function (data) {
			assert.equal(minify(data.contents.toString(), { collapseWhitespace: true }), expected);
		});

		stream.end();

	});

});


