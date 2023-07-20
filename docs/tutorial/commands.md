---
category: tutorial
order: 50
menu-title: Updating model using commands
---

# Updating model using commands

## Commands purpose

Now that we have data conversion sorted out, let's register a `highlight` command. Commands encapsulate logic that can be execute by other plugins or from the UI, for example by clicking a button in the editor's toolbar.

## Registering a command

Let's create a new `HighlightCommand` class below the `Highlight` function and add necessary import in `src/plugin.js`:

```js
import { Command } from 'ckeditor5/src/core';

class HighlightCommand extends Command {
	refresh() {
		// Handle state
	}

	execute() {
		// Command logic
	}
}
```

Then at the bottom of the `Highlight` function add the following code to register the command:

```js
editor.commands.add('highlight', new HighlightCommand( editor ));
```

Our command class has two methods:

* `refresh()` which handles command state,
* `execute()` which handles command logic.

### Command state

Our plugin only allows highlighting text, so when an image or table is selected in the editor, we should disable the command. We also want to remove highlighting when the command is called and selected text is already highlighted.

For this reason we need state that will indicate if selections in the editor can be highlighted and if they're already highlighted.

The command state is managed by the `refresh()` method. The command automatically refreshes its state by automatically calling this method whenever model is updated.

Let's update the `refresh()` method to update two command properties:

* `isEnabled` indicating if highlighting is allowed on the current selection,
* `value` indicating if the selection is already highlighted.

```js
refresh() {
	const { document, schema } = this.editor.model;

	// Check if selection is already highlighted
	this.value = document.selection.getAttribute( 'highlight' );

	// Check if command is allowed on current selection
	this.isEnabled = schema.checkAttributeInSelection( document.selection, 'highlight' );
}
```

### Command logic

Now that we have the necessary state we can add logic for updating the model.

Let's update the `execute()` method like so:

```js
execute() {
	const model = this.editor.model;
	const selection = model.document.selection;
	const newValue = !this.value;

	model.change( ( writer ) => {
		if ( !selection.isCollapsed ) {
			const ranges = model.schema.getValidRanges( selection.getRanges(), 'highlight' );

			for ( const range of ranges ) {
				if ( newValue ) {
					writer.setAttribute( 'highlight', newValue, range );
				} else {
					writer.removeAttribute( 'highlight', range );
				}
			}
		}

		if ( newValue ) {
			return writer.setSelectionAttribute( 'highlight', true );
		}

		return writer.removeSelectionAttribute( 'highlight' );
	} );
}
```

All changes to the model are done using the {@link module:engine/model/writer~Writer model writer}. Its instance is available in the callback passed to the {@link module:engine/model/model~Model#change `model.change()`} method and so that's what we use.

In the callback, we first check if selection is collapsed. Unlike standard selection which can span multiple letters, elements or even blocks, collapsed selection has a range of zero, meaning that is starts and ends at the same position. In other words, collapsed selection is just a caret.

And so, if we are dealing with standard selection (not collapsed), we retrieve all ranges where the `highlight` attribute can be used, loop over them and either add or remove this attribute, depending on the current state.

If selection is collapsed, we either add or remove the attribute.

### Testing changes

Let's test our changes. In the browser, select part of the text in the editor. Then open the console and run the following code:

```js
editor.execute('highlight');
```

If everything went well, the text you selected should be highlighted in the editor.

## What's next?

If you want to read more about the commands, see the {@link framework/architecture/core-editor-architecture#commands Commands} document.

Otherwise go to the next chapter, where you'll {@link tutorial/view learn more about updating model UI}.
