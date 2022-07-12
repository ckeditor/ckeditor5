---
category: simple-plugin
order: 25
---

# Abbreviation plugin tutorial - part 3

You made it to the final part of the abbreviation plugin tutorial. In this part, we'll improve accessibility of our plugin. We'll also work on a command, which will additionally grab the text from user's selection, and insert it into our form. And more!

We'll pick up where we left off in {@link framework/guides/simple-plugin-tutorial/abbreviation-plugin-level-2 the second part}, so make sure you finished it, or grab our starter files for this part.

If you want to see the final product of this tutorial before you plunge in, check out the [demo](#demo).

## Improving accessibility

Let's make our plugin accessible for users who rely on keyboards for navigation. We want to ensure that pressing `tab` and `shift + tab` will move focus around in the form view, and pressing `esc` will close it.

<info-box>
In order to improve accessibility of the plugin, it's important to understand how keystroke and focus management works in the CKEditor 5 framework. We recommend you read up on {@link framework/guides/architecture/ui-library#keystrokes-and-focus-management the basics}, or do {@link framework/guides/deep-dive/focus-tracking a deep dive into focus tracking}.
</info-box>

We have some ready-to-use options to help us out - {@link framework/guides/deep-dive/focus-tracking#using-the-keystrokehandler-class the KeystrokeHandler}, {@link framework/guides/deep-dive/focus-tracking#using-the-focustracker-class FocusTracker}, and {@link framework/guides/deep-dive/focus-tracking#using-the-focuscycler-class FocusCycler} helper classes.

### Adding a keystroke handler and a focus tracker

Start by importing the {@link module:utils/keystrokehandler~KeystrokeHandler `KeystrokeHandler`} and {@link module:utils/focustracker~FocusTracker `FocusTracker`} classes into your form view, and creating their new instances in the `constructor()`.

Now, in the `render()` method, you can add each element of our `childViews` view collection to the `focusTracker`. There, you can also start listening for the keystrokes coming from the rendered view element.

Lastly, let's add a `destroy()` method, and destroy both the focus tracker and the keystroke handler. It will ensure that when the user kills the editor, our helpers 'die' too, preventing any memory leakages.

```js
// abbreviation/abbreviationview.js

import {
	View,
	LabeledFieldView,
	createLabeledInputText,
	ButtonView,
	submitHandler,
} from '@ckeditor/ckeditor5-ui';
import { FocusTracker, KeystrokeHandler } from '@ckeditor/ckeditor5-utils'; // ADDED
import { icons } from '@ckeditor/ckeditor5-core';

export default class FormView extends View {
	constructor( locale ) {
		// ...

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		// ...
	}

    render() {
		// ...

		this.childViews._items.forEach( v => {
			// Register the view in the focus tracker.
			this.focusTracker.add( v.element );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );
    }

	destroy() {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	// ...
}
```

### Adding a focus cycler

{@link module:ui/focuscycler~FocusCycler `FocusCycler`} will allow the user to navigate through all the children of our form view, cycling over them. Check how our navigation works now in our form view - we can use `tab` to move from the first input field to the second, but then the focus leaves the form, and the editor itself. Let's fix that.

Import the `FocusCycler` class, and create its instance in the form view `constructor()`. You need to pass an object with focusables (so our `childViews` collection), the focus tracker, the keystroke handler, and the actions connected to different keystrokes.

```js
// abbreviation/abbreviationview.js

import {
	View,
	LabeledFieldView,
	createLabeledInputText,
	ButtonView,
	submitHandler,
	FocusCycler																// ADDED
} from '@ckeditor/ckeditor5-ui';
import { FocusTracker, KeystrokeHandler } from '@ckeditor/ckeditor5-utils';
import { icons } from '@ckeditor/ckeditor5-core';

export default class FormView extends View {
	constructor( locale ) {

		// ...

		this._focusCycler = new FocusCycler( {
			focusables: this.childViews,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );

		this.setTemplate( {
			// ...
		} );
	}

	// ...
}
```

Now, we can add `esc` button handler in our `_createFromView()` function, which will hide the UI and fire off `cancel` on the form.

```js
// abbreviation/abbreviationui.js

// ...

class AbbreviationUI extends Plugin {
	// ...

	_createFormView() {
		// ...

		// Close the panel on esc key press when the form has focus.
		formView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideUI();
			cancel();
		} );

		return formView;
	}

	// ...
}
```

We're done with improving accessibility for keyboard-only users. Try it out yourself by pressing `tab`, `tab + shift`, and `esc` in the form.

## Improving the UI functionalities

When user selects a range (meaning a letter, a word, or a whole document fragment) and presses the abbreviation button, he might expect that his selected text appears automatically in the abbreviation input field. Let's add this functionality to our form.

<info-box>
As we'll be working with user's selection in the document, it's important to understand what exactly it means in the editor's model. Read our introduction to {@link framework/guides/architecture/editing-engine#positions-ranges-and-selections positions, ranges and selections}.
</info-box>

In order insert the user's selection in the form field, we need to first grab and concatenate all text from the selected range. If the user selects a couple of paragraphs, a heading, and an image, we need to go through all the nodes, and use only the ones containing text.

Let's create a helper `getRangeText()` function in a separate `/utils.js` file. It will grab all items from a range using its `getItems()` method. Then, it will concatenate all text from {@link module:engine/model/text~Text `text`} and {@link module:engine/model/textproxy~TextProxy `textProxy`} nodes, and skip all others.

```js
// abbreviation/utils.js

// A helper function that retrieves and concatenates all text within the model range.
export default function getRangeText( range ) {
	return Array.from( range.getItems() ).reduce( ( rangeText, node ) => {
		if ( !( node.is( 'text' ) || node.is( 'textProxy' ) ) ) {
			return rangeText;
		}

		return rangeText + node.data;
	}, '' );
}

```

Now, in `AbbreviationUI` we can adjust the `_showUI()` method to display the selected text in the abbreviation input field. Import `getRangeText` and pass it the first range in the selection (using {@link module:engine/model/documentselection~DocumentSelection#getFirstRange `getFirstRange()`} method).

We will also disable the input field when the selection is not collapsed, because it would be hard to change the text of the abbreviation if the selection spanned multiple paragraphs.

```js
// abbreviation/abbreviationui.js
// ...
import { getRangeText } from './utils.js';

class AbbreviationUI extends Plugin {

	// ...

	_showUI() {
		const selection = this.editor.model.document.selection;

		this._balloon.add( {
			view: this.formView,
			position: this._getBalloonPositionData()
		} );

		// Disable the input when the selection is not collapsed.
		this.formView.abbrInputView.isEnabled = selection.getFirstRange().isCollapsed;

		const selectedText = getRangeText( selection.getFirstRange() );
		this.formView.abbrInputView.fieldView.value = selectedText;
		this.formView.titleInputView.fieldView.value = '';

		this.formView.focus();
	}

	// ...
}

```

Since we're disabling the first input field in some cases, let's update the `focus()` method in our form view accordingly.

```js
// abbreviation/abbreviationview.js
// ...

export default class FormView extends View {

	// ...

	focus() {
		// If the abbreviation text field is enabled, focus it.
		if ( this.abbrInputView.isEnabled ) {
			this.abbrInputView.focus();
		}
		// Focus the abbreviation title field if the former is disabled.
		else {
			this.titleInputView.focus();
		}
	}
	// ...
}
```

Our new functionality should work now, check it out yourself! It doesn't recognize if selected text is an abbreviation already, so if you select "WYSIWYG", the full title doesn't appear in the title input field. We'll change it in a couple of steps.

## Adding a command

Our plugin does what we want it to do, so why complicate things by adding a command? Well, a command not only executes an action, but also automatically reacts when any changes are applied to the model.

<info-box>
A command in CKEditor 5 is a combination of an action and a state. The state of the command refreshes its state whenever anything changes in the model. We highly recommend {@link framework/guides/architecture/core-editor-architecture#commands reading up on commands} before we move on.
</info-box>

When the user makes a selection in the editor, the command will automatically check if there is an abbreviation there. It will also ensure that the command is only enabled only where the "abbreviation" attribute can be set on the current model selection (not on images, for instance).

### Creating a command

Let's start by creating our command, and moving the existing action logic there.

In the `/abbreviationcommand.js` file import {@link module:core/command~Command the `Command` class}, and create its instance.

We'll start by simply moving there the action we already created for `submit` in our `_createFormView()` method, passing the title and the abbreviation text into the command's `execute()` method.

```js
// abbreviation/abbreviationcommand.js

import Command from '@ckeditor/ckeditor5-core/src/command';

export default class AbbreviationCommand extends Command {
	execute( { title, abbr } ) {

			editor.model.change( writer => {
				editor.model.insertContent(
					writer.createText( abbr, { abbreviation: title } )
				);
			} );

	}
}
```

Now, let's add initialize our `AbbreviationCommand`, by adding it to the list of editor's commands in `AbbreviationEditing`. We'll also pass there a name we'll use to call our command.

```js
// abreviation/abbreviationediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import AbbreviationCommand from './abbreviationcommand';					// ADDED

class AbbreviationEditing extends Plugin {
	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add(
			'addAbbreviation', new AbbreviationCommand( this.editor )
		);
	}

	// ...
}
```
Now, we can replace the action called on `submit` with our new command, passing it into editor's `execute()` method, along with the abbreviation and title values.

```js
// abbreviation/abbreviationui.js
// ...

class AbbreviationUI extends Plugin {

	// ...

	_createFormView() {
		const editor = this.editor;
		const formView = new FormView( editor.locale );

		// Execute the command after clicking the "Save" button.
		this.listenTo( formView, 'submit', () => {
			const value = {
				abbr: formView.abbrInputView.fieldView.element.value,
				title: formView.titleInputView.fieldView.element.value
			};
			editor.execute( 'addAbbreviation', value );

			this._hideUI();
		} );

		// ...
	}

	// ...
}

```
The command should now work, and pressing the `submit` button should have the same effect as it did before. We can now explore some additional functionalities.

### Refreshing the state

Thanks to the command's {@link module:core/command~Command#refresh `refresh()`} method, we can observe the state and the value of our command not just when the user presses the button, but whenever any changes are made in the editor. We'll use this to check if the user's selection has an abbreviation model attribute already.

Before we do that, let's check if the command can be use at all on a given selection. If the user selects an image, the command should be disabled. Let's check if our `abbreviation` attribute is allowed in the schema, using it's {@link module:engine/model/schema~Schema#checkAttributeInSelection `checkAttributeInSelection()`} method.

```js
// abbreviation/abbreviationcommand.js

import Command from '@ckeditor/ckeditor5-core/src/command';

export default class AbbreviationCommand extends Command {
		refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		// The command is enabled when the "abbreviation" attribute
		// can be set on the current model selection.
		this.isEnabled = model.schema.checkAttributeInSelection(
			selection, 'abbreviation'
		);
	}

	execute( { title, abbr } ) {
		// ...
	}
}
```
We can now check if the selected range is collapsed. If so, we'll check if the caret is in an abbreviation, and grab the entire range containing it. We can easily do so using the {@link module:typing/utils/findattributerange~findAttributeRange `findAttributeRange`} helper function. We need to pass it the first position of the selection, our attribute name and value, and the model.

Then, we'll change the value of the command. We'll get the abbreviation text using our `getRangeText` helper function. We'll also add a range value, which we'll use when executing the command.

```js
// abbreviation/abbreviationcommand.js

import Command from '@ckeditor/ckeditor5-core/src/command';
import {
	findAttributeRange
} from '@ckeditor/ckeditor5-typing/src/utils/findattributerange'; 	// ADDED
import { getRangeText } from './utils.js';							// ADDED

export default class AbbreviationCommand extends Command {
		refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const firstRange = selection.getFirstRange();

		// When the selection is collapsed, the command has a value
		// if the caret is in an abbreviation.
		if ( firstRange.isCollapsed ) {
			if ( selection.hasAttribute( 'abbreviation' ) ) {
				const attributeValue = selection.getAttribute( 'abbreviation' );

				// Find the entire range containing the abbreviation
				// under the caret position.
				const abbreviationRange = findAttributeRange(
					selection.getFirstPosition(), 'abbreviation', attributeValue, model
				);

				this.value = {
					abbr: getRangeText( abbreviationRange ),
					title: attributeValue,
					range: abbreviationRange
				};
			} else {
				this.value = null;
			}
		}

		// ...
	}

	execute( { title, abbr } ) {
		// ...
	}
}
```
If the selection is not collapsed, we'll check if it has the `abbreviation` model attribute. If so, we'll again grab the full range of the abbreviation and compare it with the user selection.

When the user selects a bit of text with the abbreviation attribute, along with a bit without it, we don't want to change the command's value. So, we'll use the {@link module:engine/model/range~Range#containsRange `containsRange()`} method to see if the selected range is withing the abbreviation range. The second parameter makes it a `loose` check, meaning the selected range can start, end, or be equal to the abbreviation range.

```js
// abbreviation/abbreviationcommand.js

//...

export default class AbbreviationCommand extends Command {
		refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const firstRange = selection.getFirstRange();

		if ( firstRange.isCollapsed ) {
			// ...
		}
		// When the selection is not collapsed, the command has a value if the selection
		// contains a subset of a single abbreviation or an entire abbreviation.
		else {
			if ( selection.hasAttribute( 'abbreviation' ) ) {
				const attributeValue = selection.getAttribute( 'abbreviation' );

				// Find the entire range containing the abbreviation
				// under the caret position.
				const abbreviationRange = findAttributeRange(
					selection.getFirstPosition(), 'abbreviation', attributeValue, model
				);

				if ( abbreviationRange.containsRange( firstRange, true ) ) {
					this.value = {
						abbr: getRangeText( firstRange ),
						title: attributeValue,
						range: firstRange
					};
				} else {
					this.value = null;
				}
			} else {
				this.value = null;
			}
		}

		// ...
	}

	execute( { title, abbr } ) {
		// ...
	}
}
```

We can now check the command value when the user presses the toolbar abbreviation button, and insert both abbreviation text and title values into the form's input fields.

In the `AbbreviationUI` add a simple `if` statement to fill the form using either the value of the command, or the selected text (as we did before).

```js
// abbreviation/abbreviationui.js
// ...
import { getRangeText } from './utils.js';

class AbbreviationUI extends Plugin {

	// ...

	_showUI() {
		const selection = this.editor.model.document.selection;

		// Check the value of the command.
		const commandValue = this.editor.commands.get( 'addAbbreviation' ).value;

		this._balloon.add( {
			view: this.formView,
			position: this._getBalloonPositionData()
		} );

		// Disable the input when the selection is not collapsed.
		this.formView.abbrInputView.isEnabled = selection.getFirstRange().isCollapsed;

		// Fill the form using the state (value) of the command.
		if ( commandValue ) {
			this.formView.abbrInputView.fieldView.value = commandValue.abbr;
			this.formView.titleInputView.fieldView.value = commandValue.title;
		}
		// If the command has no value, put the currently selected text (not collapsed)
		// in the first field and empty the second in that case.
		else {
			const selectedText = getRangeText( selection.getFirstRange() );

			this.formView.abbrInputView.fieldView.value = selectedText;
			this.formView.titleInputView.fieldView.value = '';
		}

		this.formView.focus();
	}

	// ...
}

```
### Improving the `execute()` method

We should now introduce more cases into our `execute()` method. For starters, if the user's selection is not collapsed, we just need to add abbreviation attribute to his selection, instead of inserting the abbreviation text into the model.

So if the selection is not collapsed, we'll gather all the ranges, that are allowed to use the `abbreviation` model attribute, using the schema's {@link module:engine/model/schema~Schema#getValidRanges `getValidRanges()`} method. Then we'll use the {@link module:engine/model/writer~Writer#setAttribute `setAttribute()`}, to add the title value to each of the ranges.

If the selection is collapsed, we'll keep our `insertContent()` model method from before. Then, we need to use `removeSelectionAttribute` method, to stop adding new content into the abbreviation if the user starts to type.

```js

// ...

class AbbreviationCommand extends Command {
	refresh() {
		// ...
	}

	execute( { abbr, title } ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			// If selection is collapsed then update the selected abbreviation
			// or insert a new one at the place of caret.
			if ( selection.isCollapsed ) {
				model.insertContent(
					writer.createText( abbr, { abbreviation: title } )
				);

				// Remove the "abbreviation" attribute attribute from the selection.
				writer.removeSelectionAttribute( 'abbreviation' );
			} else {
				// If the selection has non-collapsed ranges,
				//change the attribute on nodes inside those ranges
				// omitting nodes where the "abbreviation" attribute is disallowed.
				const ranges = model.schema.getValidRanges(
					selection.getRanges(), 'abbreviation'
				);

				for ( const range of ranges ) {
					writer.setAttribute( 'abbreviation', title, range );
				}
			}
		} );
	}
}

```
Now we can use the command's state to check if the selection is in an existing abbreviation. If the command's value is not `null`, we'll grab the whole range, and update its text and title.

We'll create a position at the end of the inserted abbreviation, and set selection there. The {@link module:engine/model/model~Model#insertContent `insertContent()`} method returns a range, and we can grab its {@link module:engine/model/range~Range#end end} to define our `positionAfter`.

```js

import Command from '@ckeditor/ckeditor5-core/src/command';
import findAttributeRange from '@ckeditor/ckeditor5-typing/src/utils/findattributerange';

class AbbreviationCommand extends Command {
	refresh() {
		// ...
	}

	execute( { abbr, title } ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			// If selection is collapsed then update the selected abbreviation
			// or insert a new one at the place of caret.
			if ( selection.isCollapsed ) {
				// When a collapsed selection is inside text with the "abbreviation" attribute,
				// update its text and title.
				if ( this.value ) {
					const { end: positionAfter } = model.insertContent(
						writer.createText( abbr, { abbreviation: title } ),
						this.value.range
					);

					// Put the selection at the end of the inserted abbreviation.
					writer.setSelection( positionAfter );
				}

				writer.removeSelectionAttribute( 'abbreviation' );
			} else {
				// ...
			}
		} );
	}
}

```

If the collapsed selection is not in an existing abbreviation,  we'll insert a text node with the "abbreviation" attribute in place of the caret.

The user might place the abbreviation inside a text, which already has other model attributes, like "bold" or "italic". We should first collect them along with our abbreviation attribute, and use the whole list when inserting the abbreviation into the document. We'll use our {@link module:utils/tomap~toMap `toMap`} helper function to collect all attributes.

```js

import Command from '@ckeditor/ckeditor5-core/src/command';
import findAttributeRange from '@ckeditor/ckeditor5-typing/src/utils/findattributerange';
import { getRangeText } from './utils.js';
import { toMap } from '@ckeditor/ckeditor5-utils';							// ADDED

class AbbreviationCommand extends Command {
	refresh() {
		// ...
	}

	execute( { abbr, title } ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			if ( selection.isCollapsed ) {
				if ( this.value ) {
					// ...
				}
				// If the collapsed selection is not in an existing abbreviation,
				//insert a text node with the "abbreviation" attribute
				// in place of the caret.
				// If the abbreviation is empty, do not do anything.
				else if ( abbr !== '' ) {
					const firstPosition = selection.getFirstPosition();

					// Collect all attributes of the user selection.
					const attributes = toMap( selection.getAttributes() );

					// Put the new attribute to the map of attributes.
					attributes.set( 'abbreviation', title );

					// Inject the new text node with the abbreviation text
					// with all selection attributes.
					const { end: positionAfter } = model.insertContent(
						writer.createText( abbr, attributes ), firstPosition
					);

					// Put the selection at the end of the inserted abbreviation.
					writer.setSelection( positionAfter );
				}

				writer.removeSelectionAttribute( 'abbreviation' );
			} else {
				// ...
			}
		} );
	}
}

```
The command is now done, check how it works by trying all our different cases - selection collapsed, not collapsed, inside an existing abbreviation, etc.

That's it, you've finished the tutorial! You're ready to create your own plugins. If you want to continue learning, continue to our more advanced tutorials, starting with {@link framework/guides/tutorials/implementing-a-block-widget "Implementing a block widget"}.

## Demo

{@snippet framework/abbreviation-level-3}

## Final code
