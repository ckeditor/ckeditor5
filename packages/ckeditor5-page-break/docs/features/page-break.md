---
category: features
menu-title: Page break
---

# Page break

The {@link module:page-break/pagebreak~PageBreak} plugin provides a possibility to insert a page break in the rich-text editor.

## Demo

Use the editor below to see the {@link module:page-break/pagebreak~PageBreak} plugin in action. Open the web browser console and click the button below to see the page-break snippet code in the editor output data.

{@snippet features/page-break}

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-page-break`](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break) package:

```bash
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

The {@link module:page-break/pagebreak~PageBreak} plugin registers the UI button component (`'pageBreak'`) and the `'pageBreak'` command implemented by {@link module:page-break/pagebreakcommand~PageBreakCommand}. 

The command can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Inserts the page break to the selected content.
editor.execute( 'pageBreak' );
```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-page-break.
