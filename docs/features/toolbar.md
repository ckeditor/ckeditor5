---
title: Editor toolbar
category: features-toolbar
order: 10
---
{@snippet features/build-toolbar-source}

# Editor toolbar

The toolbar is the most basic user interface element of CKEditor 5 that gives you convenient access to all its features. It has buttons and dropdowns that you can use to format, manage, insert, and change elements of your content.

## Demo

Below is a sample toolbar with a basic set of features. Toolbar items can be easily added or removed which will be presented further.

{@snippet features/toolbar-basic}

<info-box info>
	All demos in this guide only present a limited set of features for clarity. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Basic toolbar configuration

<info-box hint>
	Toolbar configuration is a strict UI-related setting. Removing a toolbar item does not remove the feature from the editor internals. If your goal with the toolbar configuration is to remove features, the right solution is to also remove their respective plugins. Check {@link installation/getting-started/configuration#removing-features removing features} for more information.
</info-box>

In the builds that contain toolbars, an optimal default tollbar set is defined for it. You may need a different toolbar arrangement, though, and this can be achieved through configuration.

Each editor may have a different toolbar configuration scheme, so it is recommended to check its documentation. In any case, the following example may give you a general idea:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: [ 'undo', 'redo', 'bold', 'italic', 'numberedList', 'bulletedList' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```

## Separating toolbar items

You can use `'|'` to create a separator between groups of toolbar items. It works in both the basic and extended configuration formats:

Below you can find an example of a simple toolbar with button grouping. The group separators (`'|'`) set in the configuration help organize the toolbar.

{@snippet features/toolbar-separator}

## Extended toolbar configuration format

There are two available toolbar configuration formats:

Basic, as presented above:

```js
toolbar: [ 'bold', 'italic', '|', 'undo', 'redo', '|', 'numberedList', 'bulletedList' ]
```

And extended:

```js
toolbar: {
	items: [ 'bold', 'italic', '|', 'undo', 'redo', '|', 'numberedList', 'bulletedList' ]
}
```

You can use the extended {@link module:core/editor/editorconfig~EditorConfig#toolbar toolbar configuration} format to access additional options:

```js
toolbar: {
	items: [
		'undo', 'redo',
		'|', 'heading',
		'|', 'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor',
		'|', 'bold', 'italic', 'strikethrough', 'subscript', 'superscript', 'code',
		'|', 'link', 'uploadImage', 'blockQuote', 'codeBlock',
		'|', 'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'
	],
	shouldNotGroupWhenFull: false
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
	items: [ 'bold', 'italic', '|', 'undo', 'redo', '-', 'numberedList', 'bulletedList' ],
	shouldNotGroupWhenFull: true
}
```

### Automatic toolbar wrapping

When `shouldNotGroupWhenFull` is set to `true`, by default the toolbar items are automatically wrapped into a new line once they do not fit the editor width. The mechanism is automatic and only wraps excess items. Notice that while the toolbar group separators `'|'` are preserved, the groups may be split when they overflow.

```js
toolbar: {
	items: [
		'undo', 'redo',
		'|', 'heading',
		'|', 'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor',
		'|', 'bold', 'italic', 'strikethrough', 'subscript', 'superscript', 'code',
		'|', 'link', 'uploadImage', 'blockQuote', 'codeBlock',
		'|', 'alignment',
		'|', 'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'
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
		'undo', 'redo',
		'|', 'heading',
		'|', 'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor',
		'|', 'bold', 'italic', 'strikethrough', 'subscript', 'superscript', 'code',
		'-', // break point
		'|', 'alignment',
		'link', 'uploadImage', 'blockQuote', 'codeBlock',
		'|', 'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'
	],
	shouldNotGroupWhenFull: true
}
```

{@snippet features/toolbar-breakpoint}

## Grouping toolbar items in drop-downs (nested toolbars)

To save space in your toolbar or arrange the features thematically, you can group several items into a dropdown. For instance, check out the following configuration:

```js
toolbar: [
			{
				label: 'More basic styles',
				icon: 'threeVerticalDots',
				items: [ 'strikethrough', 'superscript', 'subscript' ]
			},
// More of toolbar's config.
// ...
]
```

It will create a "Basic styles" dropdown with a "three vertical dots" icon containing the additional basic text styles buttons set. You can test it in the demo below along with a few more toolbar dropdowns.

{@snippet features/toolbar-nested-simple}

### Customization

You can customize the look of the dropdown by configuring additional properties, such as the icon, label or tooltip text.

#### Displaying the label

You can control the way the UI element is displayed. For instance, to hide the icon and to display the label only, you can use the following configuration:

```js
{
	label: 'Basic styles',
	// Show the textual label of the dropdown.
	// Note that the "icon" property is not configured and defaults to three dots.
	withText: true,
	items: [ 'bold', 'italic', 'strikethrough', 'superscript', 'subscript' ]
}
```

**Note**: The label will also automatically show up if the `icon` is `false` ([learn more](#changing-the-icon)).

{@snippet features/toolbar-nested-label}

#### Changing the icon

You can use one of the icons listed below for your dropdown:

| Icon name         | Preview                                                                     |
|-------------------|-----------------------------------------------------------------------------|
| `'threeVerticalDots'` **(default)** | {@icon @ckeditor/ckeditor5-core/theme/icons/three-vertical-dots.svg Three vertical dots} |
| `'alignLeft'`     | {@icon @ckeditor/ckeditor5-core/theme/icons/align-left.svg Align left}      |
| `'bold'`          | {@icon @ckeditor/ckeditor5-core/theme/icons/bold.svg Bold}                  |
| `'importExport'`  | {@icon @ckeditor/ckeditor5-core/theme/icons/importexport.svg Import export} |
| `'paragraph'`     | {@icon @ckeditor/ckeditor5-core/theme/icons/paragraph.svg Paragraph}        |
| `'text'`          | {@icon @ckeditor/ckeditor5-core/theme/icons/text.svg Text}                  |
| `'plus'`          | {@icon @ckeditor/ckeditor5-core/theme/icons/plus.svg Plus}                  |

* The default icons are loaded from the `ckeditor5-core` package.
* If no icon is specified, `'threeVerticalDots'` will be used as a default.
* If `icon: false` is configured, no icon will be displayed and the text label will show up instead.
* You can set a custom icon for the drop-down by passing an SVG string.

Here is an example:

```js
toolbar: [
	'undo', 'redo', '|',
	{
		// This drop-down uses a default icon because none was specified.
		label: 'Fonts',
		items: [ 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor' ]
	},
	'|',
	{
		label: 'A drop-down with a custom icon',
		// If you want your icon to change the color dynamically (e.g. when opened)
		// avoid fill="..." and stroke="..." styling attributes.
		// Use solid shapes and avoid paths with strokes.
		// eslint-disable-next-line max-len
		icon: '<svg viewBox="0 0 68 64" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path d="M43.71 11.025a11.508 11.508 0 0 0-1.213 5.159c0 6.42 5.244 11.625 11.713 11.625.083 0 .167 0 .25-.002v16.282a5.464 5.464 0 0 1-2.756 4.739L30.986 60.7a5.548 5.548 0 0 1-5.512 0L4.756 48.828A5.464 5.464 0 0 1 2 44.089V20.344c0-1.955 1.05-3.76 2.756-4.738L25.474 3.733a5.548 5.548 0 0 1 5.512 0l12.724 7.292z" fill="#FFF"/><path d="M45.684 8.79a12.604 12.604 0 0 0-1.329 5.65c0 7.032 5.744 12.733 12.829 12.733.091 0 .183-.001.274-.003v17.834a5.987 5.987 0 0 1-3.019 5.19L31.747 63.196a6.076 6.076 0 0 1-6.037 0L3.02 50.193A5.984 5.984 0 0 1 0 45.003V18.997c0-2.14 1.15-4.119 3.019-5.19L25.71.804a6.076 6.076 0 0 1 6.037 0L45.684 8.79zm-29.44 11.89c-.834 0-1.51.671-1.51 1.498v.715c0 .828.676 1.498 1.51 1.498h25.489c.833 0 1.51-.67 1.51-1.498v-.715c0-.827-.677-1.498-1.51-1.498h-25.49.001zm0 9.227c-.834 0-1.51.671-1.51 1.498v.715c0 .828.676 1.498 1.51 1.498h18.479c.833 0 1.509-.67 1.509-1.498v-.715c0-.827-.676-1.498-1.51-1.498H16.244zm0 9.227c-.834 0-1.51.671-1.51 1.498v.715c0 .828.676 1.498 1.51 1.498h25.489c.833 0 1.51-.67 1.51-1.498v-.715c0-.827-.677-1.498-1.51-1.498h-25.49.001zm41.191-14.459c-5.835 0-10.565-4.695-10.565-10.486 0-5.792 4.73-10.487 10.565-10.487C63.27 3.703 68 8.398 68 14.19c0 5.791-4.73 10.486-10.565 10.486v-.001z" fill="#1EBC61" fill-rule="nonzero"/><path d="M60.857 15.995c0-.467-.084-.875-.251-1.225a2.547 2.547 0 0 0-.686-.88 2.888 2.888 0 0 0-1.026-.531 4.418 4.418 0 0 0-1.259-.175c-.134 0-.283.006-.447.018-.15.01-.3.034-.446.07l.075-1.4h3.587v-1.8h-5.462l-.214 5.06c.319-.116.682-.21 1.089-.28.406-.071.77-.107 1.088-.107.218 0 .437.021.655.063.218.041.413.114.585.218s.313.244.422.419c.109.175.163.391.163.65 0 .424-.132.745-.396.961a1.434 1.434 0 0 1-.938.325c-.352 0-.656-.1-.912-.3-.256-.2-.43-.453-.523-.762l-1.925.588c.1.35.258.664.472.943.214.279.47.514.767.706.298.191.63.339.995.443.365.104.749.156 1.151.156.437 0 .86-.064 1.272-.193.41-.13.778-.323 1.1-.581a2.8 2.8 0 0 0 .775-.981c.193-.396.29-.864.29-1.405h-.001z" fill="#FFF" fill-rule="nonzero"/></g></svg>',
		items: [ 'bold', 'italic', 'strikethrough', 'superscript', 'subscript' ]
	},
	'|',
	{
		// A "plus" sign icon works best for content insertion tools.
		label: 'Insert',
		icon: 'plus',
		items: [ 'uploadImage', 'insertTable' ]
	},
	'|',
	{
		// This drop-down has the icon disabled and a text label instead.
		label: 'Lists',
		icon: false,
		items: [ 'bulletedList', 'numberedList', 'todoList' ]
	}
],
```
And here is the effect:

{@snippet features/toolbar-nested-icon}

#### Customizing the tooltip

By default, the tooltip of the button shares its text with the label. You can customize it to better describe your dropdown and make it more accessible by using the `tooltip` property ({@link module:ui/button/buttonview~ButtonView#tooltip learn more}):

```js
toolbar: [
	{
		label: 'Others',
		tooltip: 'Basic formatting features',
		items: [ 'bold', 'italic' ]
	},
	'|',
	'undo', 'redo'
]
```

{@snippet features/toolbar-nested-tooltip}

## Listing available items

You can use the following snippet to retrieve all toolbar items available in your editor:

```js
Array.from( editor.ui.componentFactory.names() );
```

## Adding a custom button

Refer to the {@link framework/creating-simple-plugin-timestamp Creating a simple plugin} guide to learn how to build your own plugin, register its button and add it to the toolbar configuration.

## Block toolbar

The {@link features/blocktoolbar BlockToolbar} feature provides an additional configurable toolbar on the left-hand side of the content area, useful when the main toolbar is not accessible (e.g. in certain {@link installation/getting-started/predefined-builds#balloon-block-editor balloon block editor} scenarios).

## Contribute

The source code of the feature is available on GitHub in [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ui](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ui).
