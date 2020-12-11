---
# Scope:
# * Introduction to setting configurations.
# * Introduction to the top and must-know configurations.
# * Point where to find the list of configuration options.

category: builds-integration
order: 35
---
{@snippet builds/guides/integration/build-toolbar-source}

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

## Extended format

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

### Separating toolbar items

You can use `'|'` to create a separator between groups of toolbar items. Works in both config formats:

```js
    toolbar: [ 'bold', 'italic', '|', 'undo', 'redo' ]
```

```js
    toolbar: {
        items: [ 'bold', 'italic', '|', 'undo', 'redo' ]
    }
```

#### Extended format demo

The "regular" toolbar look with `shouldNotGroupWhenFull` set to `false`. If there are excess toolbar items for the display width, the toolbar gets grouped and some of the items are accessible via clickable "Show more buttons" button. The separators `'|'` set in the config help organize the toolbar.

{@snippet builds/guides/integration/toolbar-grouping}

### Multiline toolbar

It is also possible to arrange toolbar items into multiple lines. In the extended format set `shouldNotGroupWhenFull` option to `true`, so items will not be grouped when the toolbar overflows but will wrap to the new line instead. Additionally, a `'-'` could be used inside items list to set the breaking point explicitly.

```js
    toolbar: {
        items: [ 'bold', 'italic', '-', 'undo', 'redo' ]
    }
```

#### Automatic multiline wrapping demo

The default multiline toolbar behaviour when `shouldNotGroupWhenFull` is set to `true` - the toolbar items are automatically wrapped into a new line once they do not fit the editor width. The mechanism is arbitrary and only wraps excess items. Notice the toolbar item separators `'|'` and item groups have be also placed differently.

{@snippet builds/guides/integration/toolbar-wrapping}

#### Set wrapping breakpoint demo

Setting a break point in the toolbar config with `'-'` as described above lets the users create their own multiline configuration. Toolbar items are grouped and distributed according to the user-defined configuration in file. The placement of toolbar item groups, separators `'|'` and breakpoints `'-'` is fully customizable as described in this guide.

{@snippet builds/guides/integration/toolbar-breakpoint}

<info-box hint>
	The above extended format is a strict UI-related configuration. Removing a toolbar item does not remove the feature from the editor internals. If your goal with the toolbar configuration is to remove features, the right solution is to also remove their respective plugins. Check {@link builds/guides/integration/configuration#removing-features removing features} for more information.
</info-box>

## Listing available items

You can use the following snippet to retrieve all toolbar items available in your editor:

```js
Array.from( editor.ui.componentFactory.names() );
```
