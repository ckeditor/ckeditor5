---
category: crash-course
order: 20
menu-title: Plugins
meta-title: CKEditor 5 crash course - Plugins | CKEditor 5 Documentation
modified_at: 2023-08-16
---

# Plugins

## Dependencies

In the previous chapter of this tutorial, we learned that the editor is just an empty shell, and what gives the editor almost all of its functionality are the plugins. We also installed two plugins to be able to type in the editor.

```js
import { Essentials, Paragraph } from 'ckeditor5';

const editor = await ClassicEditor.create( element, {
	licenseKey: 'GPL', // Or '<YOUR_LICENSE_KEY>'.
	plugins: [
		Essentials,
		Paragraph
	]
} );
```

However, we have actually installed more plugins - how so?

The `Essentials` plugin is a wrapper for other plugins, each providing the basic functionality you would expect from a text editor:

* {@link module:clipboard/clipboard~Clipboard},
* {@link module:enter/enter~Enter},
* {@link module:select-all/selectall~SelectAll},
* {@link module:enter/shiftenter~ShiftEnter},
* {@link module:typing/typing~Typing},
* {@link module:undo/undo~Undo}.

Another common pattern is that plugins depend on other plugins and need them to work properly. This is usually noted in the documentation of a given plugin, and the error messages thrown by the editor will include an explanation of what's missing.

Since the `Essentials` plugin does not define block-level containers, we also installed the `Paragraph` plugin to add support for the `<p>` HTML tag.

## List of plugins

The editor we created so far still lacks many features, such as support for headings, tables, block quotes, and much more. You can add them using plugins, of course.

For a list of plugins, usage examples, installation, and configuration options, see the {@link framework/architecture/plugins#plugins-and-html-output Plugins and HTML output} guide.


## Creating custom plugins

If the editor and any of its plugins do not provide the functionality you need, you may want to create a custom plugin. This requires knowledge of the editor's internals, which we will discover in the next chapters of the tutorial.

We will create a simplified version of the existing {@link features/highlight highlight} plugin. We want to be able to highlight certain parts of the text to make them stand out from the rest.

If you ever get stuck, want to see an example of writing a TypeScript plugin, or just want to see our APIs in action, check out the [`Highlight` plugin source code](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-highlight).

### Registering custom plugin

In the project, we created in the previous chapter, open the `src/plugin.js` file. Inside it, create and export a `Highlight` function.

```js
export function Highlight( editor ) {
	console.log( 'Highlight plugin has been registered' );
}
```

Then, in the `src/main.js` file, import and register this function as an editor plugin.

```js
import { Highlight } from './plugin';

const editor = await ClassicEditor.create( element, {
	licenseKey: 'GPL', // Or '<YOUR_LICENSE_KEY>'.
	plugins: [
		// Other plugins are omitted for readability - do not remove them.
		Highlight
	]
} );
```

Now when the page refreshes, you should see a `Highlight plugin has been registered` text printed in the console. This confirms that the plugin constructor is called correctly.

## What's next

In the next chapter, you will continue creating a custom plugin and {@link tutorials/crash-course/model-and-schema learn more about model and schema}, which control the state of the editor.
