---
title: Content minimap
menu-title: Content minimap
meta-title: Content minimap | CKEditor 5 Documentation
category: features
classes: main__content--no-toc
toc: false
contributeUrl: false
modified_at: 2021-07-12
---

The content minimap feature shows a miniature overview of your content. It helps you navigate a document that is too long to fit on the screen.

<info-box warning>
	This is a **feature preview**, and as such it is not recommended for production use. For more information, comments, and feature requests, please refer to the [issue on GitHub](https://github.com/ckeditor/ckeditor5/issues/10089).
</info-box>

## Demo

Scroll the content, and the minimap in the sidebar will show your current location. To quickly navigate the document, drag the box marking the visible portion of the content. You can also click anywhere on the minimap to move around instantly.

{@snippet features/minimap}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

```js
import { DecoupledEditor, Minimap } from 'ckeditor5';

DecoupledEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Minimap, /* ... */ ],
		minimap: {
			// Reference to the container element as shown in the configuration section of the guide
			// ...
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Configuration

<info-box>
	For more technical details, please check the {@link module:minimap/minimapconfig~MinimapConfig plugin configuration API}.
</info-box>

### Minimap container

The container element is essential for the minimap to render. You should pass the reference to the container element in {@link module:minimap/minimapconfig~MinimapConfig#container `config.minimap.container`}. Note that it must have a fixed `width` and `overflow: hidden` when the editor is created:

```js
import { DecoupledEditor, Minimap } from 'ckeditor5';

DecoupledEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Minimap, /* ... */ ],
		minimap: {
			container: document.querySelector( '.minimap-container' )
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Content styles and classes

The minimap feature uses `<iframe>` internally. For a proper look and operation, it is essential for the content (clone) inside the `<iframe>` to have exactly the same styles as the main editor document. If the content of your editor inherits styles from parent containers, you may need to pass the class names of these containers in the feature configuration to maintain style parity. See the {@link module:minimap/minimapconfig~MinimapConfig#extraClasses detailed classes documentation} to learn more.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

### Demo configuration

To configure the editor as [presented above](#demo), you can use the following DOM structure:

```html
<div id="document-container">
	<div id="toolbar-container">
		<!-- This is where the document editor toolbar will be inserted. -->
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

Employ the following CSS:

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

Finally, the JavaScript to run the editor (learn how to [install](#installation) the feature):

```js
import { DecoupledEditor, Minimap } from 'ckeditor5';

DecoupledEditor
	.create( document.querySelector( '#editor-content' ), {
		plugins: [ Minimap, /* ... */ ],
		minimap: {
			container: document.querySelector( '.minimap-container' ),
		}
	} )
	.then( editor => {
		const toolbarContainer = document.querySelector( '#toolbar-container' );

		toolbarContainer.appendChild( editor.ui.view.toolbar.element );
	} );
```

## Related features

Here are some other CKEditor&nbsp;5 features that you can use to navigate content better:

* {@link features/document-outline Document outline}  &ndash; Display a navigable list of sections (headings) of the document next to the editor.
* {@link features/table-of-contents Table of contents} &ndash; Insert a table of contents into the document with a single click.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-minimap](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-minimap).
