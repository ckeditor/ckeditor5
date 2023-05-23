---
category: features-html
order: 50
modified_at: 2023-05-15
---

# Full page HTML

{@snippet features/general-html-support-source}

By default, the editor filters out or replaces certain HTML tags. You can change the behavior using the Full Page HTML feature. It keeps the whole HTML page in the editor data. Unlike {@link features/general-html-support GHS}, which focuses on tags inside the content, this feature keeps the markup that's usually not visible to the user, like the wrapping `html` tag.

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

## Configuration

The {@link module:html-support/fullpage~FullPage} plugin enables support for elements by default. To make it work, place it inside the `plugins` array. You don't need an extra configuration.

## Additional feature information

Here are some examples of features you can enable by using this plugin:

* The HTML doctype preamble: `<!DOCTYPE html>`
* The HTML root element: `<html></html>`
* The head element: `<head></head>`
* Document's title: `<title></title>`
* Meta tags inside the head element like: `<meta name="description" content="Meta description">`

## Related features

CKEditor 5 has other features related to HTML editing that you may want to check:

* {@link features/general-html-support General HTML Support} &ndash; It lets you add elements, attributes, classes, and styles to the content elements and ensures this markup stays in the editor window and the output. Combining these two plugins allows you to edit the source of the whole HTML page.
* {@link features/source-editing Source editing} &ndash; Provides the ability for viewing and editing the source of the document. When paired, these two plugins let the user gain powerful control over content editing.
* {@link features/html-embed HTML embed} &ndash; Allows embedding an arbitrary HTML snippet in the editor. It is a more constrained and controllable approach to arbitrary HTML than GHS.