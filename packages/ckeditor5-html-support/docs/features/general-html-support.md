---
category: features
modified_at: 2021-07-14
---

# General HTML Support

{@snippet features/general-html-support-source}

The General HTML Support ("GHS") feature allows developers to easily enable HTML features that are not explicitly supported by any other dedicated CKEditor 5 plugins. It acts similarly to {@link @ckeditor4 guide/dev/acf/README Advanced Content Filter} (ACF) from CKEditor 4, a feature that filters incoming HTML content by transforming and deleting disallowed elements, attributes, classes and styles. GHS allows for adding this kind of markup to the source and prevents it from being filtered from the editor window and the output.

Some examples of HTML features that can be easily enabled using General HTML Support include:

* The `<section>`, `<article>`, and `<div>` elements.
* The `<audio>`, `<video>`, and `<iframe>` elements.
* The `<span>` and `<cite>` elements.
* Some of the attributes on existing dedicated CKEditor 5 features:
	* `data-*` and `id` attributes on e.g. `<p>` and `<h1-h6>`,
	* `style` and `classes` on e.g. `<strong>` and `<a>`.

The enabled HTML features can be loaded (e.g. via `editor.setData()`), pasted, output (e.g. via `editor.getData()`), and are visible in the editing area. Such content can also be edited in the editor, although, to a limited extent. Read more about it in the [Level of support](#level-of-support) section.

<info-box>
	The General HTML Support feature is **experimental and not yet production-ready**.

	Follow the ["Stabilize and release a production-ready General HTML Support feature"](https://github.com/ckeditor/ckeditor5/issues/9856) issue for more updates and related issues.
</info-box>

## Demo

Use the {@link features/source-editing source editing feature} toolbar button {@icon @ckeditor/ckeditor5-source-editing/theme/icons/source-editing.svg Source editing} to view and edit the HTML source of the document in the demo below. The configuration of this snippet can be found below the demo editor window.

{@snippet features/general-html-support}

The General HTML Support feature is configured via the `config.htmlSupport` property. In it, you need to list the HTML features that should be handled by GHS.

## Related features

There is a closely related {@link features/source-editing source editing feature} which allows access and edition of the HTML source code of the document. When paired, these two plugins let the user gain powerful control over the content editing.

## Level of support

The difference between specific CKEditor 5 features such as {@link features/basic-styles basic styles} or {@link features/headings headings} and the HTML features enabled by GHS is that a plugin that supports a specific HTML feature provides a complete user experience for that feature, whereas GHS ensures only that such a content is accepted by the editor.

For instance, the dedicated {@link features/basic-styles#available-text-styles bold} feature offers a toolbar button used to make the selected text bold. Together with the {@link features/autoformat autoformatting feature}, it also allows for applying bold style to content by typing a Markdown shortcode (`**foo**`) in the editor. The {@link features/headings headings} feature offers a dropdown from which the user can choose a heading level and ensures that pressing <kbd>Enter</kbd> at the end of a heading creates a new paragraph (and not another heading).

The General HTML Support does not offer any UI for the enabled features and takes only the basic semantics of a given feature into account. If you enable support for `<div>`s via GHS, the user will not be able to create `<div>`s from the editor UI. The GHS will know that a `<div>` is a container element, so it can wrap other blocks (like paragraphs) but cannot be used inline (next to e.g. a `<strong>` element). It is, in this respect, similar to the content filtering (ACF) feature from CKEditor 4 as it allows creating a set or a list of markup tags that will not be stripped.

Therefore, GHS's main use cases would be:

* Ensuring backwards content compatibility with legacy systems.
* Introducing basic support for missing HTML features at a low cost.

<info-box>
	Taken the nature of GHS, you may consider installing the {@link features/source-editing source editing} feature alongside with it.
</info-box>

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-html-support`](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support) package:

```plaintext
npm install --save @ckeditor/ckeditor5-html-support
```

And add it to your plugin list configuration:

```js
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ GeneralHtmlSupport, ... ],
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Configuration

By default, enabling the {@link module:html-support/generalhtmlsupport~GeneralHtmlSupport} plugin does not enable support for any given element. The elements the user wants to be supported, need to be configured via the {@link module:core/editor/editorconfig~EditorConfig#htmlSupport `config.htmlSupport`} option:

```js
ClassicEditor.create( document.querySelector( '#editor' ), {
	htmlSupport: {
		allow: [ /* HTML features to allow */ ]
		disallow: [ /* HTML features to disallow */ ]
	}
} )
```

The notation of the `allow` and `disallow` rules looks as follows:

```js
[
	{
		// The element name to enable and/or extend with
		// the following styles, classes and other attributes.
		name: string|regexp,

		// Styles to allow (by name, name and value or just all).
		styles: object<string=>true|string|regexp>|array<string>|true,

		// Classes to allow (by name or just all).
		classes: array<string|regexp>|true,

		// Other attributes to allow (by name, name and value or just all).
		attributes: object<string=>true|string|regexp>|array<string>|true,
	}
]
```

Several implementation examples:

```js
htmlSupport: {
	allow: [
		// Enables plain <div> elements.
		{
			name: 'div'
		},

		// Enables plain <div>, <section> and <article> elements.
		{
			name: /^(div|section|article)$/
		},

		// Enables <div>s with all inline styles (but no other attributes).
		{
			name: 'div',
			styles: true
		},

		// Enables <div>s with foo and bar classes.
		{
			name: 'div',
			classes: [ 'foo', 'bar' ]
		},

		// Adds support for `foo` and `bar` classes to the already supported
		// <p> elements (those are enabled by the dedicated paragraph feature).
		{
			name: 'p',
			classes: [ 'foo', 'bar' ]
		},

		// Enables <div>s with foo="true" attribute and bar attribute that
		// can accept any value (boolean `true` value works as an asterisk).
		{
			name: 'div',
			attributes: {
				foo: 'true',
				bar: true
			}
		},

		// Adds support for style="color: *" to the already supported
		// <p> and <h2-h4> elements.
		{
			name: /^(p|h[2-4])$/',
			styles: { 'color': true }
		},
}
```

The General HTML Support feature distinguishes several content types, each treated a bit differently:

* Container elements (e.g. `<section>`, `<div>`).
* Inline elements (e.g. `<span>`, `<a>`).
* Object elements (e.g. `<iframe>`, `<video>`).

The enabled elements will not just be available "anywhere" in the content, as they still need to adhere to certain rules derived from the HTML schema and from common sense. Also, the behavior of specific types of elements in the editing area will be different. For instance, the object elements will only be selectable as a whole, and the inline elements will work the same as other formatting features supported by CKEditor 5 (e.g. bold, italic) do.

### Enabling all HTML features

It might be desired to enable all HTML features in some cases, so all elements and attributes will be allowed by the editor. It could be done with a special configuration:

```js
htmlSupport: {
	allow: [
		{
			name: /.*/,
			attributes: true,
			classes: true,
			styles: true
		}
	]
}
```

<info-box>
	Please, keep in mind that enabling all HTML features creates a security risk. It is recommended to pass a list of disallowed elements and attributes to the configuration to make sure that any malicious code will not be saved and executed in the editor.
</info-box>

The above configuration will work similarly to [`allowedContent: true`](/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-allowedContent) option from CKEditor 4.

## Known issues

It is possible to add support for arbitrary styles, classes and other attributes to existing CKEditor 5 features (such as paragraphs, headings, list items, etc.).

Most of the existing CKEditor 5 features can already be extended this way, however, some cannot yet. This includes:

* Some of the image features' markup [#9916](https://github.com/ckeditor/ckeditor5/issues/9916).
* Some of the media embed features' markup [#9918](https://github.com/ckeditor/ckeditor5/issues/9918).
* The `<ul>` and `<ol>` elements of the list feature [#9917](https://github.com/ckeditor/ckeditor5/issues/9917).

We're open for feedback, so if you find any issue, feel free to report it in the [main CKEditor 5 repository](https://github.com/ckeditor/ckeditor5/issues/).

## HTML comments

By default, all HTML comments are filtered out during the editor initialization. The {@link module:html-support/htmlcomment~HtmlComment} feature allows developers to keep them in the document content and retrieve them back, e.g. while {@link builds/guides/integration/saving-data saving the editor data}. The comments are transparent from the users point of view and they are not displayed in the editable content.

<info-box>
	The HTML comment feature is **experimental and not yet production-ready**.

	The support for HTML comments is at the basic level so far - see the [known issues](#known-issues-2) section below.
</info-box>

### Demo

The CKEditor 5 instance below is configured to keep the HTML comments in the document content. You can view the source of the document using {@link features/source-editing source editing} feature. Toggle the source editing mode {@icon @ckeditor/ckeditor5-source-editing/theme/icons/source-editing.svg Source editing} to see that the HTML comment is present in the document source. You can uncomment the paragraph below the picture and upon leaving the source editing mode, you will see this paragraph in the editable area.

{@snippet features/html-comment}

### Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-html-support`](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support) package:

```plaintext
npm install --save @ckeditor/ckeditor5-html-support
```

Then add it to the editor configuration:

```js
import HtmlComment from '@ckeditor/ckeditor5-html-support/src/htmlcomment';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ HtmlComment, ... ],
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

HTML comment feature does not require any configuration.

### Known issues

The main issue with the HTML comments feature is that comments can be easily repositioned or lost in various cases [#10118](https://github.com/ckeditor/ckeditor5/issues/10118), [#10119](https://github.com/ckeditor/ckeditor5/issues/10119). Also copying and pasting (or dragging and dropping) elements containing HTML comments within the editor does not work as expected [#10127](https://github.com/ckeditor/ckeditor5/issues/10127).

We are open for feedback, so if you find any issue, feel free to report it in the [main CKEditor 5 repository](https://github.com/ckeditor/ckeditor5/issues/).

## Related features

There are other HTML editing related CKEditor 5 features you may want to check:

* {@link features/source-editing Source editing} &ndash; Provides the ability for viewing and editing the source of the document. When paired, these two plugins let the user gain powerful control over the content editing.
* {@link features/html-embed HTML embed} &ndash; Allows embedding an arbitrary HTML snippet in the editor. It is a more constrained and controllable approach to arbitrary HTML than GHS.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-html-support.
