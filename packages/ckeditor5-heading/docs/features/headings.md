---
title: Headings
category: features
---

{@snippet build-classic-source}

The {@link module:heading/heading~Heading} feature enables support for headings.

<info-box info>
	This feature is enabled by default in all builds.
</info-box>

## Heading levels

By default this feature is configured to support `<h2>`, `<h3>` and `<h4>` elements which are named: "Heading 1", "Heading 2" and "Heading 3", respectively. The rationale behind starting from `<h2>` is that `<h1>` should be reserved for the page's main title and the page content will usually start from `<h2>`.

<info-box hint>
	You can read more about why the editor should not create `<h1>` elements in the [Headings section of Editor Recommendations](http://ckeditor.github.io/editor-recommendations/features/headings.html).
</info-box>

### Configuring heading levels

It is, of course, possible to configure which heading levels the editor should support and how they should be named in the Headings dropdown. Use the {@link module:heading/heading~HeadingConfig#options `heading.options`} configuration option to do so.

For example, the following editor will support only two levels of headings &mdash; `<h1>` and `<h2>`:


```html
<div id="editor">
	<h1>Heading 1</h1>
	<h2>Heading 2</h2>
	<p>This is <a href="https://ckeditor5.github.io">CKEditor 5</a>.</p>
</div>
```

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		heading: {
			options: [
				{ modelElement: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
				{ modelElement: 'heading1', viewElement: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
				{ modelElement: 'heading2', viewElement: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
			]
		}
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/custom-heading-levels}

## Installation

<info-box info>
	This feature is enabled by default in all builds. The installation instructions are for developers interested in building their own, custom editor.
</info-box>

To add this feature to your editor install the [`@ckeditor/ckeditor5-heading`](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading) package:

```
npm install --save @ckeditor/ckeditor5-heading
```

And add it to your plugin list and toolbar configuration:

```js
import Heading from '@ckeditor/ckeditor5-heading/src/heading';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Heading, ... ],
		toolbar: [ 'headings', ... ]
	} )
	.then( ... )
	.catch( ... );
```

## Common API

The {@link module:heading/heading~Heading} plugin registers:

* The `'headings'` dropdown.
* The `'heading1'`, `'heading2'`, ..., `'headingN'` commands based on the {@link module:heading/heading~HeadingConfig#options `heading.options`} configuration option.

	You can turn the currently selected block(s) to headings by executing one of these commands:

	```js
	editor.execute( 'heading2' );
	```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-heading.
