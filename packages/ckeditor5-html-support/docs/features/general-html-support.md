---
category: features-html
order: 20
modified_at: 2021-10-25
meta-title: General HTML Support | CKEditor 5 Documentation
---

# General HTML Support

{@snippet features/general-html-support-source}

With the General HTML Support (GHS) feature, developers can enable HTML features that are not supported by any other dedicated CKEditor&nbsp;5 plugins. GHS lets you add elements, attributes, classes, and styles to the source. It also ensures this markup stays in the editor window and in the output.

## Demo

Use the {@link features/source-editing source editing feature} toolbar button {@icon @ckeditor/ckeditor5-source-editing/theme/icons/source-editing.svg Source editing} to view and edit the HTML source of the document. You can find the configuration of this snippet below the demo.

You can configure the General HTML Support feature using the `config.htmlSupport` property. With this property, you need to list the HTML features that should be handled by GHS.

{@snippet features/general-html-support}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Additional feature information

Here are some examples of HTML features that you can enable using General HTML Support:

* The `<section>`, `<article>`, and `<div>` elements.
* The `<audio>`, `<video>`, and `<iframe>` elements.
* The `<span>` and `<cite>` elements.
* Some of the attributes on existing dedicated CKEditor&nbsp;5 features:
	* The `data-*` and `id` attributes on, for example, `<p>` and `<h1-h6>`.
	* The `style` and `classes` attributes on, for example, `<strong>` and `<a>`.

