# gulp-fabricate

> A gulp plugin for fabricating pages using Handlebars, JSON, and front-matter.

Turn this:

```html
---
title: Document Name
name: World
---

<h1>{{home.greeting}}, {{name}}!</h1>

{{> button}}
```

into this:

```html
<!doctype html>
<html lang="en">
<head>
    <title>Document Name</title>
</head>
<body>

    <h1>Hello, World!</h1>

    <a href="#" class="button">Click me!</a>

</body>
</html>
```

## Usage

Install:

```
$ npm install --save-dev gulp-fabricate
```

Example:

```js
var fabricate = require('gulp-fabricate');
var gulp = require('gulp');

gulp.task('templates', function () {
	return gulp.src('src/templates/pages/**/*')
		.pipe(fabricate())
		.pipe(gulp.dest('dist/'));
});
```

## Options

### options.layout

Type: `String`  
Default: `default`

Default layout template.

### options.layouts

Type: `String` or `Array`  
Default: `src/templates/layouts/**/*`

Files to use a layout templates.

### options.materials

Type: `String` or `Array`  
Default: `src/templates/materials/**/*`

Files to use a partials/helpers.


### options.data

Type: `String` or `Array`  
Default: `src/data/**/*.json`

JSON files to use as data for templates.

## API

### Definitions

- **Layouts**: wrapper templates
- **Pages**: individual pages
- **Materials**: partial templates; registered as "partials" and "helpers" in Handlebars
- **Data**: JSON data piped in as template context

#### Layouts

Layouts are wrappers for page templates. You can define as many layouts as you want by creating `.html` files in your layouts folder.

Example layout:

```html
<!doctype html>
<html lang="en">
<head>
    <title>{{title}}</title>
</head>
<body>

    {% body %}

</body>
</html>
```

Page content is inserted in the `{% body %}` placeholder.

Context can be passed from a page to the layout via front matter.

The layout a page uses is also defined in front matter:

```html
---
layout: custom-layout
title: My Custom Layout
---
```

This would use `custom-layout.html`.

When no `layout` property is defined, the page uses the `default` layout.

#### Pages

Pages can be templated using Handlebars.

Example page:

```html
---
title: Document Name
name: World
---

<h1>{{home.greeting}}, {{name}}!</h1>

{{> button}}

```

This outputs a page that uses the default layout (since no layout was defined).

The front matter block at the top provides context to both the layout and the page itself.

Context is also piped in from data files (see below). In this example, `{{home.greeting}}` refers to the `greeting` property in `home.json`.

#### Materials

Materials are partial templates; think of them as the materials used to build pages. 

They are accessible as either a "partial" or a "helper":

```
<!-- partial -->
{{> material-name}}

<!-- helper -->
{{material-name}}
```

Any file in the glob defined in `config.templates.assemble.materials` is turned into a partial/helper and can be accessed as such. For example, assume the `components` contains materials:

```
└── components
    ├── button.html
    └── form-toggle.html
```

The content within these files can be accessed in templates as such:

```html
{{> button}}
{{form-toggle}}
```

##### Partial vs Helper

The main difference between materials as partial vs helper is the way in which you pass data into the material. When a material is defined as a partial, you can pass it context. When a material is used as a helper, you can pass it a "helper class" parameter, which is helpful when writing OOCSS.

**Partials:**

Assume `items` is an array of items. You can pass the `items` to the partial:

```html
{{> material-name items}}
```

Your `material-name.html` file could look like:

```html
{{#each item}}
	<li>{{item.name}}</li>
{{/each}}
```

**Helper**

You can pass a "helper class" to the helper:

```html
{{material-name "foo-bar"}}
```

Assume your `material-name.html` looks like:

```html
<div>Material</div>
```

The helper will output:

```html
<div class="foo-bar">Material</div>
```

#### Data

Data for templates is defined as JSON.

The `data` folder can contain several `.json` files:

```
└── data
    ├── home.json
    └── contact.json
```

`home.json`:

```json
{
  "greeting": "Hello"
}
```

The data within each file can be accessed in the templates using dot notation:

```html
{{home.greeting}}
{{contact.propName}}
```
