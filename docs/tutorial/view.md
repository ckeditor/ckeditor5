---
category: tutorial
order: 60
menu-title: Updating editor UI
---

# Updating editor UI

## Editor UI

In the previous chapter of this tutorial we created a command for highlighting selected text. However, having to open a console a running a command is cumbersome and definitely not what editor users would want.

Let's update editor's user interface to make this easier for them.

Editor's UI consists of two parts:

* **toolbar** with buttons, dropdowns and selections for different types of operations,
* **editing view** for typing and modifying the content.

In this section we'll focus on updating the toolbar.

## Creating a new button

Let's import the `ButtonView` contructor:

```js
import { ButtonView } from 'ckeditor5/src/ui';
```

Then add the following code at the bottom of the `Highlight` method:

```js
editor.ui.componentFactory.add( 'highlight', ( locale ) => {
	const button = new ButtonView( locale );
	const command = editor.commands.get( 'highlight' );

	button.set( {
		label: editor.t('Highlight'),
		withText: true,
		tooltip: true,
		isToggleable: true
	} );

	button.on( 'execute', () => {
		editor.execute( 'highlight' );
		editor.editing.view.focus();
	} );

	button.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

	return button;
} );
```

The editor's UI elements are registered using the `componentFactory`, where the first parameter is the name of the element and the second is the callback returning that element.

In the callback, we do four things:

* Create a {@link module:ui/button/button~Button button} and set few properties on it, one of which is translated text, created using the {@link module:utils/locale~Locale#t `editor.t()`} method.
* Register a callback which will execute the `highlight` command and put the focus back on the editing view when the button is pressed.
* Bind the `isOn` and `isEnabled` button attributes to the `value` and `isEnabled` command attributes. It will ensure that the button is clickable only when the command can be execute and that it's active when the highlighting is already applied on the selection.
* Return the configured button.

## Registering a new button

When we go back to the browser we can see that nothing changed. The button that we just created isn't there.

That's because to see the button, we need to register it in editor's configuration. To do so, add the `'highlight'` string (the name we passed as the first argument to the `editor.ui.componentFactory.add()` method) to the `toolbar.items` array.

Open the `src/main.js` file and update the editor's configuration:

```js
const editor = await ClassicEditor.create( element, {
  plugins: [
    Essentials,
    Paragraph,
    Highlight
  ],
  toolbar: {
    items: [
      'undo',
      'redo',
      'highlight' // Add this line
    ]
  }
} );
```

When you refresh the page, the button should be there.

### Testing changes

Let's test our changes. In the browser, select part of the text in the editor and click the `Highlight` button in the toolbar.

If everything went well, the text you selected should be highlighted in the editor and the button should be active. When you click the button again, highlighting should be removed and the button should no longer be active.

## What's next?

Congratulations, you just finished our tutorial!

If you want to continue learning, go to the {@link Framework section} of our documentation.
