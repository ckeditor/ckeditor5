---
title: Menu bar
category: setup
meta-title: Menu bar | CKEditor 5 Documentation
modified_at: 2024-05-13
order: 50
classes: main__content--no-toc
toc: false
---

# Menu bar

The menu bar is a user interface component that gives you access to all features provided by the editor, organized in menus and categories. This familiar experience popular in large editing desktop and online packages improves usability of the editor.

As the menu bar gathers all the editor features, the toolbar can be simple and tidy, providing only the most essential and commonly used features. This is especially welcome in heavily-featured editor integrations.

For your convenience, the menu bar provides a {@link module:ui/menubar/utils#DefaultMenuBarItems default preset structure}, based on the plugins loaded in the editor. However, you can arrange it to suit your needs, remove unnecessary items, as well as add menu items related to your custom features.

## Demo

The demo below presents all items available in the menu bar preset settings.

{@snippet features/menubar}

You can easily remove some presets or add more items, including menu items for custom features. The structure can also be arranged to suit particular needs.

## Enabling the menu bar

The menu bar is available in all editor types. Usage will vary depending on used editor type.

### Classic editor and Inline editor

The menu bar is disabled by default. To make it available in your editor, set the {@link module:ui/menubar/menubarview~MenuBarConfig `config.menuBar.isVisible`} property to `true`. This will turn on the menu bar with a default set of features. The menu bar is located right above the editor toolbar.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: [ 'undo', 'redo', 'bold', 'italic', 'numberedList', 'bulletedList' ],
		menuBar: {
			isVisible: true
		}
	} );
```

### Other editor types

When using the Decoupled, Balloon or Multi-root editor, you will need to insert the menu bar in a desired place yourself. The menu bar HTML element is available under the {@link module:ui/editorui/editoruiview~EditorUIView#menuBarView `editor.ui.view.menuBarView.element`} property.

```html
	<div id="menuBarContainer"></div>
	<div id="editor"><p>Document content.</p></div>
```

```js
DecoupledEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: [ 'undo', 'redo', 'bold', 'italic', 'numberedList', 'bulletedList' ],
	} )
	.then( editor => {
		document.querySelector( '#menuBarContainer' ).appendChild( editor.ui.view.menuBarView.element );
	} );
```

## Configuration

The menu bar can be configured using the {@link module:core/editor/editorconfig~EditorConfig#menuBar `config.menuBar`} option and its `config.menuBar.removeItems` and `config.menuBar.addItems` properties. Please refer to the {@link module:core/editor/editorconfig~EditorConfig#menuBar `config.menuBar` API documentation} for details on how to do it.

<info-box warning>
	Before adding a feature to the menu bar, make sure the plugin for that feature is added in the editor configuration.
</info-box>

## Adding custom buttons to the menu bar

To add custom buttons or other components to the menu bar, follow these steps:

1. Create a new UI component using {@link module:ui/componentfactory~ComponentFactory `editor.ui.componentFactory`}. Define its behavior and appearance.
1. Use {@link module:ui/editorui/editorui~EditorUI#extendMenuBar `editor.ui.extendMenuBar()`} method to add your component to the menu bar at a desired position.

Here's an example of a custom plugin that adds a button to the menu bar inside the "Format" menu, after the "Bold" button:

```js
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

class MyCustomPlugin extends Plugin {
	init() {
		const editor = this.editor;

		// Register the toolbar button.
		editor.ui.componentFactory.add( 'menuBar:myCustomButton', locale => {
			const view = new ButtonView(locale);

			view.set( {
				label: 'My Custom Button',
				withText: true,
				tooltip: true
			} );

			// Execute a command when the button is clicked.
			view.on( 'execute', () => {
				editor.execute('myCustomCommand');
			} );

			return view;
		} );

		// Add your component in the preferred position.
		editor.ui.extendMenuBar( {
			item: 'menuBar:myCustomButton',
			position: 'after:menuBar:bold'
		} );
    }
}
```

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ui](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ui).
