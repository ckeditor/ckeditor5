---
category: tutorial
order: 80
menu-title: Handling keystrokes
---

# Handling keystrokes

## Accessibility

Currently, our `highlight` plugin requires the user to click the button in the editor's toolbar to highlight selected text. This can be a problem for users who rely on the keyboard, so let's add a keyboard shortcut as an alternative way to highlight the text.

## Adding keyboard shortcuts

Common shortcut for highlighting text is <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>H</kbd>, so that's what we're going to use in our plugin.

To execute the `highlight` command when those keys are pressed, add the following code to the end of the `Highlight` function:

```js
editor.keystrokes.set( 'Ctrl+Alt+H', 'highlight' );
```

As you can see, the first parameter passed to the function is a string representing the keys that need to be pressed, while the second parameter is the name of the command to be executed. Alternatively, instead of the command name, you can pass a callback and call the command inside:

```js
editor.keystrokes.set( 'Ctrl+Alt+H', ( event, cancel ) => {
	editor.execute( 'highlight' );
	cancel();
} );
```

## Updating button tooltip

When you hover over the "Undo" and "Redo" buttons, you'll see a tooltip containing name of the operation and their respective keyboard shortcuts. However, when hovering over the "Highlight" button, the keyboard shortcut is missing.

We can fix this, by adding the a `keystroke` attribute to the button:

```js
button.set( {
	label: t( 'Highlight' ),
	withText: true,
	tooltip: true,
	isToggleable: true,
	keystroke: 'Ctrl+Alt+H' // Add this attribute
} );
```

## Deep dive

The one-liner we used to register a new keyboard shortcut hides a lot of complexity. Let's see how we can achieve the same effect using more low-level APIs to better understand what's really happening.

To get the keystrokes, we can listen to the events from the {@link framework/deep-dive/event-system event system} we explored in the previous tutorial chapter fired from the Editing view document.

```js
// 5570632 is the code for the 'Ctrl+Alt+H' keyboard shortcut.
editor.editing.view.document.on( 'keydown:5570632', ( event, data ) => {
	// Call the `highlight` command.
	editor.execute( 'highlight' );

	// Stop the event in the DOM.
	data.preventDefault();
	data.stopPropagation();

	// Stop the event in the framework.
	event.stop();

	// Mark this event as handled.
	event.return = true;
} );
```

As you can see above, we registered a listener that listens to the events fired when the <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>H</kbd> keys are pressed. When this happens, the callback is called and it executes the `highlight` command.

To make sure that nothing unexpected happens (for example if some browser extension also uses this keyboard shortcut), we stop further propagation of the event to prevent any other DOM or framework listeners from reacting to this key combination and mark the event as handled.

## What's next

In the next and final chapter, you'll {@link tutorial/plugin-configuration learn more about plugin configuration}.
