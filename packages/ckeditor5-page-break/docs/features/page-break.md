---
category: features
menu-title: Page break
---

# Page break

The {@link module:page-break/pagebreak~PageBreak} plugin provides a possibility to insert a page break into the rich-text editor.

## Demo

Use the editor to see the {@link module:page-break/pagebreak~PageBreak} plugin in action. Click the button below in order to open the print preview window.

{@snippet features/page-break}

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
