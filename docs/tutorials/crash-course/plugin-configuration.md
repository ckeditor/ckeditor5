---
category: crash-course
order: 90
menu-title: Plugin configuration
meta-title: CKEditor 5 crash course - Plugin configuration | CKEditor 5 Documentation
modified_at: 2025-03-14
---

# Plugin configuration

## Configuration convention

As we learned at the beginning of this tutorial, the editor accepts a configuration object that allows you to change its default behavior and appearance. The convention used in CKEditor 5 is to have a unique object key for each plugin to avoid conflicts and to make it obvious what each part of the configuration does.

In this tutorial, we will add a single option to the `highlight` plugin to configure its keyboard shortcut. This configuration will be included in an optional `highlight` key:

```js
const editor = await ClassicEditor.create( element, {
	licenseKey: 'GPL', // Or '<YOUR_LICENSE_KEY>'.
	// Other options are omitted for readability - do not remove them.
	highlight: {

	}
} );
```

## Adding a new configuration key

Once we know the shape of the configuration object that the plugin will accept, let's define a new configuration key and default values. These values will be used if the configuration is not provided in the editor configuration.

To do this, add the following code at the top of the `Highlight` function:

```js
editor.config.define( 'highlight', {
	keystroke: 'Ctrl+Alt+H'
} );
```

The first parameter passed to the method is the name of the configuration object key, and the second is the default values.

### Loading configuration option

We have defined the default value for the `keystroke` key as `'Ctrl+Alt+H'`, which is the value we currently have hardcoded into our plugin. Let's update our plugin to read this value from the configuration instead.

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

```js
const t = editor.t;

editor.accessibility.addKeystrokeInfos( {
	keystrokes: [
		{
			label: t( 'Highlight text' ),
			keystroke: keystroke // Update this line.
		}
	]
} );
```

### Testing changes

Let's test our changes. In the browser, select some of the text in the editor and press the <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>H</kbd> to see if the default configuration works as it did before.

Then, open the `src/main.js` file and update the editor's configuration to change the highlight keyboard shortcut to <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>9</kbd>:

```js
const editor = await ClassicEditor.create( element, {
	licenseKey: 'GPL', // Or '<YOUR_LICENSE_KEY>'.
	// Other options are omitted for readability - do not remove them.
	highlight: {
		keystroke: 'Ctrl+Alt+9'
	}
} );
```

Finally, in the browser, select some of the text in the editor and press the <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>9</kbd> keys to confirm that the new shortcut works.

## The end?

Congratulations, you have just finished this tutorial!

This is not the end, though. If you want to continue learning, go to the {@link framework/index Framework section} of our documentation.
