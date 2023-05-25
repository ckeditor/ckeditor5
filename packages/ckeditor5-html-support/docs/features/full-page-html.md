---
category: features-html
order: 50
modified_at: 2023-05-15
---

# Full page HTML

{@snippet features/general-html-support-source}

The Full Page HTML feature allows you to preserve the whole HTML page in the editor data. With this plugin, you can enable certain HTML tags in your editor. But, unlike GHS, which focuses on tags inside the content, this feature keeps the markup that's usually not visible to the user, like the wrapping `<html></html>` tag.

## Demo

Use the {@link features/source-editing source editing feature} toolbar button {@icon @ckeditor/ckeditor5-source-editing/theme/icons/source-editing.svg Source editing} to view and edit the HTML source of the document. Pay attention to the underlying markup.

{@snippet features/full-page-html}

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-html-support`](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support) package:

```bash
npm install --save @ckeditor/ckeditor5-html-support
```

And add it to your plugin list configuration:

```js
import { FullPage } from '@ckeditor/ckeditor5-html-support';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ FullPage, /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Additional feature information

Here are some examples of tags you can enable by using this plugin:

* The HTML doctype preamble: `<!DOCTYPE html>`
* The HTML root element: `<html></html>`
* The head element: `<head></head>`
* Document's title: `<title></title>`
* Meta tags inside the head element like: `<meta name="description" content="Meta description">`

## Related features

CKEditor 5 has other features related to HTML editing that you may want to check:

* {@link features/general-html-support General HTML Support} &ndash; Allows you to enable HTML features (elements, attributes, classes, styles) that are not supported by other dedicated CKEditor 5 plugins.
* {@link features/source-editing Source editing} &ndash; Provides the ability for viewing and editing the source of the document.
* {@link features/html-embed HTML embed} &ndash; Allows embedding an arbitrary HTML snippet in the editor.
