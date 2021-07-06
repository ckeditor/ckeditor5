---
title: Content minimap
menu-title: Minimap
category: features
classes: main__content--no-toc
toc: false
contributeUrl: false
---

The {@link module:minimap/minimap~Minimap} feature renders a content minimap which, when placed next to the editor, helps users navigate their content. It allows moving around documents and provides a visual overview when the document is longer than its visible portion on the screen.

You can try the minimap feature it in the demo below.

## Demo

Scroll the content and the minimap in the sidebar will show you your current location. Drag the box pointing to the visible portion of the content for quick navigation. You can also simply click the minimap to move around instantly.

{@snippet features/minimap}

## Installation

To add the pagination feature to your editor, install the [`@ckeditor/ckeditor5-minimap`](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap) package:

```
npm install --save @ckeditor/ckeditor5-minimap
```

Then add the `Minimap` plugin to your plugin list and [configure](#configuration) it:

```js
import Minimap from '@ckeditor/ckeditor5-pagination/src/minimap';

DecoupledEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Minimap, ... ],
		minimap: {
			// TODO
			container: document.querySelector( '.minimap-container' )
		}
	} )
	.then( ... )
	.catch( ... );
```

<info-box>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Configuration

<info-box>
	For more technical details, please check the {@link module:minimap/minimap~MinimapConfig plugin configuration API}.
</info-box>

### Example configuration

```js
{
	minimap: {
		// TODO
	}
}
```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>
