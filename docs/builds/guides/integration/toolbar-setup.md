---
# Scope:
# * Introduction to setting configurations.
# * Introduction to the top and must-know configurations.
# * Point where to find the list of configuration options.

category: builds-integration
order: 35
---

# Toolbar setup

In the builds that contain toolbars an optimal default configuration is defined for it. You may need a different toolbar arrangement, though, and this can be achieved through configuration.

Each editor may have a different toolbar configuration scheme, so it is recommended to check its documentation. In any case, the following example may give you a general idea:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: [ 'bold', 'italic', 'link' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```

### Extended format

You can use the extended toolbar configuration format to access additional options:

```js
    toolbar: {
        items: [ 'bold', 'italic', '|', 'undo', 'redo', '-', 'numberedList', 'bulletedList' ],
        viewportTopOffset: 30,
        shouldNotGroupWhenFull: true
    }
```

 * **`items`** &ndash; An array of toolbar item names. Most of the components (buttons, dropdowns, etc.) which can be used as toolbar items are described under the {@link features/index Features} tab. A full list is defined in {@link module:ui/componentfactory~ComponentFactory editor.ui.componentFactory} and can be listed using the following snippet: `Array.from( editor.ui.componentFactory.names() )`. More details could be found in the {@link framework/guides/creating-simple-plugin Creating a simple plugin} guide.

 * **`viewportTopOffset`** &ndash; The offset (in pixels) from the top of the viewport used when positioning a sticky toolbar. Useful when a page with which the editor is being integrated has some other sticky or fixed elements (e.g. the top menu). Thanks to setting the toolbar offset, the toolbar will not be positioned underneath or above the page's UI.

 * **`shouldNotGroupWhenFull`** &ndash; When set to `true`, the toolbar will stop grouping items and let them wrap to the next line when there is not enough space to display them in a single row. This setting is `false` by default, which enables items grouping.

#### Separating toolbar items

You can use `'|'` to create a separator between groups of toolbar items. Works in both config formats:

```js
    toolbar: [ 'bold', 'italic', '|', 'undo', 'redo' ]
```

```js
    toolbar: {
        items: [ 'bold', 'italic', '|', 'undo', 'redo' ]
    }
```

It is also possible to arrange toolbar items into multiple lines. In the extended format set `shouldNotGroupWhenFull` option to `true`, so items will not be grouped when the toolbar overflows but will wrap to the new line instead. Additionally, a `'-'` could be used inside items list to set the breaking point explicitly.

```js
    toolbar: {
        items: [ 'bold', 'italic', '-', 'undo', 'redo' ]
    }
```

<info-box hint>
	The above is a strict UI-related configuration. Removing a toolbar item does not remove the feature from the editor internals. If your goal with the toolbar configuration is to remove features, the right solution is to also remove their respective plugins. Check {@link builds/guides/integration/configuration#removing-features removing features} for more information.
</info-box>

### Listing available items

You can use the following snippet to retrieve all toolbar items available in your editor:

```js
Array.from( editor.ui.componentFactory.names() );
```

