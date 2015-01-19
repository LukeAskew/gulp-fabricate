# gulp-fabricate

> A gulp plugin for Fabricating pages.

## Template Assembly

Templates can be assembled dynamically using Handlebars and JSON and/or [front matter](https://www.npmjs.com/package/gray-matter) as a data model.


### Assembly parts

- **Layouts**: wrapper templates
- **Pages**: individual pages
- **Partials**: partial templates; registered as "partials" in Handlebars
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

#### Partials

Partials are template partials and are registered as Handlebars partials. They are accessed like:

```
{{> partial-name}}
```

Any file in the glob defined in `config.templates.assemble.partials` is turned into a partial and can be accessed as such. For example, assume the `components` contains partials:

```
└── components
    ├── button.html
    └── form-toggle.html
```

The content within these files can be accessed in templates as such:

```html
{{> button}}
{{> form-toggle}}
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
