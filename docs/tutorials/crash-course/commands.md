---
category: crash-course
order: 50
menu-title: Commands
meta-title: CKEditor 5 crash course - Commands | CKEditor 5 Documentation
modified_at: 2025-03-14
---

# Commands

## Commands purpose

Now that we have the data conversion sorted out, let's register a `highlight` command. Commands encapsulate logic that can be executed by other plugins or from the user interface, for example by clicking a button in the editor's toolbar.

## Registering a command

Let's create a new `HighlightCommand` class below the `Highlight` function and add the necessary import in `src/plugin.js`:

```js
import { Command } from 'ckeditor5';

class HighlightCommand extends Command {
	refresh() {
		// Handle state.
	}

	execute() {
		// Command logic.
	}
}
```

Then at the bottom of the `Highlight` function, add the following code to register the command:

```js
editor.commands.add( 'highlight', new HighlightCommand( editor ) );
```

Our command class has two methods:

* `refresh()`, which handles the state.
* `execute()`, which handles the logic.

### Command state

Our plugin only allows text highlighting, so when only an image or table is selected in the editor, we should disable the command. We also want to remove highlighting if the command is called and the selected text is already highlighted.

For this reason, we need a state that indicates whether selections in the editor can be highlighted and whether they are already highlighted.

The command state is managed by the `refresh()` method. This method is called whenever the model is updated, ensuring that the state is refreshed and always up-to-date.

Let's implement the `refresh()` method to update two command properties:

* `value`, which indicates whether the selection is already highlighted,
* `isEnabled`, which indicates whether highlighting is allowed on the current selection.

```js
refresh() {
	const { document, schema } = this.editor.model;

	// Check if selection is already highlighted.
	this.value = document.selection.getAttribute( 'highlight' );

	// Check if command is allowed on current selection.
	this.isEnabled = schema.checkAttributeInSelection( document.selection, 'highlight' );
}
```

### Command logic

Now that we have the necessary state, we can add logic for updating the model.

Let's update the `execute()` method like this:

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

All changes to the model are made using the {@link module:engine/model/writer~Writer model writer}. Its instance is available in the callback passed to the {@link module:engine/model/model~Model#change `model.change()`} method, so we will use it.

In the callback, we first check if the selection is collapsed. Unlike a standard selection, which can span multiple letters, elements, or even blocks, a collapsed selection has a range of zero, meaning that it starts and ends at the same position. In other words, the collapsed selection is just a caret.

If we are dealing with a standard (not collapsed) selection, we check for all the ranges where the `highlight` attribute can be used, loop over them, and either add or remove this attribute depending on the current state.

If the selection is collapsed, we either add or remove the attribute based on the current state.

### Testing changes

Let's test our changes. In the browser, select some of the text in the editor. Then open a console and run the following code:

```js
editor.execute( 'highlight' );
```

If everything went well, the text you selected should be highlighted in the editor.

In the CKEditor Inspector, open the `Commands` tab to see all available commands. The `highlight` command should also be listed.

## What's next

If you want to read more about the commands, see the {@link framework/architecture/core-editor-architecture#commands Commands} document.

Otherwise go to the next chapter, where you will {@link tutorials/crash-course/view learn more about updating the model UI}.
