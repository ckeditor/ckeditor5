---
category: features
menu-title: Page break
meta-title: Page break | CKEditor 5 Documentation
---

# Page break

The page break feature lets you insert page breaks into your content. This gives you more control over the final structure of a document that is printed or [exported to PDF](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html) or [Word](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-word.html).

## Demo

Use the insert page break toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/page-break.svg Insert page break} to see the feature in action. Use the "Open print preview" button below the editor to preview the content.

{@snippet features/page-break}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, PageBreak } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ PageBreak, /* ... */ ],
		toolbar: [ 'pageBreak', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Related features

Here are some useful CKEditor&nbsp;5 features that you can use together with the page break plugin for an all-around paged editing experience:

* The {@link features/pagination pagination feature} allows you to see where page breaks would be after the document is [exported to PDF](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html) or [to Word](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-word.html).
* The [export to Word](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-word.html) feature will allow you to generate editable, paged `.docx` files out of your editor-created content.
* The [export to PDF](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html) feature will allow you to generate portable, paged PDF files out of your editor-created content.

## Common API

The {@link module:page-break/pagebreak~PageBreak} plugin registers:

* the UI button component (`'pageBreak'`),
* the `'pageBreak'` command implemented by {@link module:page-break/pagebreakcommand~PageBreakCommand}.

You can execute the command using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Inserts a page break into the selected content.
editor.execute( 'pageBreak' );
```

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-page-break](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-page-break).
