---
title: Headings
category: features
---

The {@link module:heading/heading~Heading} feature enables support for headings.

<info-box info>
	This feature is enabled by default in all builds. It is also included in the {@link module:presets/article~Article Article preset}.
</info-box>

## Heading levels

By default this feature is configured to support `<h2>`, `<h3>` and `<h4>` elements which are named accordingly "Heading 1", "Heading 2" and "Heading 3". The rationale behind starting from `<h2>` is that `<h1>` should be reserved for page's main title and the page's content will usually start from `<h2>`.

<info-box hint>
	You can read more about why the editor should not create `<h1>` elements in [Headings page of Editor Recommendations](http://ckeditor.github.io/editor-recommendations/features/headings.html).
</info-box>

### Configuring heading levels

It is, of course, possible to configure which heading levels the editor should support and how they should be named in the Headings dropdown. Use the {@link module:heading/heading~HeadingConfig#options `heading.options`} config option to do so.

The following editor will support only two levels of headings – `<h1>` and `<h2>`:

```js
ClassicEditor
	.create( {
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

{@snippetTODO custom-heading-levels}

Read more about the `heading.options` format in {@link module:heading/heading~HeadingConfig#options the option's API documentation}.

## Installation

To add this feature to your editor install the [`@ckeditor/ckeditor5-heading`](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading) package:

```
npm install --save @ckeditor/ckeditor5-heading
```

And add it to your plugin list and toolbar configuration:

```js
import Heading from '@ckeditor/ckeditor5-heading/src/heading';

ClassicEditor
	.create( {
		plugins: [ Heading, ... ],
		toolbar: [ 'headings', ... ]
	} )
	.then( ... )
	.catch( ... );
```

If you are using editor build see how to {@linkTODO customize builds}.

### Common API

The {@link module:heading/heading~Heading} plugin registers:

* the `'headings'` dropdown.
* `'heading1'`, `'heading2'`, ..., `'headingN'` commands based on the {@link module:heading/heading~HeadingConfig#options `heading.options`} config option.

	You can turn the currently selected block(s) to headings by executing one of these commands:

	```js
	editor.execute( 'heading2' );
	```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-heading.
