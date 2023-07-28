---
category: tutorial
order: 90
menu-title: Plugin configuration
---

# Plugin configuration

## Configuration convention

As we learned at the beginning of this tutorial, editor accepts a configuration object that allows you to change its default behavior and appearance.

For the purpose of this tutorial, we'll add a single option to configure the keyboard shortcut for highlighting the selected text.

The convention used in CKEditor is to have a unique object key for each plugin, to avoid conflicts and make it obvious what each part of the configuration does.

Following this convention, we'll add an optional `highlight` key to the configuration, which can contain a `keystroke` option:

```js
const editor = await ClassicEditor.create( element, {
	// Other options are omitted for readability - don't remove them.
	highlight: {
		keystroke: '...'
	}
} );
```

## Adding new configuration key

Once we know the shape of the configuration object that the plugin will accept, let's define new configuration key and default values. These values will be used if the configuration is not provided in the editor configuration.

To do this, add the following code at the top of the `Highlight` function:

```js
editor.config.define( 'highlight', {
	keystroke: 'Ctrl+Alt+H'
} );
```

The first parameter passed to the method is the name of the configuration object key, and the second are the defaults.

### Loading configuration option

We've defined the default value for the `keystroke` key as `'Ctrl+Alt+H'`, which is the value we currently have hardcoded into our plugin. Let's update our plugin to read this value from the configuration instead.

After the configuration we defined above, add the following line to read the `keystroke` configuration:

```js
const keystroke = editor.config.get( 'highlight.keystroke' );
```

Then, replace both occurrences of the `'Ctrl+Alt+H'` string in our plugin:

```js
button.set( {
	label: t( 'Highlight' ),
	withText: true,
	tooltip: true,
	isToggleable: true,
	keystroke // Update this line.
} );
```

```js
editor.keystrokes.set( keystroke, 'highlight' ); // Update this line.
```

### Testing changes

Let's test our changes. In the browser, select some of the text in the editor and press the <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>H</kbd> to see if the default configuration works as it did before.

Then, open the `src/main.js` file and update the editor's configuration to change the highlight keyboard shortcut to <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>9</kbd>:

```js
const editor = await ClassicEditor.create( element, {
	// Other options are omitted for readability - don't remove them.
	highlight: {
		keystroke: 'Ctrl+Alt+9'
	}
} );
```

Finally, in the browser, select some of the text in the editor and press the <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>9</kbd> keys to confirm that the new shortcut works.

## The end?

Congratulations, you have just finished this tutorial!

But this isn't the end. If you want to continue learning, go to the {@link framework/index Framework section} of our documentation.
