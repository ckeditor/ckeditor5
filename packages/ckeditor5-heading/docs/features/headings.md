---
category: features
---

# Headings

{@snippet build-classic-source}

The {@link module:heading/heading~Heading} feature enables support for headings.

<info-box info>
	This feature is enabled by default in all builds.
</info-box>

## Heading levels

By default this feature is configured to support `<h2>`, `<h3>` and `<h4>` elements which are named: "Heading 1", "Heading 2" and "Heading 3", respectively. The rationale behind starting from `<h2>` is that `<h1>` should be reserved for the {@link features/title page's main title} and the page content will usually start from `<h2>`.

<info-box hint>
	Support for adding a document title is provided through the {@link module:heading/title~Title} plugin. This plugin is optional and needs to be {@link builds/guides/integration/installing-plugins added to your editor build}. When it is enabled, a `<h1>` element pasted into the editor will be rendered as the {@link features/title document title}.
</info-box>

By default, when your editor build does not include the title plugin, a `<h1>` element pasted into the rich-text editor is converted to `<h2>` ("Heading 1").

<info-box hint>
	You can read more about why the editor should not create `<h1>` elements for content headings in the [Headings section of Editor Recommendations](http://ckeditor.github.io/editor-recommendations/features/headings.html).
</info-box>

### Configuring heading levels

It is, of course, possible to configure which heading levels the editor should support and how they should be named in the Headings dropdown. Use the {@link module:heading/heading~HeadingConfig#options `heading.options`} configuration option to do so.

For example, the following editor will support only two levels of headings &mdash; `<h1>` and `<h2>`:

```html
<div id="editor">
	<h1>Heading 1</h1>
	<h2>Heading 2</h2>
	<p>This is <a href="https://ckeditor.com">CKEditor 5</a>.</p>
</div>
```

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		heading: {
			options: [
				{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
				{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
				{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
			]
		}
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/custom-heading-levels}

### Configuring custom heading elements

It is also possible to define fully custom elements for headings by using the {@link module:engine/conversion/conversion~ConverterDefinition advanced format} of the {@link module:heading/heading~HeadingConfig#options `heading.options`} configuration option.

For example, the following editor will support the following two heading options at the same time: `<h2 class="fancy">` and `<h2>`:

```html
<style>
	// Styles for the heading in the content and for the dropdown item.
	h2.fancy, .ck-heading_heading2_fancy {
		color: #ff0050;
		font-size: 17px;
	}
</style>

<div id="snippet-custom-heading-levels">
	<h1>Heading 1</h1>
	<h2>Heading 2</h2>
	<h2 class="fancy">Fancy Heading 2</h2>
	<p>This is <a href="https://ckeditor.com">CKEditor 5</a>.</p>
</div>
```

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		heading: {
			options: [
				{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
				{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
				{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
				{
					model: 'headingFancy',
					view: {
						name: 'h2',
						classes: 'fancy'
					},
					title: 'Heading 2 (fancy)',
					class: 'ck-heading_heading2_fancy',

					// It needs to be converted before the standard 'heading2'.
					converterPriority: 'high'
				}
			]
		}
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/custom-heading-elements}

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
		toolbar: [ 'heading', ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:heading/heading~Heading} plugin registers:

* The `'heading'` dropdown.
* The `'heading'` command that accepts value based on the {@link module:heading/heading~HeadingConfig#options `heading.options`} configuration option.

	You can turn the currently selected block(s) to headings by executing one of these commands:

	```js
	editor.execute( 'heading', { value: 'heading2' } );
	```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-heading.
