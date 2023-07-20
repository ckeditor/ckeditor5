---
category: tutorial
order: 20
menu-title: Plugins
---

# Plugins

## Dependencies

In the previous chapter of the tutorial, we learned that the editor is just an empty shell and what provides almost all functionality to the editor are the plugins. We also installed two plugins to be able to type in the editor.

```js
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

const editor = await ClassicEditor.create( element, {
	plugins: [
		Essentials,
		Paragraph
	]
} );
```

However, in reality we installed more plugins — how so?

The `Essentials` plugin is a wrapper for more plugins where each provide base functionality you would expect a text editor to have:

* {@link module:clipboard/clipboard~Clipboard},
* {@link module:enter/enter~Enter},
* {@link module:select-all/selectall~SelectAll},
* {@link module:enter/shiftenter~ShiftEnter},
* {@link module:typing/typing~Typing},
* {@link module:undo/undo~Undo}.

Another common pattern is that plugins depend on other plugins and require them for proper functioning. This is usually stated in the documentation of the given plugin and error throw by the editor contains an appropriate message explaining what's missing.

## List of plugins

Because the `Essentials` plugin doesn't define any block-level containers, we also installed the `Paragraph` plugin to add support for the `<p>` HTML tag.

The editor we created so far is still missing a lot of features, such as support for headings, tables, block quotes and much more. You can add them using plugins of course.

For a list of plugins, usage examples, installation and configuration options, see the {@link features/index Features} page.

## Predefined builds

The fact that individual plugins add support for such minor functionalities as support for typing, <kbd>Enter</kbd> or `<p>`, doesn't mean that you have to browse the long list of plugins and meticulously install those that you need to get good typing experience. You can do it if you want to have full control over the editor. But if that's not your thing, you can use any of the {@link installation/getting-started/predefined-builds predefined builds} with the most important and popular plugins already installed and configured.

## Creating custom plugins

If editor and any of its plugins doesn't provide the functionality you need, you might want to create a custom plugin. This requires knowledge of editor internals, which we will discover in the next steps of the tutorial.

We'll be creating a simplified version of the already existing {@link features/highlight Highlight} plugin. We want to be able to highlight certain parts of the text to make them stand out from the rest.

If you ever get stuck, want to see example of writing a TypeScript plugin or just want to see our APIs in action, see [`Highlight` plugin source code](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-highlight).

### Registering custom plugin

In the project we created in the previous chapter, create a new file called `plugin.js` inside the `src` folder. Inside of it create and export a `Highlight` function.

```js
// src/plugin.js

export function Highlight(editor) {
	console.log('Highlight plugin has been registered');
}
```

Then, in the `src/main.js` file, import and register this function as editor plugin.

```js
// src/main.js

import { Highlight } from './plugin';

const editor = await ClassicEditor.create( element, {
	plugins: [
		// Other plugins are omitted for readability - don't remove them
		Highlight
	]
} );
```

Now when the page refreshes, you should see a `Highlight plugin has been registered` text printed in the console. This confirms that the plugin worked correctly.

## What's next

In the next chapter you'll {@link tutorial/model-and-schema learn more about model and schema} which control state of the editor and continue creating a custom plugin.
