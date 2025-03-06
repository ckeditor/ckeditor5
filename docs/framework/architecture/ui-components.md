---
category: framework-architecture
meta-title: UI Components | CKEditor 5 Framework Documentation
order: 50
modified_at: 2024-01-03
---

# UI components

The CKEditor&nbsp;5 framework provides several UI components that can be helpful when developing a new user interface. All UI classes come with the {@link module:ui/view~View.set `set()`} method, which sets the properties of the components, such as labels, icons, placeholders, etc.

<info-box>
	This article lists all available components and their variants. If you want to understand the implementation details, check the {@link framework/architecture/ui-library UI library} guide.
</info-box>

## Balloon

{@snippet framework/ui/ui-balloon}

A balloon panel is a floating component that can appear depending on the context. It can be pinned to a specific position or added dynamically at the caret position. You can use it to display any UI within the editor. You can create a balloon panel as an instance of the {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView `BalloonPanelView`} class.

<code-switcher>
```js
import { BalloonPanelView, ButtonView } from 'ckeditor5';

const balloonButton = new ButtonView();
balloonButton.set( { label: 'Balloon button', withText: true } );
balloonButton.render();

const balloon = new BalloonPanelView();
balloon.render();
balloon.content.add( balloonButton );

const positions = BalloonPanelView.defaultPositions;
balloon.pin( {
	target: document.getElementById( 'balloon' ),
	positions: [ positions.southArrowNorth ]
} );

document.body.append( balloon.element );
```
</code-switcher>

Two positions describe the placement of the ballon. The first one describes the relationship between the element and the pinned balloon. The second one is the position of the balloon arrow. It creates many possible balloon positions:

* `northWestArrowSouthWest`
* `northWestArrowSouthMiddleWest`
* `northWestArrowSouth`
* `northWestArrowSouthMiddleEast`
* `northWestArrowSouthEast`
* `northArrowSouthWest`
* `northArrowSouthMiddleWest`
* `northArrowSouth`
* `northArrowSouthMiddleEast`
* `northArrowSouthEast`
* `northEastArrowSouthWest`
* `northEastArrowSouthMiddleWest`
* `northEastArrowSouth`
* `northEastArrowSouthMiddleEast`
* `northEastArrowSouthEast`
* `southWestArrowNorthWest`
* `southWestArrowNorthMiddleWest`
* `southWestArrowNorth`
* `southWestArrowNorthMiddleEast`
* `southWestArrowNorthEast`
* `southArrowNorthWest`
* `southArrowNorthMiddleWest`
* `southArrowNorth`
* `southArrowNorthMiddleEast`
* `southArrowNorthEast`
* `southEastArrowNorthWest`
* `southEastArrowNorthMiddleWest`
* `southEastArrowNorth`
* `southEastArrowNorthMiddleEast`
* `southEastArrowNorthEast`
* `viewportStickyNorth`

## Button

{@snippet framework/ui/ui-button}

There are two basic buttons in the CKEditor&nbsp;5 UI library: a standard button and a switch. You can instantiate the standard button with the {@link module:ui/button/buttonview~ButtonView `ButtonView`} class. By modifying the passed configuration, you can get different button variants and states. The {@link module:ui/button/buttonlabelview~ButtonLabelView `ButtonLabelView`} class is a default implementation of the button's label. It supports dynamic text via the {@link module:ui/button/buttonlabelview~ButtonLabelView#text `text`} property.

### Action

To get an action button, add the `ck-button-action` class.

<code-switcher>
```js
import { ButtonView } from 'ckeditor5';

const actionButton = new ButtonView();

actionButton.set( {
	label: 'Action button',
	withText: true,
	class: 'ck-button-action'
} );
actionButton.render();

document.getElementById( 'button-action' ).append( actionButton.element );
```
</code-switcher>

### Rounded

To get a rounded button, add the `ck-rounded-corners` class.

<code-switcher>
```js
import { ButtonView } from 'ckeditor5';

const roundedButton = new ButtonView();

roundedButton.set( {
	label: 'Rounded button',
	withText: true,
	class: 'ck-rounded-corners'
} );
roundedButton.render();

document.getElementById( 'button-rounded' ).append( roundedButton.element );
```
</code-switcher>

### Bold

