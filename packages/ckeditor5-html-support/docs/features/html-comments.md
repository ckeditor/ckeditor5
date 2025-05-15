---
category: features-html
order: 30
modified_at: 2021-10-25
meta-title: HTML comments element | CKEditor 5 Documentation
---

# HTML comment element

By default, the editor filters out all HTML comments on initialization. The {@link module:html-support/htmlcomment~HtmlComment} feature lets developers keep HTML comments in the document without displaying them to the user.

<info-box warning>
	The HTML comments feature is **experimental and not yet production-ready**.

	The support for HTML comments is at the basic level so far - see the [known issues](#known-issues) section below.
</info-box>

## Demo

The editor below is configured to keep HTML comments in the document content. You can view the source of the document using the {@link features/source-editing-enhanced Enhanced source code editing} feature. Toggle the Enhanced source code editing mode {@icon @ckeditor/ckeditor5-icons/theme/icons/source.svg Source editing} to see there is an HTML comment in the document source. Try uncommenting the paragraph below the picture. Once you leave the source editing mode, you will see this paragraph in the editable area.

{@snippet features/html-comment}

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { HtmlComment } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ HtmlComment, ... ],
	} )
	.then( ... )
	.catch( ... );
```
</code-switcher>

HTML comment feature does not require any configuration.

## Known issues

The main issue with the HTML comments feature is that comments can be easily repositioned or lost in various cases [#10118](https://github.com/ckeditor/ckeditor5/issues/10118), [#10119](https://github.com/ckeditor/ckeditor5/issues/10119). Also copying and pasting (or dragging and dropping) elements containing HTML comments within the editor does not work as expected [#10127](https://github.com/ckeditor/ckeditor5/issues/10127).

We are open for feedback, so if you find any issue, feel free to report it in the [main CKEditor&nbsp;5 repository](https://github.com/ckeditor/ckeditor5/issues/).

## Related features

CKEditor&nbsp;5 has other features related to HTML editing you may want to check:

* {@link features/source-editing-enhanced Enhanced source code editing} &ndash; Allows for viewing and editing the source code of the document in a handy modal window (compatible with all editor types) with syntax highlighting, autocompletion and more.
* {@link features/html-embed HTML embed} &ndash; Allows embedding an arbitrary HTML snippet in the editor. It is a more constrained and controllable approach to arbitrary HTML than GHS.

## Contribute

The source code of the feature is available on GitHub at https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-html-support.
