// modules
var cheerio = require('cheerio');
var fs = require('fs');
var globby = require('globby');
var gutil = require('gulp-util');
var Handlebars = require('handlebars');
var matter = require('gray-matter');
var path = require('path');
var through = require('through2');
var _ = require('lodash');


/**
 * Assembly data storage
 * @type {Object}
 */
var assembly = {
	defaults: {
		layout: 'default',
		layouts: 'src/templates/layouts/**/*',
		materials: 'src/templates/materials/**/*',
		data: 'src/data/**/*.json'
	},
	options: {},
	layouts: {},
	data: {}
};


/**
 * Get the name of a file (minus extension) from a path
 * @param  {String} filePath
 * @return {String}
 */
var getFileName = function (filePath) {
	return path.basename(filePath).replace(/\.[^\/.]+$/, '');
};


/**
 * Build the template context by merging page gray-matter data with assembly data
 * @param  {Object} matterData
 * @return {Object}
 */
var buildContext = function (matterData) {
	return _.extend({}, matterData, assembly.data);
};


/**
 * Insert the page into the layout
 * @param  {String} page   [description]
 * @param  {String} layout [description]
 * @return {String}        [description]
 */
var wrapPage = function (page, layout) {
	return layout.replace(/\{\%\s?body\s?\%\}/, page);
};


/**
 * Register  with Handlebars
 */
var registerPartials = function () {

	// get files
	var files = globby.sync(assembly.options.materials);

	// register each partial
	files.forEach(function (file) {
		var name = getFileName(file);
		var content = fs.readFileSync(file, 'utf-8');
		Handlebars.registerPartial(name, content);
	});

};


/**
 * Register helpers with Handlebars
 */
var registerHelpers = function () {

	// get files
	var files = globby.sync(assembly.options.materials);

	// register each helper
	files.forEach(function (file) {
		var name = getFileName(file);
		var content = fs.readFileSync(file, 'utf-8');
		Handlebars.registerHelper(name, function () {

			// get helper classes if passed in
			var helperClasses = (typeof arguments[0] === 'string') ? arguments[0] : '';

			// init cheerio
			var $ = cheerio.load(content);

			// add helper classes to first element
			$('*').first().addClass(helperClasses);

			return new Handlebars.SafeString($.html());

		});
	});

};


/**
 * Get layout files
 */
var getLayouts = function () {

	// get files
	var files = globby.sync(assembly.options.layouts);

	// save content of each file
	files.forEach(function (file) {
		var name = getFileName(file);
		var content = fs.readFileSync(file, 'utf-8');
		assembly.layouts[name] = content;
	});

};


/**
 * Get data
 */
var getData = function () {

	// get files
	var files = globby.sync(assembly.options.data);

	// save content of each file
	files.forEach(function (file) {
		var name = getFileName(file);
		var content = JSON.parse(fs.readFileSync(file, 'utf-8'));
		assembly.data[name] = content;
	});

};


/**
 * Setup the assembly
 * @param  {Objet} options  User options
 */
var setup = function (options) {

	// merge user options with defaults
	assembly.options = _.extend({}, assembly.defaults, options);

	registerPartials();
	registerHelpers();
	getLayouts();
	getData();

};


/**
 * Module exports
 * @param  {Object} options User options
 * @return {Object}         Stream
 */
module.exports = function (options) {

	// setup assembly
	setup(options);

	// assemble
	return through.obj(function (file, enc, cb) {

		// stop if no files
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		// stop if stream
		if (file.isStream()) {
			cb(new gutil.PluginError('assemble', 'Streaming not supported'));
			return;
		}

		// attempt assembly
		try {

			// get page gray matter and content
			var pageMatter = matter(file.contents.toString());
			var pageContent = pageMatter.content;

			// template using Handlebars
			var source = wrapPage(pageContent, assembly.layouts[pageMatter.data.layout || assembly.options.layout]);
			var context = buildContext(pageMatter.data);
			var template = Handlebars.compile(source);

			// write file contents
			file.contents = new Buffer(template(context));
			this.push(file);

		} catch (errs) {
			this.emit('error', 'Error: Could not assemble.');
		}

		cb();
	});

};