To get a bold button, add the `ck-button-bold` class.

<code-switcher>
```js
import { ButtonView } from 'ckeditor5';

const boldButton = new ButtonView();

boldButton.set( {
	label: 'Bold button',
	withText: true,
	class: 'ck-button-bold'
} );
boldButton.render();

document.getElementById( 'button-bold' ).append( boldButton.element );
```
</code-switcher>

### Icon

To get a button with an icon, import it first. Then set the `icon` property on the button. You can also add a custom icon to the dropdown by {@link framework/architecture/ui-library#setting-label-icon-and-tooltip providing the entire XML string of the icon}. There are also classes you can use to style icons appropriately.

<code-switcher>
```js
import { ButtonView, IconCheck } from 'ckeditor5';

const saveButton = new ButtonView();

saveButton.set( {
	label: 'Save',
	withText: false,
	icon: IconCheck,
	class: 'ck-button-save'
} );
saveButton.render();

document.getElementById( 'button-icon' ).append( saveButton.element );
```
</code-switcher>

### Keystrokes

To get a button with a shortcut, add the `keystroke` property. To display the shortcut on the button, set the {@link module:ui/button/button~Button#withKeystroke `withKeystroke`} property to `true`. If you also add a label, it will display next to the shortcut. You do not need to worry about different shortcuts for different operating systems &ndash; the shortcut is relative to the OS. For example, macOS will display the <kbd>Ctrl</kbd>+<kbd>I</kbd> shortcut as </kbd>⌘</kbd>+<kbd>I</kbd>.

<code-switcher>
```js
import { ButtonView } from 'ckeditor5';

const keystrokeButton = new ButtonView();

keystrokeButton.set( {
	label: 'Italic',
	withText: true,
	withKeystroke: true,
	keystroke: 'Ctrl+I'
} );
keystrokeButton.render();

document.getElementById( 'button-keystroke' ).append( keystrokeButton.element );
```
</code-switcher>

### Tooltip

To get a button with a tooltip, add the `tooltip` property. You can use it to display additional information on button hover. If you set it to `true`, a label value is displayed.

<code-switcher>
```js
import { ButtonView } from 'ckeditor5';

const tooltipButton = new ButtonView();

tooltipButton.set( {
	label: 'Tooltip button',
	withText: true,
	tooltip: 'The content of the tooltip',
	tooltipPosition: 's'
} );
tooltipButton.render();

document.getElementById( 'button-tooltip' ).append( tooltipButton.element );
```
</code-switcher>

By default, the tooltip will appear to the south of the button. However, you can adjust its position with the {@link module:ui/tooltipmanager~TooltipPosition `tooltipPosition`} property. You can set the property to:

* `n` &ndash; North
* `w` &ndash; West
* `s` &ndash; South
* `e` &ndash; East
* `se` &ndash; South-east
* `sw` &ndash; South-west

A tooltip needs the {@link module:ui/tooltipmanager~TooltipManager `TooltipManager`} to work correctly. You need to add it during CKEditor creation.

```js
ClassicEditor
	.create( document.getElementById( 'ui-editor' ), {
		// Editor configuration.
		//
	} )
	.then( editor => {
		this.tooltipManager = new TooltipManager( editor );
	} )
	.catch( error => {
		// Error handling.
		//
	} );
```

### States

{@snippet framework/ui/ui-button-states}

There are properties you can set to get various button states.

#### Enabled

Buttons are enabled and clickable by default. You can also set the state explicitly by adding the {@link module:ui/button/button~Button#isEnabled `isEnabled`} property with a `true` value.

<code-switcher>
```js
import { ButtonView } from 'ckeditor5';

const enabledButton = new ButtonView();

enabledButton.set( {
	label: 'Enabled state',
	withText: true,
	isEnabled: true
} );
enabledButton.render();

document.getElementById( 'button-enabled' ).append( enabledButton.element );
```
</code-switcher>

#### Disabled

To disable a button, set the {@link module:ui/button/button~Button#isEnabled `isEnabled`} property to `false`.

<code-switcher>
```js
import { ButtonView } from 'ckeditor5';

const disabledButton = new ButtonView();

disabledButton.set( {
	label: 'Disabled state',
	withText: true,
	isEnabled: false
} );
disabledButton.render();

document.getElementById( 'button-disabled' ).append( disabledButton.element );
```
</code-switcher>

#### On

Some actions in the editor can constantly be active. To indicate them, you can set the {@link module:ui/button/button~Button#isOn `isOn`} property to `true`.

<code-switcher>
```js
import { ButtonView } from 'ckeditor5';

const onButton = new ButtonView();

onButton.set( { label: 'On state', withText: true, isOn: true } );
onButton.render();

document.getElementById( 'button-on' ).append( onButton.element );
```
</code-switcher>

## Switch

{@snippet framework/ui/ui-switch}

You need a different class to instantiate a switch button &ndash; {@link module:ui/button/switchbuttonview~SwitchButtonView `SwitchButtonView`}. To make it work properly, you also need to add an event listener with the {@link module:ui/button/switchbuttonview~SwitchButtonView#on `on()`} method. Every click triggers the flip of the {@link module:ui/button/switchbuttonview~SwitchButtonView#isOn `isOn`} property. It is responsible for turning the button on and off.

<code-switcher>
```js
import { SwitchButtonView } from 'ckeditor5';

const switchButton = new SwitchButtonView();

switchButton.set( {
	label: 'Switch button',
	withText: true,
	isOn: false
} );
switchButton.render();
switchButton.on( 'execute', () => { switchButton.isOn = !switchButton.isOn } );

document.getElementById( 'button-switch' ).append( switchButton.element );
```
</code-switcher>

## Dropdown

{@snippet framework/ui/ui-dropdown}

A dropdown consists of two elements: a button and a panel. The button expands the dropdown menu. The dropdown panel can hold any UI element.

You can use the {@link module:ui/dropdown/utils#createDropdown `createDropdown()`} helper method to create a dropdown. By default, it uses the {@link module:ui/dropdown/button/dropdownbuttonview~DropdownButtonView `DropdownButtonView`} class. You can replace it with the {@link module:ui/button/buttonview~ButtonView `ButtonView`} or {@link module:ui/dropdown/button/splitbuttonview~SplitButtonView `SplitButtonView`} class.

### List

Inside a dropdown, you can put a list. To do so, you can use the {@link module:ui/dropdown/utils#addListToDropdown `addListToDropdown()`} helper function. Also, you must add items to a collection before putting them inside the dropdown.

<code-switcher>
```js
import {
    addListToDropdown,
    Collection,
    createDropdown,
    Locale,
    ViewModel
} from 'ckeditor5';

const locale = new Locale();

const collection = new Collection();
collection.add( {
	type: 'button',
	model: new ViewModel( {
		label: 'Button',
		withText: true
	} )
} );
collection.add( {
	type: 'switchbutton',
	model: new ViewModel( {
		label: 'Switch button',
		withText: true
	} )
} );

const listDropdown = createDropdown( locale );
listDropdown.buttonView.set( {
	label: 'List dropdown',
	withText: true
} );
addListToDropdown( listDropdown, collection );
listDropdown.render();

document.getElementById( 'dropdown-list' ).append( listDropdown.element );
```
</code-switcher>

### Toolbar

You can use the {@link module:ui/dropdown/utils#addToolbarToDropdown `addToolbarToDropdown()`} helper function to add a toolbar to the dropdown. Inside the toolbar, you can put buttons.

<code-switcher>
```js
import {
	addToolbarToDropdown,
	ButtonView,
	createDropdown,
	Locale,
	IconBold,
	IconItalic
} from 'ckeditor5';

const locale = new Locale();

const bold = new ButtonView();
const italic = new ButtonView();

bold.set( { label: 'Bold', withText: false, icon: IconBold } );
italic.set( { label: 'Italic', withText: false, icon: IconItalic } );

const buttons = [ bold, italic ];

const toolbarDropdown = createDropdown( locale );
toolbarDropdown.buttonView.set( {
	label: 'Toolbar dropdown',
	withText: true
} );
addToolbarToDropdown( toolbarDropdown, buttons );
toolbarDropdown.render();

document.getElementById( 'toolbar-button' ).append( toolbarDropdown.element );
```
</code-switcher>

### Menu

Finally, you can add a multi-level menu to a dropdown. Use the {@link module:ui/dropdown/utils~addMenuToDropdown `addMenuToDropdown()`} helper function to simplify the process.

<code-switcher>
```js
import {
	addMenuToDropdown,
    createDropdown
} from 'ckeditor5';

const locale = new Locale(); // Can be `editor.locale`.
const body = new BodyCollection(); // Can be `editor.ui.view.body`.

const menuDropdown = createDropdown( locale );

// The menu items definitions.
const definition = [
	{
		id: 'menu_1',
		menu: 'Menu 1',
		children: [
			{
				id: 'menu_1_a',
				label: 'Item A'
			},
			{
				id: 'menu_1_b',
				label: 'Item B'
			}
		]
	},
	{
		id: 'top_a',
		label: 'Top Item A'
	},
	{
		id: 'top_b',
		label: 'Top Item B'
	}
];

addMenuToDropdown( menuDropdown, body, definition );

menuDropdown.render();

document.getElementById( 'menu-dropdown' ).append( menuDropdown.element );
```
</code-switcher>

### Split button

Besides the standard button, you can also use the split button for a dropdown. It has two clickable sections: one for the main action and a second for expanding the dropdown with more options.

<code-switcher>
```js
import {
	addToolbarToDropdown,
	ButtonView,
	createDropdown,
	SplitButtonViewm,
	Locale,
	IconBold,
	IconItalic
} from 'ckeditor5';

const locale = new Locale();

const bold = new ButtonView();
const italic = new ButtonView();

bold.set( { label: 'Bold', withText: false, icon: IconBold } );
italic.set( { label: 'Italic', withText: false, icon: IconItalic } );

const buttons = [ bold, italic ];

const splitButtonDropdown = createDropdown( locale, SplitButtonView );
addToolbarToDropdown( splitButtonDropdown, buttons);
splitButtonDropdown.buttonView.set ( {
	label: 'Split button dropdown',
	withText: true
} );
splitButtonDropdown.render();

document.getElementById( 'dropdown-split-button' ).append( buttonDropdown.element );
```
</code-switcher>

### States

{@snippet framework/ui/ui-dropdown-states}

Dropdowns use buttons. Because of that, states and properties remain the same.

#### Enabled

Buttons in dropdowns are enabled and clickable by default. You can also set the state explicitly by adding the {@link module:ui/dropdown/button/dropdownbutton~DropdownButton#isEnabled `isEnabled`} property with a `true` value.

<code-switcher>
```js
import { createDropdown, Locale } from 'ckeditor5';

const locale = new Locale();

const enabledDropdown = createDropdown( locale );
enabledDropdown.buttonView.set( {
	label: 'Enabled state',
	isEnabled: true,
	withText: true
} );
enabledDropdown.render();

document.getElementById( 'dropdown-enabled' ).append( enabledDropdown.element );
```
</code-switcher>

#### Disabled

To disable a button, set the {@link module:ui/dropdown/button/dropdownbutton~DropdownButton#isEnabled `isEnabled`} property to `false`. It prevents the dropdown from being expanded.

<code-switcher>
```js
import { createDropdown, Locale } from 'ckeditor5';

const locale = new Locale();

const disabledDropdown = createDropdown( locale );
disabledDropdown.buttonView.set( {
	label: 'Disabled state',
	isEnabled: false,
	withText: true
} );
disabledDropdown.render();

document.getElementById( 'dropdown-disabled' ).append( disabledDropdown.element );
```
</code-switcher>

## Dialog

{@snippet framework/ui/ui-dialog}

A dialog window is a draggable pop-up that you can display on top of the editor contents. It remains open when the user interacts with the editing area. You can use it to display any detached UI. Dialogs are brought by the {@link module:ui/dialog/dialog~Dialog `Dialog`} plugin.

<code-switcher>
```js
// Necessary imports. Remember to install the packages first.
import {
	ButtonView,
	Dialog,
	View,
	Plugin,
	ClassicEditor,
	Paragraph,
	Essentials,
	Bold,
	Italic
} from 'ckeditor5';

// Create a plugin that brings a button that toggles the visibility of a dialog window.
// Read more about creating the plugins here: https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/plugins.html.
class MinimalisticDialog extends Plugin {
	// Make sure the "Dialog" plugin is loaded.
	get requires() {
		return [ Dialog ];
	}

	init() {
		// Add a button to the component factory so it is available for the editor.
		this.editor.ui.componentFactory.add( 'showDialog', locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: 'Show a dialog',
				tooltip: true,
				withText: true
			} );

			// Define the button behavior on press.
			buttonView.on( 'execute', () => {
				const dialog = this.editor.plugins.get( 'Dialog' );

				// If the button is turned on, hide the dialog.
				if ( buttonView.isOn ) {
					dialog.hide();
					buttonView.isOn = false;

					return;
				}

				buttonView.isOn = true;

				// Otherwise, show the dialog.
				// Create a view with some simple content. It will be displayed as a dialog's body.
				const textView = new View( locale );

				textView.setTemplate( {
					tag: 'div',
					attributes: {
						style: {
							padding: 'var(--ck-spacing-large)',
							whiteSpace: 'initial',
							width: '100%',
							maxWidth: '500px'
						},
						tabindex: -1
					},
					children: [
						'This is the content of the dialog.',
						'You can put here text, images, inputs, buttons, etc.'
					]
				} );

				// Tell the plugin to display a dialog with the title, content, and one action button.
				dialog.show( {
					title: 'Dialog with text',
					content: textView,
					actionButtons: [
						{
							label: 'OK',
							class: 'ck-button-action',
							withText: true,
							onExecute: () => dialog.hide()
						}
					],
					onHide() { buttonView.isOn = false; }
				} );
			} );

			return buttonView;
		} );
	}
}

// Create an editor instance. Remember to have an element with the `[id="editor"]` attribute in the document.
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Essentials, Paragraph, Bold, Italic, MinimalisticDialog, Dialog ],
		toolbar: [ 'bold', 'italic', '|', 'showDialog' ]
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```
</code-switcher>

See the guide about the {@link framework/architecture/ui-library#dialogs-and-modals API of the dialog system}.

## Modal

{@snippet framework/ui/ui-modal}

Modal is a specific kind of dialog window. While open, it does not allow to interact with the editor content &ndash; it has to be closed first. You can use a modal to enforce the user interaction or interrupt them in some important situations.

To create a modal, use the optional {@link module:ui/dialog/dialog~DialogDefinition#isModal `isModal`} property of the {@link module:ui/dialog/dialog~Dialog#show `Dialog#show()`} method.

<code-switcher>
```js
// Necessary imports. Remember to install the packages first.
import {
	ButtonView,
	Dialog,
	View,
	Plugin,
	ClassicEditor,
	Paragraph,
	Essentials,
	Bold,
	Italic
} from 'ckeditor5';

// Create a plugin that brings a button which toggles the visibility of a modal window.
// Read more about creating the plugins here: https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/plugins.html.
class MinimalisticModal extends Plugin {
	// Make sure the "Dialog" plugin is loaded.
	get requires() {
		return [ Dialog ];
	}

	init() {
		// Add a button to the component factory so it is available for the editor.
		this.editor.ui.componentFactory.add( 'showModal', locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: 'Show a modal',
				tooltip: true,
				withText: true
			} );

			// Define the button behavior on press.
			buttonView.on( 'execute', () => {
				const dialog = this.editor.plugins.get( 'Dialog' );

				// If the button is turned on, hide the modal.
				if ( buttonView.isOn ) {
					dialog.hide();
					buttonView.isOn = false;

					return;
				}

				buttonView.isOn = true;

				// Otherwise, show the modal.
				// First, create a view with some simple content. It will be displayed as the dialog's body.
				const textView = new View( locale );

				textView.setTemplate( {
					tag: 'div',
					attributes: {
						style: {
							padding: 'var(--ck-spacing-large)',
							whiteSpace: 'initial',
							width: '100%',
							maxWidth: '500px'
						},
						tabindex: -1
					},
					children: [
						'This is a sample content of the modal.',
						'You can put here text, images, inputs, buttons, etc.'
					]
				} );

				// Tell the plugin to display a modal with the title, content, and one action button.
				dialog.show( {
					isModal: true,
					title: 'Modal with text',
					content: textView,
					actionButtons: [
						{
							label: 'OK',
							class: 'ck-button-action',
							withText: true,
							onExecute: () => dialog.hide()
						}
					],
					onHide() { buttonView.isOn = false; }
				} );
			} );

			return buttonView;
		} );
	}
}

// Create an editor instance. Remember to have an element with the `[id="editor"]` attribute in the document.
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Essentials, Paragraph, Bold, Italic, MinimalisticDialog, Dialog ],
		toolbar: [ 'bold', 'italic', '|', 'showModal' ]
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```
</code-switcher>

See the guide about the {@link framework/architecture/ui-library#dialogs-and-modals API of the dialog system}.

## Icons

{@snippet framework/ui/ui-icons}

The CKEditor&nbsp;5 library has a collection of icons representing different editor functionalities. Icons are SVG files and follow the style of the surrounding text. You can instantiate an icon with the {@link module:ui/icon/iconview~IconView `IconView`} class. The {@link module:ui/icon/iconview~IconView#content `content`} property stores the SVG source of the icon.

<code-switcher>
```js
import { IconView, IconBold } from 'ckeditor5';

const icon = new IconView();

icon.content = IconBold;
icon.render();

document.getElementById( 'icon-bold' ).append( icon.element );
```
</code-switcher>

CKEditor&nbsp;5 features use different icons. You can find them in the `@ckeditor/ckeditor5-icons` package.

You can also {@link framework/architecture/ui-library#setting-label-icon-and-tooltip add a custom icon to the dropdown} by providing the entire XML string of the icon

## Input

{@snippet framework/ui/ui-input}

The CKEditor&nbsp;5 UI library contains some input elements. Usually, they are used in dropdowns and balloon panels, but you can also use them in the main toolbar.

To create them, use the {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView `LabeledFieldView`} class, which takes two parameters:

* An instance of the {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#locale `locale`} class.
* A helper function, depending on the type of field you want to create.

### Text

To create a text field, pass the {@link module:ui/labeledfield/utils#createLabeledInputText `createLabeledInputText()`} helper function as the second parameter to the {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView `LabeledFieldView`} class.

<code-switcher>
```js
import { createLabeledInputText, LabeledFieldView, Locale } from 'ckeditor5';

const locale = new Locale();

const textInput = new LabeledFieldView( locale, createLabeledInputText );
textInput.set( { label: 'Text input', value: 'Value of the input' } );
textInput.render();

document.getElementById( 'input-text' ).append( textInput.element );
```
</code-switcher>

### Number

To create a number field, pass the {@link module:ui/labeledfield/utils#createLabeledInputNumber `createLabeledInputNumber()`} helper function as the second parameter to the {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView `LabeledFieldView`} class.

<code-switcher>
```js
import { createLabeledInputNumber, LabeledFieldView, Locale } from 'ckeditor5';

const locale = new Locale();

const numberInput = new LabeledFieldView( locale, createLabeledInputNumber );
numberInput.set( { label: 'Number input', value: 'Value of the input' } );
numberInput.render();

document.getElementById( 'input-number' ).append( numberInput.element );
```
</code-switcher>

### States

{@snippet framework/ui/ui-input-states}

Similarly to buttons, inputs can be enabled or disabled. The property names remain the same.

#### Enabled

Inputs are enabled by default. You can also set the state explicitly by adding the {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#isEnabled `isEnabled`} property with a `true` value.

<code-switcher>
```js
import { createLabeledInputText, LabeledFieldView, Locale } from 'ckeditor5';

const locale = new Locale();

const enabledInput = new LabeledFieldView( locale, createLabeledInputText );
enabledInput.set( { label: 'Enabled state', isEnabled: true } );
enabledInput.render();

document.getElementById( 'input-enabled' ).append( enabledInput.element );
```
</code-switcher>

#### Disabled

To disable an input, set the {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#isEnabled `isEnabled`} property to `false`. It prevents the input from getting users' data.

<code-switcher>
```js
import { createLabeledInputText, LabeledFieldView, Locale } from 'ckeditor5';

const locale = new Locale();

const disabledInput = new LabeledFieldView( locale, createLabeledInputText );
disabledInput.set( { label: 'Disabled state', isEnabled: false } );
disabledInput.render();

document.getElementById( 'input-disabled' ).append( disabledInput.element );
```
</code-switcher>

## Search

{@snippet framework/ui/ui-search}

A search component allows you to filter a list of items based on a specified query. It consists of several components and interfaces:

* To create it, use the main {@link module:ui/search/text/searchtextview~SearchTextView `SearchTextView`} class.
* The {@link module:ui/search/text/searchtextview~SearchTextView#queryView `queryView`} property allows the user to enter the search query.
* The {@link module:ui/search/text/searchtextview~SearchTextView#infoView `infoView`} property displays additional information about the search results.
* The {@link module:ui/search/text/searchtextview~SearchTextView#filteredView `filteredView`} is a view filtered by the search query. Remember to specify the {@link module:ui/search/filteredview~FilteredView#filter `filter()`} and {@link module:ui/search/filteredview~FilteredView#focus `focus()`} methods for this view.

Some sub-components and classes that can help with better presentation of the results:

* The {@link module:ui/search/searchresultsview~SearchResultsView `SearchResultsView`} component hosts the filtered and the information views. It is a sub-component of the {@link module:ui/search/text/searchtextview~SearchTextView `SearchTextView`}.
* The {@link module:ui/autocomplete/autocompleteview~AutocompleteView `AutocompleteView`} component lists proposed results when the user starts typing and hides them when it is out of focus. It extends the {@link module:ui/search/text/searchtextview~SearchTextView `SearchTextView`} class.
* To group list items, you can use the {@link module:ui/list/listitemgroupview~ListItemGroupView `ListItemGroupView`} class.
* To highlight some results (or some text in general), you can use the {@link module:ui/highlightedtext/highlightedtextview~HighlightedTextView `HighlightedTextView`} class.

<code-switcher>
```js
import { ListView, SearchTextView, Locale } from 'ckeditor5';

const locale = new Locale();

const filteredView = new ListView();
filteredView.filter = () => {
	return {
		resultsCount: 1,
		totalItemsCount: 5
	};
};

const searchView = new SearchTextView( locale, {
	filteredView,
	queryView: {
		label: 'Label'
	}
} );

searchView.render();

document.querySelector( '.ui-search' ).append( searchView.element );
```
</code-switcher>

Check out the {@link features/ai-assistant-overview#demo AI Assistant} feature to see how all the UI pieces work together in a more complex setup.

## Spinner

{@snippet framework/ui/ui-spinner}

You can use a spinner to indicate some loading process. There is only one essential property here &ndash; {@link module:ui/spinner/spinnerview~SpinnerView#isVisible `isVisible`}. As the name suggests, it controls whether the component is visible. The default is `false`.

<code-switcher>
```js
import { SpinnerView } from 'ckeditor5';

const spinner = new SpinnerView();

spinner.set( { isVisible: true } );
spinner.render();

document.querySelector( '.ui-spinner' ).append( spinner.element );
```
</code-switcher>

## Textarea

{@snippet framework/ui/ui-textarea}

The textarea is a component for inserting long blocks of text. You can specify the visible height of the component using the {@link module:ui/textarea/textareaview~TextareaView#minRows `minRows`} property. Specify the {@link module:ui/textarea/textareaview~TextareaView#minRows `maxRows`} property if you do not want the component to exceed a certain height. Textarea dimensions do not need to be fixed, and you can allow users to change them with the {@link module:ui/textarea/textareaview~TextareaView#resize `resize`} option. By default, the property is set to `'none'`, and resizing is not allowed.

<code-switcher>
```js
import { TextareaView } from 'ckeditor5';

const textarea = new TextareaView();

textarea.set( {
	minRows: 4,
	maxRows: 10,
	resize: 'horizontal'
} );
textarea.render();

document.querySelector( '.ui-textarea' ).append( textarea.element );
```
</code-switcher>

## Toolbar

A toolbar is a base for other components. Usually, you would put other UI elements inside it. It can also be nested inside a balloon or dropdown. You can use the {@link module:ui/toolbar/toolbarview~ToolbarView `ToolbarView`} class to instantiate a toolbar.

### Text

{@snippet framework/ui/ui-toolbar-text}

You can put different UI elements inside a toolbar. A simple text node is one example. You can use the {@link module:ui/toolbar/toolbarview~ToolbarView#items `items`} property to add a component to a toolbar.

<code-switcher>
```js
import { ToolbarView, View,	Locale } from 'ckeditor5';

const locale = new Locale();

const text = new View();
text.element = document.createTextNode( 'Toolbar text' );

const toolbarText = new ToolbarView( locale );
toolbarText.items.add( text );
toolbarText.render();

document.getElementById( 'toolbar-text' ).append( toolbarText.element );
```
</code-switcher>

### Button

{@snippet framework/ui/ui-toolbar-button}

You can place any previously listed button inside a toolbar.

<code-switcher>
```js
import { ButtonView, ToolbarView, Locale } from 'ckeditor5';

const locale = new Locale();

const button = new ButtonView();
button.set( { label: 'Button', withText: true } );

const toolbarButton = new ToolbarView( locale );
toolbarButton.items.add( button );
toolbarButton.render();

document.getElementById( 'toolbar-button' ).append( toolbarButton.element );
```
</code-switcher>

### Wrap

{@snippet framework/ui/ui-toolbar-wrap}

A toolbar automatically wraps if you add more items and the space is limited.

<code-switcher>
```js
import { ButtonView, ToolbarView, Locale } from 'ckeditor5';

const locale = new Locale();

function createButton() {
	const button = new ButtonView();
	button.set( { label: 'Button', withText: true } );
	return button;
}

const buttons = [ createButton(), createButton(), createButton() ];

const toolbarWrap = new ToolbarView( locale );
buttons.forEach( button => toolbarWrap.items.add( button ) );
toolbarWrap.render();
toolbarWrap.element.style.width = '150px';

document.getElementById( 'toolbar-wrap' ).append( toolbarWrap.element );
```
</code-switcher>

### Separator

{@snippet framework/ui/ui-toolbar-separator}

You can divide toolbar elements with a separator to create logically connected groups. To instantiate a separator, use the {@link module:ui/toolbar/toolbarseparatorview~ToolbarSeparatorView `ToolbarSeparatorView`} class. Adding the created instance between desired components will separate them visually.

<code-switcher>
```js
import { ButtonView, ToolbarSeparatorView, ToolbarView,	Locale } from 'ckeditor5';

const locale = new Locale();

function createButton() {
	const button = new ButtonView();
	button.set( { label: 'Button', withText: true } );
	return button;
}

const separator = new ToolbarSeparatorView();

const items = [ createButton(), separator, createButton() ];

const toolbarSeparator = new ToolbarView( locale );
items.forEach( item => toolbarSeparator.items.add( item ) );
toolbarSeparator.render();

document.getElementById( 'toolbar-separator' ).append( toolbarSeparator.element );
```
</code-switcher>

### Multi-row

{@snippet framework/ui/ui-toolbar-multirow}

By default, a toolbar has one row. However, it can span into multiple rows. You can instantiate a line break with the {@link module:ui/toolbar/toolbarlinebreakview~ToolbarLineBreakView `ToolbarLineBreakView`} class. Adding the created instance after a desired component will place the following UI elements into the next row.

<code-switcher>
```js
import { ButtonView, ToolbarLineBreakView, ToolbarView, Locale } from 'ckeditor5';

const locale = new Locale();

function createButton() {
	const button = new ButtonView();
	button.set( { label: 'Button', withText: true } );
	return button;
}

const newLine = new ToolbarLineBreakView( locale );

const items = [ createButton(), newLine, createButton() ];

const toolbarMultiRow = new ToolbarView( locale );
items.forEach( item => toolbarMultiRow.items.add( item ) );
toolbarMultiRow.render();

document.getElementById( 'toolbar-multirow' ).append( toolbarMultiRow.element );
```
</code-switcher>

### Compact

{@snippet framework/ui/ui-toolbar-compact}

There is also a smaller version of a toolbar. To get a compact toolbar, set the {@link module:ui/toolbar/toolbarview~ToolbarView#isCompact `isCompact`} property to `true`.

<code-switcher>
```js
import { ButtonView, ToolbarView, Locale } from 'ckeditor5';

const locale = new Locale();

const button = new ButtonView();
button.set( { label: 'Button', withText: true } );

const toolbarCompact = new ToolbarView( locale );
toolbarCompact.isCompact = true;
toolbarCompact.items.add( button );
toolbarCompact.render();

document.getElementById( 'toolbar-compact' ).append( toolbarCompact.element );
```
</code-switcher>
