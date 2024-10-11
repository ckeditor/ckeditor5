---
category: abbreviation-plugin
menu-title: Improving accessibility and adding a command
order: 26
meta-title: Creating an advanced plugin tutorial pt. 3 | CKEditor 5 Documentation
modified_at: 2022-07-15
---

# Improving accessibility and adding a command

You made it to the final part of the abbreviation plugin tutorial. In this part, we will improve accessibility of our plugin. We will also work on a command, which will additionally grab the text from user's selection, and insert it into our form. And more!

We pick up where we left off in the {@link tutorials/abbreviation-plugin-tutorial/abbreviation-plugin-level-2 second part}, so make sure you finished it, or grab our starter files for this part using the commands below.

```bash
npx -y degit ckeditor/ckeditor5-tutorials-examples/abbreviation-plugin/part-2 abbreviation-plugin
cd abbreviation-plugin

npm install
npm run dev
```

If you want to see the final product of this tutorial before you plunge in, check out the [live demo](#demo).

## Improving accessibility

First, we make our plugin accessible for users who rely on keyboards for navigation. We want to ensure that pressing <kbd>Tab</kbd> and <kbd>Shift</kbd> + <kbd>Tab</kbd> will move focus around in the form view, and pressing <kbd>Esc</kbd> will close it.

<info-box>
	To improve the accessibility of the plugin, it is important to understand how keystroke and focus management works in the CKEditor&nbsp;5 framework. We recommend you {@link framework/architecture/ui-library#keystrokes-and-focus-management read up on the basics}, or do a {@link framework/deep-dive/focus-tracking deep dive into focus tracking}.
</info-box>

We have some ready-to-use options to help us out &ndash; the {@link framework/deep-dive/focus-tracking#using-the-keystrokehandler-class KeystrokeHandler}, {@link framework/deep-dive/focus-tracking#using-the-focustracker-class FocusTracker}, and {@link framework/deep-dive/focus-tracking#using-the-focuscycler-class FocusCycler} helper classes.

### Adding a keystroke handler and a focus tracker

We start by importing the `KeystrokeHandler` and `FocusTracker` classes into our form view, and creating their new instances in the `constructor()`.

Now, in the `render()` method, we add each element of our `childViews` view collection to the `focusTracker`. There, we can also start listening for the keystrokes coming from the rendered view element.

Finally let's add the `destroy()` method, and destroy both the focus tracker and the keystroke handler. It will ensure that when the user kills the editor, our helpers "die" too, preventing any memory leaks.

```js
// abbreviation/abbreviationview.js

import {
	View,
	LabeledFieldView,
	createLabeledInputText,
	ButtonView,
	submitHandler,
	icons,
	FocusTracker,		// ADDED
	KeystrokeHandler,	// ADDED
} from 'ckeditor5';

export default class FormView extends View {
	constructor( locale ) {
		// View class constructor invoke.
		// ...

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		// Code prepared in the previous part.
		// ...
	}

    render() {
		// View.render() invocation and adding a submit handler.
		// ...

		this.childViews._items.forEach( view => {
			// Register the view in the focus tracker.
			this.focusTracker.add( view.element );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );
    }

	destroy() {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	// Previously declared helper methods.
	// ...
}
```

### Adding a focus cycler

The `FocusCycler` will allow the user to navigate through all the children of our form view, cycling over them. Check how our navigation works now in our form view &ndash; we can use <kbd>Tab</kbd> to move from the first input field to the second, but then the focus leaves the form, and the editor itself. Let's fix that.

We import the `FocusCycler` class, and create its instance in the form view `constructor()`. We need to pass an object with focusables (so our `childViews` collection), the focus tracker, the keystroke handler, and the actions connected to different keystrokes.

```js
// abbreviation/abbreviationview.js

import {
	View,
	LabeledFieldView,
	createLabeledInputText,
	ButtonView,
	submitHandler,
	FocusTracker,
	KeystrokeHandler,
	icons,
	FocusCycler		// ADDED
} from 'ckeditor5';

export default class FormView extends View {
	constructor( locale ) {

		// Previous code from the constructor.
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
			// Setting the form template.
			// ...
		} );
	}

	// Previously declared methods.
	// ...
}
```

Now we can add the <kbd>Esc</kbd> button handler in our `_createFromView()` function, which will hide the UI and fire off `cancel` on the form.

```js
// abbreviation/abbreviationui.js

// Previously imported packages.
// ...

export default class AbbreviationUI extends Plugin {
	// Previously declared methods.
	// ...

	_createFormView() {
		// Form view initialization.
		// ...

		// Close the panel on esc key press when the form has focus.
		formView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideUI();
			cancel();
		} );

		return formView;
	}

	// Previously declared helper methods.
	// ...
}
```

We are done with improving accessibility for keyboard-only users. Try it out yourself by pressing <kbd>Tab</kbd>, <kbd>Shift</kbd> + <kbd>Tab</kbd>, and <kbd>Esc</kbd> in the form.

## Improving the UI functionalities

When the user selects a range (a letter, a word, or a whole document fragment) and presses the abbreviation button, they might expect that their selected text appears automatically in the abbreviation input field. Let's add this functionality to our form.

<info-box>
	As we will be working with user's selection in the document, it is important to understand what exactly does it mean in the editor's model. Read our introduction to {@link framework/architecture/editing-engine#positions-ranges-and-selections positions, ranges and selections} to expand your knowledge in the field.
</info-box>

To display the text from the user's selection in the form field, we need to first grab and concatenate all text from the selected range. If the user selects a couple of paragraphs, a heading, and an image, we need to go through all the nodes, and use only the ones containing text.

Let's create a helper `getRangeText()` function in a separate `/utils.js` file. It will grab all items from a range using its `getItems()` method. Then, it will concatenate all text from the {@link module:engine/model/text~Text `text`} and {@link module:engine/model/textproxy~TextProxy `textProxy`} nodes, and skip all the others.

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

Now, in `AbbreviationUI` we can adjust the `_showUI()` method to display the selected text in the abbreviation input field. We import `getRangeText` and pass the first range in the selection (using the `getFirstRange()` method) as an argument.

We will also disable the input field when the selection is not collapsed, because it would be hard to change the text of the abbreviation if the selection spans multiple paragraphs.

```js
// abbreviation/abbreviationui.js

// Previously imported packages.
// ...

import getRangeText from './utils.js';

export default class AbbreviationUI extends Plugin {
	// Previously declared methods.
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

	// Previously declared helper methods.
	// ...
}
```

Since we are disabling the first input field in some cases, let's update the `focus()` method in our form view accordingly.

```js
// abbreviation/abbreviationview.js

// Previously imported packages.
// ...

export default class FormView extends View {
	// Previously declared constructor and other methods.
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

	// Previously declared helper methods.
	// ...
}
```

Our new functionality should work now, check it out yourself! It does not recognize whether the selected text is an abbreviation already, so if you select "WYSIWYG," the full title does not yet appear in the title input field. We will change it in the next steps.

## Adding a command

Our plugin does what we want it to do, so why complicate things by adding a command? Well, a command not only executes an action but also automatically reacts when any changes are applied to the model.

<info-box>
	A command in CKEditor&nbsp;5 is a combination of an action and a state. The state of the command gets refreshed whenever anything changes in the model. We highly recommend {@link framework/architecture/core-editor-architecture#commands reading about commands} before moving on.
</info-box>

When the user makes a selection in the editor, the command will automatically check if there is an abbreviation there. It will also ensure that the command is only enabled where the "abbreviation" attribute can be set on the current model selection (not on images, for instance).

### Creating a command

Let's start by creating the command, and moving the existing action logic there.

In the `/abbreviationcommand.js` file, we import the `Command` class and create its instance.

We will start by simply moving there the action we already created for `submit` in our `_createFormView()` method, passing the title and the abbreviation text into the command's `execute()` method.

```js
// abbreviation/abbreviationcommand.js

import { Command } from 'ckeditor5';

export default class AbbreviationCommand extends Command {
	execute( { title, abbr } ) {
		const model = this.editor.model;

		model.change( writer => {
			model.insertContent(
				writer.createText( abbr, { abbreviation: title } )
			);
		} );

	}
}
```

Now, let's initialize our `AbbreviationCommand`, by adding it to the list of editor's commands in `AbbreviationEditing`. We will also pass a name there, that we will use to call our command.

```js
// abreviation/abbreviationediting.js

import { Plugin } from 'ckeditor5';
import AbbreviationCommand from './abbreviationcommand';	// ADDED

export default class AbbreviationEditing extends Plugin {
	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add(
			'addAbbreviation', new AbbreviationCommand( this.editor )
		);
	}

	// Previously declared methods.
	// ...
}
```

We can now replace the action called on `submit` with our new command, passing it into editor's `execute()` method, along with the abbreviation and title values.

```js
// abbreviation/abbreviationui.js

// Previously imported packages.
// ...

export default class AbbreviationUI extends Plugin {
	// Previously declared methods.
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

		// Handle clicking outside the balloon and on the "Cancel" button.
		// ...
	}

	// Previously declared helper methods.
	// ...
}
```

The command should now work, and pressing the <kbd>Submit</kbd> button should have the same effect as it did before. We can now explore some additional functionalities. You can check it out now in the CKEditor&nbsp;5 Inspector.

{@img assets/img/abbreviation-part3-1.png Screenshot of the CKEditor&nbsp;5 inspector showing the `addAbbreviation` command.}

### Refreshing the state

Thanks to the command's `refresh()` method, we can observe the state and the value of our command not just when the user presses the button, but whenever any changes are made in the editor. We will use this to check if the user's selection has an abbreviation model attribute already.

Before we do that, we may want to check if the command can be used at all on a given selection. If the user selects an image, the command should be disabled. Let's check if our `abbreviation` attribute is allowed in the schema, using its `checkAttributeInSelection()` method.

```js
// abbreviation/abbreviationcommand.js

import { Command } from 'ckeditor5';

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
		// The code runs after command execution.
		// ...
	}
}
```

We can now check if the selected range is collapsed. If so, we will check if the caret is in an abbreviation, and grab the entire range containing it. We can easily do so using the {@link module:typing/utils/findattributerange~findAttributeRange `findAttributeRange`} helper function. We need to pass it the first position of the selection, our attribute name and value, and the model.

Then, we change the value of the command. We will get the abbreviation text using our `getRangeText` helper function. We also add a range value, which we will use when executing the command.

```js
// abbreviation/abbreviationcommand.js

import { 
	Command,
	findAttributeRange						// ADDED
} from 'ckeditor5';
import getRangeText from './utils.js';		// ADDED

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

		// The code that enables the command.
		// ...
	}

	execute( { title, abbr } ) {
		// The code runs after command execution.
		// ...
	}
}
```

If the selection is not collapsed, we check if it has the `abbreviation` model attribute. If so, we will again grab the full range of the abbreviation and compare it with the user selection.

When the user selects a bit of text with the abbreviation attribute, along with a bit without it, we do not want to change the command's value. We will thus use the `containsRange()` method to see if the selected range is within the abbreviation range. The second parameter makes it a `loose` check, meaning the selected range can start, end, or be equal to the abbreviation range.

```js
// abbreviation/abbreviationcommand.js

// Previously imported packages.
//...

export default class AbbreviationCommand extends Command {
	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const firstRange = selection.getFirstRange();

		if ( firstRange.isCollapsed ) {
			// When the selection is collapsed, the command has a value
			// if the caret is in an abbreviation.
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

		// The code that enables the command.
		// ...
	}

	execute( { title, abbr } ) {
		// The code runs after command execution.
		// ...
	}
}
```

You can check the command and its current value in the inspector.

{@img assets/img/abbreviation-part3-2.png Screenshot of the CKEditor&nbsp;5 inspector showing the value of the `addAbbreviation` command.}

We can now check the command value when the user presses the toolbar abbreviation button, and insert both abbreviation text and title values into the form's input fields.

In the `AbbreviationUI` add a simple `if` statement to fill the form using either the value of the command, or the selected text (as we did before).

```js
// abbreviation/abbreviationui.js

// Previously imported packages.
// ...

export default class AbbreviationUI extends Plugin {
	// Previously declared methods.
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

	// Previously declared helper methods.
	// ...
}

```

### Improving the `execute()` method

We should now introduce more cases into our `execute()` method. For starters, if the user's selection is not collapsed, we just need to add the abbreviation attribute to their selection instead of inserting the abbreviation text into the model.

If the selection is not collapsed, we will gather all the ranges that are allowed to use the `abbreviation` model attribute, using the schema's `getValidRanges()` method. Then we will use the `setAttribute()`, to add the title value to each of the ranges.

If the selection is collapsed, we will keep our `insertContent()` model method from before. Then, we need to use `removeSelectionAttribute` method, to stop adding new content into the abbreviation if the user starts to type.

```js
// abbreviation/abbreviationcommand.js

// Previously imported packages.
// ...

export default class AbbreviationCommand extends Command {
	refresh() {
		// The code runs after the command refresh.
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
				// change the attribute on nodes inside those ranges
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

Now we can use the command's state to check whether the selection is inside an existing abbreviation. If the command's value is not `null`, we will grab the whole range, and update its text and title.

We will create a position at the end of the inserted abbreviation, and set a selection there. The {@link module:engine/model/model~Model#insertContent `insertContent()`} method returns a range, and we grab its end position to define our `positionAfter`.

```js
// abbreviation/abbreviationcommand.js

// Previously imported packages.
// ...

export default class AbbreviationCommand extends Command {
	refresh() {
		// The code runs after the command refresh.
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
				// When the selection has non-collapsed node ranges, change the attribute on nodes inside those ranges
				// omitting nodes where the "abbreviation" attribute is disallowed.
				// ...
			}
		} );
	}
}
```

If the collapsed selection is not inside an existing abbreviation, we will insert a text node with the "abbreviation" attribute in place of the caret.

The user might place the abbreviation inside a text, which already has some other model attributes, like "bold" or "italic." We should first collect them along with our abbreviation attribute, and use the whole list when inserting the abbreviation into the document. We will use our {@link module:utils/tomap~toMap `toMap`} helper function to collect all attributes.

```js
// abbreviation/abbreviationcommand.js

// More imports.
// ...
import { toMap } from 'ckeditor5';		// ADDED

export default class AbbreviationCommand extends Command {
	refresh() {
		// The code runs after the command refresh.
		// ...
	}

	execute( { abbr, title } ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			if ( selection.isCollapsed ) {
				if ( this.value ) {
					// When a collapsed selection is inside text
					// with the "abbreviation" attribute, update texts.
					// ...
				}
				// If the collapsed selection is not in an existing abbreviation,
				// insert a text node with the "abbreviation" attribute
				// in place of the caret.
				// If the abbreviation is empty, don't do anything.
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
				// When the selection has non-collapsed node ranges, change the attribute on nodes inside those ranges
				// omitting nodes where the "abbreviation" attribute is disallowed.
				// ...
			}
		} );
	}
}
```

The command is now done, check how it works by trying all our different cases - selection collapsed, not collapsed, inside an existing abbreviation, etc.

## Demo

See the result in action.

{@snippet tutorials/abbreviation-level-3}

## Final code

If you got lost at any point, this is [the final implementation of the plugin](https://github.com/ckeditor/ckeditor5-tutorials-examples/tree/main/abbreviation-plugin/part-3). You can paste the code from different files into your project, or clone and install the whole thing, and it will run out of the box.

<info-box>
	**What's next**

	That's it, you've finished the tutorial! You are now ready to create your own plugins. If you want to continue learning, move on to our more advanced tutorials, starting with the {@link tutorials/widgets/implementing-a-block-widget Implementing a block widget} guide.
</info-box>
