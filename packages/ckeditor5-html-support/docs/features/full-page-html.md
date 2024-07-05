---
category: features-html
order: 50
modified_at: 2023-05-15
meta-title: Full page HTML | CKEditor 5 Documentation
---

# Full page HTML

{@snippet features/general-html-support-source}

Thanks to the full page HTML feature you can use CKEditor&nbsp;5 to edit entire HTML pages (from `<html>` to `</html>`), including the page metadata. While the {@link features/general-html-support General HTML Support} feature focuses on elements inside the content (the document's `<body>`), this feature enables markup mostly invisible to the end user.

## Demo

Use the {@link features/source-editing source editing feature} toolbar button {@icon @ckeditor/ckeditor5-source-editing/theme/icons/source-editing.svg Source editing} to view and edit the HTML source of the document. Pay attention to the underlying markup.

{@snippet features/full-page-html}

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

```js
import { ClassicEditor, FullPage } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ FullPage, /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

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
* {@link features/source-editing Source editing} &ndash; Provides the ability for viewing and editing the source of the document.
* {@link features/html-embed HTML embed} &ndash; Allows embedding an arbitrary HTML snippet in the editor.
