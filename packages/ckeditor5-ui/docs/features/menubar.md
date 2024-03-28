---
title: Menu bar
category: features-toolbar
meta-title: Menu bar | CKEditor 5 Documentation
order: 30
---
{@snippet features/build-menubar-source}

# Menu bar

The toolbar is the most basic user interface element of CKEditor&nbsp;5 that gives you convenient access to all its features. It has buttons and dropdowns that you can use to format, manage, insert, and change elements of your content.

## Demo

Below is a sample menu bar with a basic set of features. Menu items can be easily added or removed. Read on to learn how to do that.

{@snippet features/menubar-basic}

<info-box info>
	For clarity, all demos in this guide present a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Basic menu bar configuration

<info-box hint>
	Toolbar configuration is a strict UI-related setting. Removing a toolbar item does not remove the feature from the editor internals. If your goal with the toolbar configuration is to remove features, the right solution is to also remove their plugins. Check {@link installation/getting-started/configuration#removing-features removing features} for more information.
</info-box>

Depending on your needs, you may want various toolbar arrangement and you can achieve this through configuration. The following example may give you a general idea:

<!-- Sample configuration snippet, please redo -->
```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: [ 'undo', 'redo', 'bold', 'italic', 'numberedList', 'bulletedList' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```

<!-- Here follow several suggestions for the config section -->
## Separating menu bar items

You can use `'|'` to create a separator between groups of toolbar items. This works in both the basic and extended configuration formats.

## Grouping menu bar items in dropdowns

To save space in your toolbar or arrange the features thematically, you can group several items into a dropdown. For instance, check out the following configuration:

### Customization

You can customize the look of the dropdown by configuring additional properties, such as the icon, label, or tooltip text.

#### Displaying the label

#### Customizing the tooltip

<!-- Not sure if this will be available? -->
## Listing available items

You can use the following snippet to retrieve all menu bar items available in your editor:

```js
Array.from( editor.ui.componentFactory.names() );
```

<!-- Suggested possible section -->
## Common API

The menu bar feature registers the followings components:

<!-- Up to decision -->
## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ui](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ui).
