var assert = require('assert');
var fabricate = require('../');
var fs = require('fs');
var gutil = require('gulp-util');
var minify = require('html-minifier').minify;

describe('gulp-fabricate', function () {

	var fabricateOptions = {
		layout: 'default',
		layouts: './test/fixtures/views/layouts/**/*',
		materials: './test/fixtures/materials/**/*',
		data: './test/fixtures/data/**/*.{yml,json}',
		docs: './test/fixtures/docs/**/*'
	};

	it('should assemble a template', function (cb) {

		var file = './test/fixtures/views/index.html';

		var stream = fabricate(fabricateOptions);

		var expected = minify(fs.readFileSync('./test/fixtures/expected/index.html', 'utf-8'), { collapseWhitespace: true });

		stream.on('end', cb);

		stream.write(new gutil.File({
			path: './test/fixtures/views/index.html',
			contents: new Buffer(fs.readFileSync(file, 'utf-8'))
		}));

		stream.on('data', function (data) {
			assert.equal(minify(data.contents.toString(), { collapseWhitespace: true }), expected);
		});

		stream.end();

	});


	it('should assemble docs', function (cb) {

		var file = './test/fixtures/views/docs.html';

		var stream = fabricate(fabricateOptions);

		var expected = minify(fs.readFileSync('./test/fixtures/expected/docs.html', 'utf-8'), { collapseWhitespace: true });

		stream.on('end', cb);

		stream.write(new gutil.File({
			path: file,
			contents: new Buffer(fs.readFileSync(file, 'utf-8'))
		}));

		stream.on('data', function (data) {
			assert.equal(minify(data.contents.toString(), { collapseWhitespace: true }), expected);
		});

		stream.end();

	});

});


