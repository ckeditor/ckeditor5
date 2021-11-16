---
category: features
menu-title: Page break
---

# Page break

The {@link module:page-break/pagebreak~PageBreak} plugin provides a possibility to insert a page break into the rich-text editor. This is useful in paged editing scenarios where you want to have more control over the final structure of the document that is printed, [exported to PDF](https://ckeditor.com/docs/ckeditor5/latest/features/export-pdf.html) or [to Word](https://ckeditor.com/docs/ckeditor5/latest/features/export-word.html).

The page break feature is further complemented by the {@link features/pagination pagination feature} that allows you to see where page breaks would be after the document is exported to PDF or to Word.

## Demo

Use the Insert page break toolbar button {@icon @ckeditor/ckeditor5-page-break/theme/icons/pagebreak.svg Insert page break} to see the feature in action. Use the **Open print preview** the button below the editor in order to preview the content.

{@snippet features/page-break}

## Related features

Here are some useful CKEditor 5 features that you can use together with the page break plugin for an all-around paged editing experience:

* The {@link features/pagination pagination feature} allows you to see where page breaks would be after the document is [exported to PDF](https://ckeditor.com/docs/ckeditor5/latest/features/export-pdf.html) or [to Word](https://ckeditor.com/docs/ckeditor5/latest/features/export-word.html).
* The [export to Word](https://ckeditor.com/docs/ckeditor5/latest/features/export-word.html) feature will allow you to generate editable, paged `.docx` files out of your editor-created content.
* The [export to PDF](https://ckeditor.com/docs/ckeditor5/latest/features/export-pdf.html) feature will allow you to generate portable, paged PDF files out of your editor-created content.

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-page-break`](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break) package:

```plaintext
npm install --save @ckeditor/ckeditor5-page-break
```

And add it to your plugin list configuration:

```js
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ PageBreak, ... ],
		toolbar: [ 'pageBreak', ... ],
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:page-break/pagebreak~PageBreak} plugin registers:

* the UI button component (`'pageBreak'`),
* the `'pageBreak'` command implemented by {@link module:page-break/pagebreakcommand~PageBreakCommand}.

The command can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Inserts a page break into the selected content.
editor.execute( 'pageBreak' );
```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-page-break.
