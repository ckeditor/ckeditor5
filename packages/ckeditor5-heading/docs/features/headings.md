---
category: features
---

# Headings

{@snippet features/heading-source}

The heading feature helps you structure your document by adding headings to parts of the text. They make your content easier to scan by both readers and search engines.

## Demo

Use the toolbar dropdown to style a heading, or type one or more `#` characters (depending on the heading level), followed by a space, to start a new heading with the {@link features/autoformat autoformatting feature}.

{@snippet features/default-headings}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Heading levels

By default, this feature is configured to support `<h2>`, `<h3>`, and `<h4>` elements which are named: "Heading 1", "Heading 2" and "Heading 3", respectively. The rationale behind starting from `<h2>` is that `<h1>` should be reserved for the {@link features/title page's main title} and the page content will usually start from `<h2>`.

<info-box hint>
	Support for adding a document title is provided through the {@link module:heading/title~Title} plugin. This plugin is optional and needs to be {@link installation/plugins/installing-plugins added to your editor build}. When it is enabled, a `<h1>` element pasted into the editor will be rendered as the {@link features/title document title}.
</info-box>

By default, when your editor build does not include the title plugin, an `<h1>` element pasted into the rich-text editor is converted to `<h2>` ("Heading 1").

<info-box hint>
	You can read more about why the editor should not create `<h1>` elements for content headings in the [Headings section of Editor Recommendations](http://ckeditor.github.io/editor-recommendations/features/headings.html).
</info-box>

## Heading buttons

The heading feature lets you also use a set of heading buttons instead of the dropdown list. The toolbar buttons are configurable and it is possible to include a paragraph button, too. Compare the heading toolbar dropdown from the demo above with the heading buttons below to check the functionality and usability of this variation.

{@snippet features/heading-buttons}

## Configuration

### Configuring heading levels

You can configure which heading levels the editor will support and how they should be named in the Headings dropdown. Use the {@link module:heading/heading~HeadingConfig#options `heading.options`} configuration option to do so.

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
	.then( /* ... */ )
	.catch( /* ... */ );
```

{@snippet features/custom-heading-levels}

### Configuring custom heading elements

It is also possible to define fully custom elements for headings by using the {@link module:engine/conversion/conversion~ConverterDefinition advanced format} of the {@link module:heading/heading~HeadingConfig#options `heading.options`} configuration option.

For example, the following editor will support the following two heading options at the same time: `<h2 class="fancy">` and `<h2>`:

```html
<style>
	/* Styles for the heading in the content and for the dropdown item. */
	h2.fancy, .ck.ck-button.ck-heading_heading2_fancy {
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
	.then( /* ... */ )
	.catch( /* ... */ );
```

{@snippet features/custom-heading-elements}

### Configuring toolbar buttons

To use individual toolbar buttons instead of the heading dropdown, you need to properly configure the feature. You also need to import proper UI elements; see the [installation section](#installation-with-toolbar-heading-buttons) for instructions on how to do it.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: [ 'paragraph', 'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6', '|', 'undo', 'redo' ],
		heading: {
			options: [
				{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
				{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
				{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
				{ model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
				{ model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
				{ model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
				{ model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
			]
		}
	} )
	.then( /* ... */ )
    .catch( /* ... */ );
```
{@snippet features/custom-heading-buttons}


## Installation

<info-box info>
	This feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}. The installation instructions are for developers interested in building their own, custom editor.
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
		plugins: [ Heading, /* ... */ ],
		toolbar: [ 'heading', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Installation with toolbar heading buttons

To configure the toolbar buttons for styling text as headings and paragraphs, you need to import the following into your plugin list and configuration:

```js
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Related features

There are more CKEditor 5 features that can help you format your content:
* {@link features/basic-styles Basic text styles} &ndash; The essentials, like **bold**, *italic*, and others.
* {@link features/title Document title} &ndash; Clearly divide your content into a title and body.
* {@link features/indent Block indentation}  &ndash; Set indentation for text blocks such as paragraphs or lists.
* {@link features/lists Lists}  &ndash; Organize your content better with ordered and unordered lists you can style.
* {@link features/remove-format Remove format} &ndash; Easily clean basic text formatting.
* {@link features/autoformat Autoformatting} &ndash; Add formatting elements (such as headings) as you type with Markdown code.

## Common API

The {@link module:heading/heading~Heading} plugin registers:

* The `'heading'` dropdown.
* The `'heading'` command that accepts a value based on the {@link module:heading/heading~HeadingConfig#options `heading.options`} configuration option.

	You can turn the currently selected block(s) to headings by executing one of these commands:

	```js
	editor.execute( 'heading', { value: 'heading2' } );
	```

The {@link module:heading/headingbuttonsui~HeadingButtonsUI} plugin registers six UI button components that will execute the `'heading'` command with the proper value of the `value` attribute:

* `'heading1'`
* `'heading2'`
* `'heading3'`
* `'heading4'`
* `'heading5'`
* `'heading6'`

The {@link module:paragraph/paragraphbuttonui~ParagraphButtonUI} plugin registers the UI button component: `'paragraph'`.

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-heading](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-heading).
