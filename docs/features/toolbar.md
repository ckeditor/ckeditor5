---
title: Editor toolbar
category: features-toolbar
order: 10
---
{@snippet features/build-toolbar-source}

# Editor toolbar

The toolbar is the most basic user interface element of the WYSIWYG editor that gives convenient access to all its features. It contains various items like buttons or dropdowns that you can use to format, manage, insert and alter elements of the content.

<info-box hint>
    Toolbar configuration is a strict UI-related setting. Removing a toolbar item does not remove the feature from the editor internals. If your goal with the toolbar configuration is to remove features, the right solution is to also remove their respective plugins. Check {@link builds/guides/integration/configuration#removing-features removing features} for more information.
</info-box>

## Basic toolbar configuration

In the builds that contain toolbars an optimal default configuration is defined for it. You may need a different toolbar arrangement, though, and this can be achieved through configuration.

Each editor may have a different toolbar configuration scheme, so it is recommended to check its documentation. In any case, the following example may give you a general idea:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: [ 'bold', 'italic', 'link', 'undo', 'redo', 'numberedList', 'bulletedList' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```

## Demo

This is how a simplified toolbar from the snippet above looks in the CKEditor 5 WYSIWYG editor user interface. Toolbar items can be easily added or removed thanks to this configuration.

{@snippet features/toolbar-basic}

## Separating toolbar items

You can use `'|'` to create a separator between groups of toolbar items. It works in both the basic and [extended](#extended-toolbar-configuration-format) configuration formats:

Basic:

```js
toolbar: [ 'bold', 'italic', '|', 'undo', 'redo', '|', 'numberedList', 'bulletedList' ]
```

Extended:

```js
toolbar: {
    items: [ 'bold', 'italic', '|', 'undo', 'redo', '|', 'numberedList', 'bulletedList' ]
}
```

Below you can find an example of a simple toolbar with button grouping. The group separators (`'|'`) set in the configuration help organize the toolbar.

{@snippet features/toolbar-separator}

## Extended toolbar configuration format

You can use the extended {@link module:core/editor/editorconfig~EditorConfig#toolbar toolbar configuration} format to access additional options:

```js
toolbar: {
    items: [ 'bold', 'italic', '|', 'undo', 'redo', '-', 'numberedList', 'bulletedList' ],
    shouldNotGroupWhenFull: true
}
```

 * **`items`** &ndash; An array of toolbar item names. Most of the components (buttons, dropdowns, etc.) which can be used as toolbar items are described under the {@link features/index Features} tab. A full list is defined in {@link module:ui/componentfactory~ComponentFactory editor.ui.componentFactory} and can be listed using the following snippet: `Array.from( editor.ui.componentFactory.names() )`. Besides button names, you can also use the dedicated separators for toolbar groups (`'|'`) and toolbar lines (`'-'`).

 * **`removeItems`** &ndash; An array of toolbar item names. With this setting you can modify the default toolbar configuration without the need of defining the entire list (you can specify a couple of buttons that you want to remove instead of specifying all the buttons you want to keep). If, after removing an item, toolbar will have two or more consecutive separators (`'|'`), the duplicates will be removed automatically.

 * **`shouldNotGroupWhenFull`** &ndash; When set to `true`, the toolbar will stop grouping items and let them wrap to the next line when there is not enough space to display them in a single row. This setting is `false` by default, which enables items grouping.

The demo below presents the "regular" toolbar look with `shouldNotGroupWhenFull` set to `false`. If there are excess toolbar items for the display width, the toolbar gets grouped and some of the items are accessible via the clickable "Show more items" (⋮) button.

{@snippet features/toolbar-grouping}

## Multiline (wrapping) toolbar

In the [extended toolbar configuration format](#extended-toolbar-configuration-format) it is also possible to arrange toolbar items into multiple lines. Here is how to achieve this:

* Set the `shouldNotGroupWhenFull` option to `true`, so items will not be grouped when the toolbar overflows but will wrap to the new line instead.
* Additionally, the `'-'` separator can be used inside the items list to set the breaking point explicitly.

```js
toolbar: {
    [ 'bold', 'italic', '|', 'undo', 'redo', '-', 'numberedList', 'bulletedList' ],
    shouldNotGroupWhenFull: true
}
```

### Automatic toolbar wrapping

When `shouldNotGroupWhenFull` is set to `true`, by default the toolbar items are automatically wrapped into a new line once they do not fit the editor width. The mechanism is automatic and only wraps excess items. Notice that while the toolbar group separators `'|'` are preserved, the groups may be split when they overflow.

```js
toolbar: {
    items: [
        'heading', '|',
		'fontfamily', 'fontsize', '|',
		'alignment', '|',
		'fontColor', 'fontBackgroundColor', '|',
		'bold', 'italic', 'strikethrough', 'underline', 'subscript', 'superscript', '|',
		'link', '|',
		'outdent', 'indent', '|',
		'bulletedList', 'numberedList', 'todoList', '|',
		'code', 'codeBlock', '|',
		'insertTable', '|',
		'uploadImage', 'blockQuote', '|',
		'undo', 'redo'
    ],
    shouldNotGroupWhenFull: true
}
```

See how it works in practice. You may play with the browser window width to see how the buttons behave when the toolbar gets wrapped into multiple lines.

{@snippet features/toolbar-wrapping}

### Explicit wrapping breakpoint

Setting an explicit break point in the toolbar configuration with `'-'` lets you create your own predefined multiline toolbar configuration. Toolbar items will then be grouped and put in lines as declared in the configuration.

```js
toolbar: {
    items: [
        'heading', '|',
		'alignment', '|',
		'bold', 'italic', 'strikethrough', 'underline', 'subscript', 'superscript', '|',
		'link', '|',
		'bulletedList', 'numberedList', 'todoList',
		'-', // break point
		'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor', '|',
		'code', 'codeBlock', '|',
		'insertTable', '|',
		'outdent', 'indent', '|',
		'uploadImage', 'blockQuote', '|',
		'undo', 'redo'
    ],
    shouldNotGroupWhenFull: true
}
```

{@snippet features/toolbar-breakpoint}

## Listing available items

You can use the following snippet to retrieve all toolbar items available in your editor:

```js
Array.from( editor.ui.componentFactory.names() );
```

## Adding a custom button

Refer to the {@link framework/guides/creating-simple-plugin Creating a simple plugin} guide to learn how to build your own plugin, register its button and add it to the toolbar configuration.

## Block toolbar

The {@link features/blocktoolbar BlockToolbar} feature provides an additional configurable toolbar on the left-hand side of the content area, useful when the main toolbar is not accessible (e.g. in certain {@link builds/guides/overview#balloon-block-editor balloon block editor} scenarios).
