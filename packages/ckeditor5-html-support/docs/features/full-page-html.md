---
category: features-html
order: 50
modified_at: 2023-05-15
meta-title: Full page HTML | CKEditor 5 Documentation
---

# Full page HTML

Thanks to the full page HTML feature you can use CKEditor&nbsp;5 to edit entire HTML pages (from `<html>` to `</html>`), including the page metadata. While the {@link features/general-html-support General HTML Support} feature focuses on elements inside the content (the document's `<body>`), this feature enables markup mostly invisible to the end user.

## Demo

Use the {@link features/source-editing-enhanced Enhanced source code editing feature} toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/source.svg Enhanced source code editing} to view and edit the HTML source of the document. Pay attention to the underlying markup.

{@snippet features/full-page-html}

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, FullPage } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ FullPage, /* ... */ ],
		htmlSupport: {
			fullPage: {
				// Configuration.
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuration

### Render styles

By default, the full page HTML feature does not render the CSS from `<style>` that may be located in the `<head>` section edited content. To enable that possibility, set the {@link module:html-support/generalhtmlsupportconfig~FullPageConfig#allowRenderStylesFromHead `config.htmlSupport.fullPage.allowRenderStylesFromHead`} option to `true`.

Plugin extracts `<style>` elements from the edited content moves them to the main document `<head>`, and renders them. When CSS in `<style>` tag is changed using, for example, the {@link features/source-editing-enhanced Enhanced source code editing} feature, previously added `<style>` elements to the main document `<head>` will be replaced by the new ones.

However, by enabling the ability to render CSS from `<style>` elements located in the `<head>` section of the edited content, you expose the users of your system to the **risk of executing malicious code inside the editor**. Therefore, we highly recommend sanitizing your CSS using some library that will strip the malicious code from the styles before rendering them. You can plug in the sanitizer by defining the {@link module:html-support/generalhtmlsupportconfig~FullPageConfig#sanitizeCss `config.htmlSupport.fullPage.sanitizeCss`} option.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		htmlSupport: {
			fullPage: {
				allowRenderStylesFromHead: true,
				// Strip unsafe properties and values, for example:
				// values like url( ... ) that may execute malicious code
				// from an unknown source.
				sanitizeCss( CssString ) {
					const sanitizedCss = sanitize( CssString );

					return {
						css: sanitizedCss,
						// true or false depending on whether
						// the sanitizer stripped anything.
						hasChanged: true
					};
				}
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Security

It is a plain security risk. The user may provide a CSS mistakenly copied from a malicious website. It could also end up in the user’s clipboard (as it would usually be copied and pasted) by any other means.

You can instruct some advanced users to never paste CSS code from untrusted sources. However, in most cases, it is highly recommended to secure the system by configuring the Full page HTML feature to use a CSS sanitizer and, optionally, by setting strict Content Security Policy (CSP) rules.

#### Sanitizer

The {@link module:html-support/generalhtmlsupportconfig~FullPageConfig#sanitizeCss `config.htmlSupport.fullPage.sanitizeCss`} option allows plugging an external sanitizer.

#### CSP

In addition to using a sanitizer, you can use the built-in browser mechanism called [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP). By using CSP, you can let the browser know the allowed sources that CSS can use.

## Additional feature information

Here are some examples of the HTML elements you can enable with this plugin:

* The HTML DOCTYPE preamble: `<!DOCTYPE html>`
* The HTML root element: `<html>`
* The head element: `<head>`
* The document's title: `<title>`
* Meta tags inside the head element, like: `<meta name="description" content="Meta description">`

## Related features

CKEditor&nbsp;5 has other features related to HTML editing that you may want to check:

* {@link features/general-html-support General HTML Support} &ndash; Allows you to enable HTML features (elements, attributes, classes, styles) that are not supported by other dedicated CKEditor&nbsp;5 plugins.
* {@link features/source-editing-enhanced Enhanced source code editing} &ndash; Allows for viewing and editing the source code of the document in a handy modal window (compatible with all editor types) with syntax highlighting, autocompletion and more.
* {@link features/html-embed HTML embed} &ndash; Allows embedding an arbitrary HTML snippet in the editor.
