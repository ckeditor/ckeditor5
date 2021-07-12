---
title: Content minimap
menu-title: Content minimap
category: features
classes: main__content--no-toc
toc: false
contributeUrl: false
---

The {@link module:minimap/minimap~Minimap} feature renders a content minimap which, when placed next to the editor, helps users navigate their content. It allows moving around documents and provides a visual overview when the document is longer than its visible portion on the screen.

You can try the minimap feature it in the demo below.

<info-box warning>
	This is a **feature preview**, and as such it is not recommended for production use. For more information, comments and feature requests, please refer to the [issue on GitHub](https://github.com/ckeditor/ckeditor5/issues/10089).
</info-box>

## Demo

Scroll the content and the minimap in the sidebar will show you your current location. Drag the box pointing to the visible portion of the content for quick navigation. You can also simply click the minimap to move around instantly.

{@snippet features/minimap}

### Demo configuration

To configure the editor as [presented above](#demo), you can use the following DOM structure:

```html
<div id="document-container">
	<div id="toolbar-container">
		<!-- This is where document editor toolbar will be inserted. -->
	</div>
	<div class="minimap-wrapper">
		<div class="editor-container">
			<div id="editor-content">
				<!-- This is where the edited content will render (the page). -->
			</div>
		</div>
		<div class="minimap-container">
			<!-- This is where the minimap will be inserted. -->
		</div>
	</div>
</div>
```

and the following CSS:

```css
.document-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
	flex-grow: 1;
	max-width: 1280px;
	margin: 0 auto;
}

.toolbar-container {
	width: 100%;
}

.minimap-wrapper {
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	max-height: calc( 100vh - 400px );
	width: 100%;
	position: relative;
	top: -1px;
}

.editor-container {
	width: 100%;
	border: 1px solid hsl( 0, 0%, 80% );
	border-right: 0;
	background: hsl( 0, 0%, 95% );
	box-sizing: border-box;
	position: relative;
	overflow: auto;
}

.minimap-container {
	width: 120px;
	flex: 0 0 auto;
	border: 1px solid var(--ck-color-toolbar-border);
	position: relative;
	overflow: hidden;
	max-height: 100%;
}

#editor-content {
	width: calc( 180mm + 2px );
	min-height: calc( 210mm + 2px );
	height: auto;
	padding: 20mm 12mm;
	box-sizing: border-box;
	background: hsl( 0, 0%, 100% );
	border: 1px solid hsl( 0, 0%, 88% );
	box-shadow: 0 2px 8px hsla( 0, 0%, 0%, .08 );
	margin: 40px auto;
	overflow: hidden;
}
```

and, finally, the JavaScript to run the editor (learn how to [install](#installation) the feature):

```js
import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import Minimap from '@ckeditor/ckeditor5-pagination/src/minimap';

DecoupledEditor
	.create( document.querySelector( '#editor-content' ), {
		plugins: [ Minimap, ... ],
		minimap: {
			container: document.querySelector( '.minimap-container' ),
		}
	} )
	.then( editor => {
		const toolbarContainer = document.querySelector( '#toolbar-container' );

		toolbarContainer.appendChild( editor.ui.view.toolbar.element );
	} )
	.catch( ... );
```

## Installation

To add the pagination feature to your editor, install the [`@ckeditor/ckeditor5-minimap`](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap) package:

```
npm install --save @ckeditor/ckeditor5-minimap
```

Then add the `Minimap` plugin to your plugin list and [configure](#configuration) it:

```js
import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import Minimap from '@ckeditor/ckeditor5-pagination/src/minimap';

DecoupledEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Minimap, ... ],
		minimap: {
			// ...
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

### Minimap container

The container element is essential for the minimap to render. You should pass the reference to the container element in {@link module:minimap/minimap~MinimapConfig#container `config.minimap.container`}. Note that it must have a fixed `width` and `overflow: hidden` when the editor is created:

```js
import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import Minimap from '@ckeditor/ckeditor5-pagination/src/minimap';

DecoupledEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Minimap, ... ],
		minimap: {
			container: document.querySelector( '.minimap-container' )
		}
	} )
	.then( ... )
	.catch( ... );
```

### Content styles and classes

The minimap feature uses `<iframe>` internally. For proper look and operation, is is essential the content (clone) inside the `<iframe>` has exactly the same styles as the main editor document. If the content of your editor inherits styles from parent containers, you may need to pass class names of these containers in the feature configuration to maintain style parity. See the {@link module:minimap/minimap~MinimapConfig#extraClasses detailed documentation} to learn more.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>
