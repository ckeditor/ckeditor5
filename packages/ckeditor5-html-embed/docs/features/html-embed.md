---
category: features-html
order: 40
menu-title: HTML embed
---

# HTML embed

The HTML embed feature lets you embed any HTML snippet in your content. The feature is meant for more advanced users who want to directly interact with HTML fragments.

## Demo

Use the HTML embed toolbar button {@icon @ckeditor/ckeditor5-html-embed/theme/icons/html.svg HTML embed} in the editor below to see the plugin in action. Click the **"Preview editor data"** button below the editor to see a preview of the editor content, including the embedded HTML.

{@snippet features/html-embed}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Additional feature information

This feature lets you embed any HTML code and bypass CKEditor 5's filtering mechanisms. You can use it to enrich content produced by CKEditor 5 with fragments of HTML that are not supported by any other CKEditor 5 feature.

Some examples of content that can be embedded thanks to the HTML embed feature:

* Analytics code (that usually require embedding `<script>` elements).
* Social page widgets (that also require embedding `<script>` elements).
* Content embeddable by `<iframe>` elements.
* HTML media elements such as `<audio>` and `<video>`.
* HTML snippets produced by external tools (for example, reports or charts).
* Interactive content that requires a combination of rich HTML and scripts.

It is recommended to use the {@link features/media-embed media embed} feature for embeddable media that are supported by this feature. The HTML embed feature can be used to handle the remaining content.

<info-box warning>
	Read the [Security](#security) section before installing this plugin.

	Incorrect configuration may **lead to security issues**.
</info-box>

## Installation

<info-box info>
	The HTML embed feature is enabled by default in the {@link installation/getting-started/predefined-builds#superbuild superbuild} only.
</info-box>

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-html-embed`](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed) package:

```plaintext
npm install --save @ckeditor/ckeditor5-html-embed
```

And add it to your plugin list configuration:

```js
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ HtmlEmbed, /* ... */ ],
		toolbar: [ 'htmlEmbed', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Configuration

### Content previews

The feature is by default configured to not show previews of the HTML snippets. The previews can be enabled by setting the {@link module:html-embed/htmlembed~HtmlEmbedConfig#showPreviews `config.htmlEmbed.showPreviews`} option to `true`.

However, by showing previews of the embedded HTML snippets, you expose the users of your system to the **risk of executing malicious JavaScript code inside the editor**. Therefore, it is highly recommended to plug some HTML sanitizer that will strip the malicious code from the created snippets before rendering their previews. The sanitizer can be plugged by defining the {@link module:html-embed/htmlembed~HtmlEmbedConfig#sanitizeHtml `config.htmlEmbed.sanitizeHtml`} option.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ HtmlEmbed, /* ... */ ],
		toolbar: [ 'htmlEmbed', /* ... */ ],
		htmlEmbed: {
			showPreviews: true,
			sanitizeHtml: ( inputHtml ) => {
				// Strip unsafe elements and attributes, e.g.:
				// the `<script>` elements and `on*` attributes.
				const outputHtml = sanitize( inputHtml );

				return {
					html: outputHtml,
					// true or false depending on whether the sanitizer stripped anything.
					hasChanged: true
				};
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Currently, the [feature does not execute `<script>` tags](https://github.com/ckeditor/ckeditor5/issues/8326) so the content that requires executing JavaScript in order to generate a preview will not show in the editor. However, other JavaScript code, for example, used in `on*` observers and `src="javascript:..."` attributes will be executed and therefore a sanitizer still needs to be enabled.

Read more about the security aspect in the next section.

### Security

If the HTML embed feature is configured to [show content previews](#content-previews), the HTML that the user inserts into the HTML embed widget is then rendered back to the user. **If the HTML was rendered as-is, any JavaScript code included in these HTML snippets would be executed by the browser in the context of your website**.

This, in turn, is a plain security risk. The HTML provided by the user might be mistakenly copied from a malicious website or end up in the user's clipboard (as it would usually be copied and pasted) by any other means.

In some cases, advanced users can be instructed to never paste HTML code from untrusted sources. However, in most cases, it is highly recommended to properly secure the system by configuring the HTML embed feature to use an HTML sanitizer and, optionally, by setting strict CSP rules.

<info-box>
	The tricky part is that some HTML snippets require JavaScript to be executed to render any meaningful previews (for example, Facebook embeds). Some, in turn, do not make sense to be executed (analytics code).

	Therefore, when configuring the sanitizer and CSP rules, you can take these situations into consideration and for instance, allow `<script>` tags pointing only to certain domains (e.g. a trusted external page that requires JavaScript).
</info-box>

#### Sanitizer

The {@link module:html-embed/htmlembed~HtmlEmbedConfig#sanitizeHtml `config.htmlEmbed.sanitizeHtml`} option allows plugging an external sanitizer.

Some popular JavaScript libraries that can be used include [`sanitize-html`](https://www.npmjs.com/package/sanitize-html) and [`DOMPurify`](https://www.npmjs.com/package/dompurify).

The default settings of these libraries usually strip all potentially malicious content including `<iframe>`, `<video>`, etc. elements and JavaScript code coming from trusted sources so you may need to adjust their settings to match your needs.

#### CSP

In addition to using a sanitizer, you can use the built-in browser mechanism called [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP). By using CSP you can let the browser know the allowed sources and means to execute JavaScript code and include other resources such as stylesheets, images, and fonts.

## Related features

CKEditor 5 supports a wider range of embed and code features, including:

* {@link features/media-embed Media embed} &ndash; Insert embeddable media such as YouTube or Vimeo videos and tweets into your rich text content.
* {@link features/code-blocks Code blocks} &ndash; Insert longer, multiline listings of pre-formatted code with a programming language assigned.

## Common API

The {@link module:html-embed/htmlembed~HtmlEmbed} plugin registers:
* The UI button component (`'htmlEmbed'`).
* The `'htmlEmbed'` command implemented by {@link module:html-embed/htmlembedcommand~HtmlEmbedCommand}.

The command can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Inserts an empty HTML embed.
editor.execute( 'htmlEmbed' );

// Inserts an HTML embed with some initial content.
editor.execute( 'htmlEmbed', '<b>Initial content</b>.' );

// Updates the content of a selected HTML embed.
editor.execute( 'htmlEmbed', '<b>New content.</b>' );
```

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-html-embed](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-html-embed).
