---
category: features-html
order: 40
menu-title: HTML embed
meta-title: HTML embed | CKEditor 5 Documentation
---

# HTML embed

The HTML embed feature lets you embed any HTML snippet in your content. The feature is meant for more advanced users who want to directly interact with HTML fragments.

## Demo

Use the HTML embed toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/html.svg HTML embed} in the editor below to see the plugin in action. Click the "Preview editor data" button under the editor to preview the editor content, including the embedded HTML.

{@snippet features/html-embed}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Additional feature information

This feature lets you embed any HTML code and bypass CKEditor&nbsp;5's filtering mechanisms. You can use it to enrich content produced by CKEditor&nbsp;5 with fragments of HTML that are not supported by any other CKEditor&nbsp;5 feature.

Some examples of content that you can embed thanks to the HTML embed feature:

* Analytics code (that usually requires embedding `<script>` elements).
* Social page widgets (that also require embedding `<script>` elements).
* Content embeddable by `<iframe>` elements.
* HTML media elements such as `<audio>` and `<video>`.
* HTML snippets produced by external tools (for example, reports or charts).
* Interactive content that requires a combination of rich HTML and scripts.

We recommended using the {@link features/media-embed media embed} feature for embeddable media that this feature supports. You can use the HTML embed feature to handle the remaining content.

<info-box warning>
	Read the [Security](#security) section before installing this plugin.

	Incorrect configuration may **lead to security issues**.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, HtmlEmbed } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ HtmlEmbed, /* ... */ ],
		toolbar: [ 'htmlEmbed', /* ... */ ],
		htmlEmbed: {
			// Configuration.
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuration

### Content previews

The feature is by default configured to not show previews of the HTML snippets. You can enable the previews by setting the {@link module:html-embed/htmlembedconfig~HtmlEmbedConfig#showPreviews `config.htmlEmbed.showPreviews`} option to `true`.

However, by showing previews of the embedded HTML snippets, you expose the users of your system to the **risk of executing malicious JavaScript code inside the editor**. Therefore, it is highly recommended to plug in some HTML sanitizer that will strip the malicious code from the created snippets before rendering their previews. You can plug in the sanitizer by defining the {@link module:html-embed/htmlembedconfig~HtmlEmbedConfig#sanitizeHtml `config.htmlEmbed.sanitizeHtml`} option.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		htmlEmbed: {
			showPreviews: true,
			sanitizeHtml: ( inputHtml ) => {
				// Strip unsafe elements and attributes, for example:
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

Currently, the [feature does not execute `<script>` tags](https://github.com/ckeditor/ckeditor5/issues/8326) so the content that requires executing JavaScript to generate a preview will not show in the editor. However, other JavaScript code, for example, used in `on*` observers and `src="javascript:..."` attributes will be executed. You still need to enable the sanitizer.

Read more about the security aspect in the next section.

### Security

If you configure the HTML embed feature to [show content previews](#content-previews), the HTML that the user inserts into the HTML embed widget is then rendered back to the user. **If the HTML was rendered as-is, **the browser would execute any JavaScript code included in these HTML snippets in the context of your website**.

This, in turn, is a plain security risk. The HTML provided by the user might be mistakenly copied from a malicious website. It could also end up in the user's clipboard (as it would usually be copied and pasted) by any other means.

You can instruct some advanced users to never paste HTML code from untrusted sources. However, in most cases, it is highly recommended to secure the system by configuring the HTML embed feature to use an HTML sanitizer and, optionally, by setting strict Content Security Policy (CSP) rules.

<info-box>
	The tricky part is that some HTML snippets require executing JavaScript to render any meaningful previews (for example, Facebook embeds). Some, in turn, do not make sense to execute (like analytics code).

	Therefore, when configuring the sanitizer and CSP rules, you can take these situations into consideration and for instance, allow `<script>` tags pointing only to certain domains (like a trusted external page that requires JavaScript).
</info-box>

#### Sanitizer

The {@link module:html-embed/htmlembedconfig~HtmlEmbedConfig#sanitizeHtml `config.htmlEmbed.sanitizeHtml`} option allows plugging an external sanitizer.

Some popular JavaScript libraries that you can use include [`sanitize-html`](https://www.npmjs.com/package/sanitize-html) and [`DOMPurify`](https://www.npmjs.com/package/dompurify).

The default settings of these libraries usually strip all potentially malicious content including `<iframe>`, `<video>`, or similar elements and JavaScript code coming from trusted sources. You may need to adjust their settings to match your needs.

#### CSP

In addition to using a sanitizer, you can use the built-in browser mechanism called [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP). By using CSP you can let the browser know the allowed sources and means to execute JavaScript code and include other resources such as style sheets, images, and fonts.

## Related features

CKEditor&nbsp;5 supports a wider range of embed and code features, including:

* {@link features/media-embed Media embed} &ndash; Insert embeddable media such as YouTube or Vimeo videos and tweets into your rich text content.
* {@link features/code-blocks Code blocks} &ndash; Insert longer, multiline listings of pre-formatted code with a programming language assigned.
* {@link features/general-html-support General HTML Support} &ndash; Enable HTML features (elements, attributes, classes, styles) that are not supported by other dedicated CKEditor&nbsp;5 plugins.

## Common API

The {@link module:html-embed/htmlembed~HtmlEmbed} plugin registers:
* The UI button component (`'htmlEmbed'`).
* The `'htmlEmbed'` command implemented by {@link module:html-embed/htmlembedcommand~HtmlEmbedCommand}.

You can execute the command using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Inserts an empty HTML embed.
editor.execute( 'htmlEmbed' );

// Inserts an HTML embed with some initial content.
editor.execute( 'htmlEmbed', '<b>Initial content</b>.' );

// Updates the content of a selected HTML embed.
editor.execute( 'htmlEmbed', '<b>New content.</b>' );
```

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-html-embed](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-html-embed).