You can load (for example, via `editor.setData()`), paste, output (for example, via `editor.getData()`) the enabled HTML features. They are also visible in the editing area. To a limited extent, you can also edit such content in the editor. Read more about it in the [Level of support](#level-of-support) section.

## Level of support

The difference between specific CKEditor&nbsp;5 features such as {@link features/basic-styles basic styles} or {@link features/headings headings} and the HTML features enabled by GHS is that a plugin that supports a specific HTML feature provides a complete user experience for that feature. GHS ensures only that such content is accepted by the editor.

For instance, the dedicated {@link features/basic-styles#available-text-styles bold} feature offers a toolbar button used to make the selected text bold. Together with the {@link features/autoformat autoformatting feature}, it also allows for applying bold style to content by typing a Markdown shortcode (`**foo**`) in the editor. The {@link features/headings headings} feature offers a dropdown from which the user can choose a heading level and ensures that pressing <kbd>Enter</kbd> at the end of a heading creates a new paragraph (and not another heading).

The General HTML Support does not offer any UI for the enabled features and takes only the basic semantics of a given feature into account. If you enable support for `<div>` elements via GHS, the user will not be able to create such elements from the editor UI. The GHS will know that a `<div>` is a container element, so it can wrap other blocks (like paragraphs) but cannot be used inline (next to, for example, a `<strong>` element). In this respect, it is similar to the Advanced Content Filtering (ACF) feature from CKEditor&nbsp;4 as it lets you create a list of markup tags that the editor will not strip.

Therefore, the main use cases for GHS would be:

* Ensuring backward content compatibility with legacy systems.
* Introducing basic support for missing HTML features at a low cost.

<info-box>
	Considering the nature of GHS, you may consider installing the {@link features/source-editing source editing} feature alongside it.
</info-box>

## Installation

After {@link getting-started/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

```js
import { ClassicEditor, GeneralHtmlSupport } from 'ckeditor5';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ GeneralHtmlSupport, /* ... */ ],
} )
.then( /* ... */ );
```

## Configuration

By default, enabling the {@link module:html-support/generalhtmlsupport~GeneralHtmlSupport} plugin does not enable support for any given element. You need to configure the elements the user wants to use via the {@link module:core/editor/editorconfig~EditorConfig#htmlSupport `config.htmlSupport`} option:

```js
ClassicEditor.create( document.querySelector( '#editor' ), {
	htmlSupport: {
		allow: [ /* HTML features to allow. */ ],
		disallow: [ /* HTML features to disallow. */ ]
	}
} )
```

The notation of the `allow` and `disallow` rules looks as follows:

```js
[
	{
		// The element name to enable or extend with
		// the following styles, classes, and other attributes.
		name: string|regexp,

		// Styles to allow (by name, name and value, or just all).
		styles: object<string=>true|string|regexp>|array<string>|true,

		// Classes to allow (by name or just all).
		classes: array<string|regexp>|true,

		// Other attributes to allow (by name, name and value, or just all).
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

		// Enables plain <div>, <section>, and <article> elements.
		{
			name: /^(div|section|article)$/
		},

		// Enables <div> elements with all inline styles (but no other attributes).
		{
			name: 'div',
			styles: true
		},

		// Enables <div> elements with "foo" and "bar" classes.
		{
			name: 'div',
			classes: [ 'foo', 'bar' ]
		},

		// Adds support for "foo" and "bar" classes to the already supported
		// <p> elements (those are enabled by the dedicated paragraph feature).
		{
			name: 'p',
			classes: [ 'foo', 'bar' ]
		},

		// Enables <div> elements with foo="true" attribute and "bar" attribute that
		// can accept any value (the Boolean "true" value works as an asterisk).
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

* Container elements (like `<section>`, `<div>`).
* Inline elements (like `<span>`, `<a>`).
* Object elements (like `<iframe>`, `<video>`).

The enabled elements will not just be available "anywhere" in the content. They still need to adhere to certain rules derived from the HTML schema and common sense. Also, the behavior of specific types of elements in the editing area will be different. For instance, the object elements will only be selectable as a whole. The inline elements will work the same as other formatting features supported by CKEditor&nbsp;5 (like bold and italic) do.

### Enabling all HTML features

Sometimes you might want to enable all HTML features, so the editor will allow all elements and attributes. You can achieve this with a special configuration:

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
	Enabling all HTML features creates a security risk. You should pass a list of disallowed elements and attributes to the configuration to make sure that any malicious code will not be saved and executed in the editor.
</info-box>

This configuration will work similarly to the [`allowedContent: true`](/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-allowedContent) option from CKEditor 4.

### Security

When you set up the GHS to allow elements like `<script>` or attributes like `onclick`, you expose the users of your application to a possibly malicious markup. This can be code mistakenly copied from a risky website or purposely provided by a bad actor. An example of that could be: `<div onclick="leakUserData()">`.

The content inside the editor (what you see in the editing area) is filtered by default from typical content that could break the editor. However, the editor does not feature a full XSS filter. We recommend configuring GHS to enable specific HTML markup, instead of enabling all markup at once.

Moreover, as a general rule, not exclusive to GHS, there should always be a sanitization process present on the backend side of your application. Even the best filtering done on the browser side of your application can be mitigated and every network call can be manipulated, thus bypassing the frontend filtering. This can quickly become a security risk.

In addition to the sanitization process and safe GHS configuration, it is highly recommended to set strict {@link getting-started/setup/csp Content Security Policy} rules.

### Enabling custom elements

You can define custom HTML elements with attributes and classes.

To use a new element, you need to register it with {@link module:html-support/dataschema~DataSchema} as one of the types below:

* Inline element.
* Block element.

To enable such elements and add attributes or classes to them, you need to use the {@link module:html-support/datafilter~DataFilter#allowElement `allowElement`} and {@link module:html-support/datafilter~DataFilter#allowAttributes `allowAttributes`} methods from the {@link module:html-support/datafilter~DataFilter `DataFilter`} API.

Base implementation example:

```js
import { ClassicEditor, Essentials, Paragraph, Plugin, SourceEditing, GeneralHtmlSupport } from 'ckeditor5';

/**
* A plugin extending General HTML Support, for example, with custom HTML elements.
*/
class ExtendHTMLSupport extends Plugin {
	static get requires() {
		return [ GeneralHtmlSupport ];
	}

	init() {
		// Extend the schema with custom HTML elements.
		const dataFilter = this.editor.plugins.get( 'DataFilter' );
		const dataSchema = this.editor.plugins.get( 'DataSchema' );

		// Inline element.
		dataSchema.registerInlineElement( {
			view: 'element-inline',
			model: 'myElementInline'
		} );

		// Custom elements need to be registered using direct API instead of configuration.
		dataFilter.allowElement( 'element-inline' );
		dataFilter.allowAttributes( { name: 'element-inline', attributes: { 'data-foo': false }, classes: [ 'foo' ] } );

		// Block element.
		dataSchema.registerBlockElement( {
			view: 'element-block',
			model: 'myElementBlock',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		} );

		dataFilter.allowElement( 'element-block' );
	}
}

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [
		Essentials,
		Paragraph,
		ExtendHTMLSupport
	],
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
} )
```

You can treat both inline and block elements as object elements. To make it possible, it is necessary to set the {@link module:html-support/dataschema~DataSchemaDefinition#isObject isObject} property to `true`.

```js
// Inline object element.
dataSchema.registerInlineElement( {
	view: 'object-inline',
	model: 'myObjectInline',
	isObject: true,
	modelSchema: {
		inheritAllFrom: '$inlineObject'
	}
} );

dataFilter.allowElement( 'object-inline' );

// Block object element.
dataSchema.registerBlockElement( {
	view: 'object-block',
	model: 'myObjectBlock',
	isObject: true,
	modelSchema: {
		inheritAllFrom: '$blockObject'
	}
} );

dataFilter.allowElement( 'object-block' );
```

## Known issues

You can add support for arbitrary styles, classes, and other attributes to existing CKEditor&nbsp;5 features (such as paragraphs, headings, list items, etc.). Most of the existing CKEditor&nbsp;5 features can already be extended this way, however, some cannot yet. This includes the `<ul>` and `<ol>` elements of the list feature (see: [#9917](https://github.com/ckeditor/ckeditor5/issues/9917)).

<info-box info>
	While the GHS feature is stable, some problems with complex documents may occur if you use it together with {@link features/real-time-collaboration real-time collaboration}.
</info-box>

We are open to feedback, so if you find any issue, feel free to report it in the [main CKEditor&nbsp;5 repository](https://github.com/ckeditor/ckeditor5/issues/).

## Related features

CKEditor&nbsp;5 has other features related to HTML editing that you may want to check:

* {@link features/full-page-html Full page HTML} &ndash; Allows using CKEditor&nbsp;5 to edit entire HTML pages, from `<html>` to `</html>`, including the page metadata.
* {@link features/source-editing Source editing} &ndash; Provides the ability to view and edit the source of the document.
* {@link features/html-embed HTML embed} &ndash; Allows embedding an arbitrary HTML snippet in the editor.
