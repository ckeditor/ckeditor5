---
category: framework-architecture
order: 46
---

# UI components

The CKEditor 5 framework provides a number of common UI components that can be helpful when developing a new user interface.

All UI classes come with `set()` method, which sets the properties of the components, such as labels, icons, placeholders, etc.

## Buttons

There are two basic buttons in CKEditor 5 UI library - a button and a switch button.

{@snippet framework/ui/ui-buttons}

### Basic button

Button is implemented with the {@link module:ui/button/buttonview~ButtonView `ButtonView`} class.

```js
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

const button = new ButtonView();

button.set( {
	label: 'A button',
	withText: true
} );

button.render();
document.body.appendChild( button.element );
```
### Switch button

Switch button is implemented with the {@link module:ui/button/switchbuttonview~SwitchButtonView `SwitchButtonView`} class.

```js
import SwitchButtonView from '@ckeditor/ckeditor5-ui/src/button/switchbuttonview';

const switchButton = new SwitchButtonView();

switchButton.set( {
	label: 'A switch button',
	withText: true
} );

switchButton.render();
document.body.append( switchButton.element );
```
### Button options

{@snippet framework/ui/ui-buttons-options}

There are several ways you can adjust the button by using the CKEditor 5 CSS classes, for instance:
* `ck-button-action` class for an action button;
* `ck-button-bold` for a bold button;
* `ck-rounded-corner` for a button with rounded corners.

You can disable the button by setting its `isEnabled` property to false, or set `isOn` to true to make it look pressed.

You can further customize the button's style by changing its rendered element's style. You can also customize its label by changing the `labelStyle` property.

```js
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

const button = new ButtonView();

button.set( {
	label: 'Button',
	withText: true,

	// Action button:
	// class: 'ck-button-action',

	// Bold button:
	// class: 'ck-button-bold',

	// Button with rounded corners:
	// class: 'ck-rounded-corners',

	// Disabled button:
	// isEnabled: false,

	// Pressed button:
	// isOn: true,

	// Button with custom label styles:
	// labelStyle: 'color: white; font-family: "Lato", sans-serif;'
} );

button.render();

// Adding custom styles:
// customButton.element.style = 'background-color: darkred';

document.body.append( button.element );
```
### Icons and keystrokes

{@snippet framework/ui/ui-buttons-icons}

Buttons can have icons on their labels, as well as dedicated keystrokes, which can be set using the `keystroke` property, and setting `withKeystroke` to true.

```js
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

const button = new ButtonView();

button.set( {
	label: 'Button',
	withText: true,

	// Button with a keystroke:
	// withKeystroke: true,
	// keystroke: 'Ctrl+A',

	// Button with an icon:
	// icon: checkIcon,
	// icon: cancelIcon

	// Additional classes for the 'save' and 'cancel' buttons:
	// class: 'ck-button-save',
	// class: 'ck-button-cancel'

} );

button.render();
document.body.append( button.element );
```
### Tooltips

{@snippet framework/ui/ui-buttons-tooltip}

Buttons can have tooltips, which can be set using the `tooltip` property.

Tooltip position is set to the south of the button by default. It can be changed with the `tooltipPosition` property.

```js
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

const button = new ButtonView();

button.set( {
	label: 'Button with a tooltip',
	withText: true,
	tooltip: 'The content of the tooltip'

	// Tooltip positions:
	// tooltipPosition: 'n',
	// tooltipPosition: 'w'
	// tooltipPosition: 'e'
	// tooltipPosition: 'se'
	// tooltipPosition: 'sw'
} );

button.render();
document.body.append( button.element );
```

## Dropdowns

Dropdown, made of a button and a dropdown panel, is a common, yet versatile component from the CKEditor 5 UI library.

{@snippet framework/ui/ui-dropdowns}

Dropdowns can be created using the {@link module:ui/dropdown/utils~createDropdown `createDropdown`} helper function. They have a dedicated {@link module:ui/dropdown/button/dropdownbuttonview~DropdownButtonView dropdown button}, which is added by default when using `createDropdown`. The button can be replaced with an instance of the `ButtonView` class or the {@link module:ui/dropdown/button/splitbuttonview~SplitButtonView `SplitButtonView`} class.

The dropdown component can host any sort of UI in its panel. The most common views displayed in the dropdown panel are:
* {@link module:ui/toolbar/toolbarview~ToolbarView}
* {@link module:ui/list/listview~ListView}

### Toolbar dropdown

Toolbar can be added to a dropdown with the help of {@link module:ui/dropdown/utils~addToolbarToDropdown `addToolbarToDropdown`} function.

```js
import { createDropdown, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

const locale = new Locale();

const buttons = [ button1, button2, button3 ];
const dropdownToolbar = createDropdown( locale );

dropdownToolbar.buttonView.set( {
	label: 'Toolbar dropdown',
	withText: true
} );

addToolbarToDropdown( dropdownToolbar, buttons );

dropdownToolbar.render();
document.body.appendChild( dropdownToolbar.element );
```
### List dropdown

List can be added to a dropdown with the help of and {@link module:ui/dropdown/utils~addListToDropdown `addListToDropdown`} function.

Items in the list dropdown need to be added as a {@link module:utils/collection~Collection collection}.

```js
import {
	createDropdown,
	addListToDropdown,
	Model,
	SplitButtonView
} from '@ckeditor/ckeditor5-ui';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

const locale = new Locale();
const items = new Collection();

items.add( {
	type: 'button',
	model: new Model( {
		withText: true,
		label: 'First item',
	} )
} );

items.add( {
	type: 'button',
	model: new Model( {
		withText: true,
		label: 'Second item',
	} )
} );

const dropdownList = createDropdown( locale, SplitButtonView );

dropdownList.buttonView.set( {
	label: 'List dropdown',
	withText: true
} );

addListToDropdown( dropdownList, items );

dropdownList.render();
document.body.appendChild( dropdownList.element );
```
## Input

CKEditor 5 UI library offers labeled input fields, which are most often used in balloon panels.

{@snippet framework/ui/ui-input}

Labeled input fields can be created as an instance of the {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView `LabeledFieldView`}, with either {@link module:ui/labelfield/utils~createLabeledInputText `createLabeledInputText`} or {@link module:ui/labelfield/utils~createLabeledInputNumber `createLabeledInputNumber`} helpers passed as the second parameter.

### Labeled input text

```js
import { LabeledFieldView, createLabeledInputText } from '@ckeditor/ckeditor5-ui';

const labeledInputText = new LabeledFieldView( locale, createLabeledInputText );

labeledInputText.value = 'Value of the input';
labeledInputText.label = 'Input text field';

labeledInputText.render();
document.body.appendChild( labeledInputText.element );
```
### Labeled input number

```js
import { LabeledFieldView, createLabeledInputNumber } from '@ckeditor/ckeditor5-ui';

const labeledInputNumber = new LabeledFieldView( locale, createLabeledInputNumber );

labeledInputNumber.value = 'Value of the input';
labeledInputNumber.label = 'Input number field';

labeledInputNumber.render();
document.body.appendChild( labeledInputNumber.element );
```

### Input options

{@snippet framework/ui/ui-input-options}

Input fields can be disabled by changing the `isEnabled` property to false.

There is also an option to add info text or error text beneath the input field.

```js
import { LabeledFieldView, createLabeledInputText } from '@ckeditor/ckeditor5-ui';

const labeledInputText = new LabeledFieldView( locale, createLabeledInputText );

labeledInputText.label = 'Input text field';

// Disabled input field:
// labeledInputText.isEnabled = false;

// Info text:
// labeledInputText.infoText = 'Info text goes here.';

// Error text:
// labeledInputText.errorText = 'Error text goes here.';

labeledInputText.render();
document.body.appendChild( labeledInputText.element );
```

## Toolbars

Toolbars are one of the essential components of the CKEditor 5 UI library, as they are used in all editor builds. They also can be displayed in dropdown or balloon panels.

{@snippet framework/ui/ui-toolbar}

Toolbar can be created as an instance of the {@link module:ui/toolbar/toolbarview~ToolbarView `ToolbarView`} class. Its `items` property stores the children views.

```js
import { ToolbarView } from '@ckeditor/ckeditor5-ui';

const buttons = [ button1, button2, button3 ];
const toolbar = new ToolbarView();

buttons.forEach( child => toolbar.items.add( child ) );

toolbar.render();
document.body.appendChild( toolbar.element );
```

### Toolbar options

{@snippet framework/ui/ui-toolbars-options}

{@link module:ui/toolbar/toolbarseparatorview~ToolbarSeparatorView `ToolbarSeparatorView`} adds a vertical line between items in a toolbar, while {@link module:ui/toolbar/toolbarlinebreakview~ToolbarLineBreakView `ToolbarLineBreakView`} adds a new line. Toolbars have a `isCompact` property, which takes away margins of the toolbar items when set to true.

Additional styles can be added to the toolbar element, like a specific width to create a wrapped toolbar.
```js
import { ToolbarView, ToolbarSeparatorView } from '@ckeditor/ckeditor5-ui';
import ToolbarLineBreakView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarlinebreakview';

// Toolbar separator and line break:
const toolbarSeparator = new ToolbarSeparatorView();
const toolbarLineBreak = new ToolbarLineBreakView();

const children = [ button1, toolbarSeparator, button2, toolbarLineBreak, button3 ];
const toolbar = new ToolbarView();

children.forEach( child => toolbar.items.add( child ) );

// Compact toolbar:
// toolbar.isCompact = true;

// Wrapped toolbar:
// toolbar.element.style.width = '150px';

toolbar.render();
document.body.appendChild( toolbar.element );
```

## Balloon panel

Balloon panels are great for displaying any sort of UI within the editor. They're especially useful for more complex UI solutions, such as forms with input fields and buttons.

{@snippet framework/ui/ui-balloon}

Balloon panel can be created as an instance of the {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView} class. Balloon can be pinned to a specific position or added dynamically at the caret position.

```js
import { BalloonPanelView } from '@ckeditor/ckeditor5-ui';

const balloon = new BalloonPanelView();

balloon.render();
balloon.content.add( button );

const positions = BalloonPanelView.defaultPositions;

balloon.pin( {
	target: document.getElementById( 'balloon' ),
	positions: [
		positions.southArrowNorth
	]
} );
document.getElementById( 'balloon' ).append( balloon.element );
```
### Balloon positions

Balloon positions are described by first the position of the balloon in relation to the element it's pinned to, then by the arrow position in relation to the balloon.

<details>
<summary>List of possible balloon positions.
</summary>

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
</details>

## Icons

The CKEditor 5 library has a sizable collection of icons representing different editor functionalities. Icons are SVG files and follow the style of surrounding text.

{@snippet framework/ui/ui-icon}

Icons can be implemented with the {@link module:ui/icon/iconview~IconView} class. The `content` property stores the SVG source of the icon.

```js
import image from '@ckeditor/ckeditor5-core/theme/icons/image.svg';

const icon = new IconView();
icon.content = image;

icon.render();
document.body.appendChild( icon.element );
```

### All icons

{@snippet framework/ui/ui-icons}

Icons are used in different features of the CKEditor 5 and stored in their respective packages.

<details>
<summary>List of imports for all available icons, as shown above.
</summary>

```js
import bold from '@ckeditor/ckeditor5-basic-styles/theme/icons/bold.svg';
import italic from '@ckeditor/ckeditor5-basic-styles/theme/icons/italic.svg';
import underline from '@ckeditor/ckeditor5-basic-styles/theme/icons/underline.svg';
import code from '@ckeditor/ckeditor5-basic-styles/theme/icons/code.svg';
import strikethrough from '@ckeditor/ckeditor5-basic-styles/theme/icons/strikethrough.svg';
import subscript from '@ckeditor/ckeditor5-basic-styles/theme/icons/subscript.svg';
import superscript from '@ckeditor/ckeditor5-basic-styles/theme/icons/superscript.svg';

import browseFiles from '@ckeditor/ckeditor5-ckfinder/theme/icons/browse-files.svg';

import codeBlock from '@ckeditor/ckeditor5-code-block/theme/icons/codeblock.svg';

import cancel from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';
import caption from '@ckeditor/ckeditor5-core/theme/icons/caption.svg';
import check from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cog from '@ckeditor/ckeditor5-core/theme/icons/cog.svg';
import eraser from '@ckeditor/ckeditor5-core/theme/icons/eraser.svg';
import lowVision from '@ckeditor/ckeditor5-core/theme/icons/lowVision.svg';
import image from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import alignBottom from '@ckeditor/ckeditor5-core/theme/icons/alignBottom.svg';
import alignMiddle from '@ckeditor/ckeditor5-core/theme/icons/alignMiddle.svg';
import alignTop from '@ckeditor/ckeditor5-core/theme/icons/alignTop.svg';
import alignLeft from '@ckeditor/ckeditor5-core/theme/icons/alignLeft.svg';
import alignCenter from '@ckeditor/ckeditor5-core/theme/icons/alignCenter.svg';
import alignRight from '@ckeditor/ckeditor5-core/theme/icons/alignRight.svg';
import alignJustify from '@ckeditor/ckeditor5-core/theme/icons/alignJustify.svg';
import objectLeft from '@ckeditor/ckeditor5-core/theme/icons/objectLeft.svg';
import objectCenter from '@ckeditor/ckeditor5-core/theme/icons/objectCenter.svg';
import objectRight from '@ckeditor/ckeditor5-core/theme/icons/objectRight.svg';
import objectFullWidth from '@ckeditor/ckeditor5-core/theme/icons/objectFullWidth.svg';
import objectInline from '@ckeditor/ckeditor5-core/theme/icons/objectInline.svg';
import objectBlockLeft from '@ckeditor/ckeditor5-core/theme/icons/objectBlockLeft.svg';
import objectBlockRight from '@ckeditor/ckeditor5-core/theme/icons/objectBlockRight.svg';
import objectSizeFull from '@ckeditor/ckeditor5-core/theme/icons/objectSizeFull.svg';
import objectSizeLarge from '@ckeditor/ckeditor5-core/theme/icons/objectSizeLarge.svg';
import objectSizeSmall from '@ckeditor/ckeditor5-core/theme/icons/objectSizeSmall.svg';
import objectSizeMedium from '@ckeditor/ckeditor5-core/theme/icons/objectSizeMedium.svg';
import pencil from '@ckeditor/ckeditor5-core/theme/icons/pencil.svg';
import pilcrow from '@ckeditor/ckeditor5-core/theme/icons/pilcrow.svg';
import quote from '@ckeditor/ckeditor5-core/theme/icons/quote.svg';
import threeVerticalDots from '@ckeditor/ckeditor5-core/theme/icons/threeVerticalDots.svg';

import fontFamily from '@ckeditor/ckeditor5-font/theme/icons/font-family.svg';
import fontSize from '@ckeditor/ckeditor5-font/theme/icons/font-size.svg';
import fontColor from '@ckeditor/ckeditor5-font/theme/icons/font-color.svg';
import fontBackground from '@ckeditor/ckeditor5-font/theme/icons/font-background.svg';

import heading1 from '@ckeditor/ckeditor5-heading/theme/icons/heading1.svg';
import heading2 from '@ckeditor/ckeditor5-heading/theme/icons/heading2.svg';
import heading3 from '@ckeditor/ckeditor5-heading/theme/icons/heading3.svg';
import heading4 from '@ckeditor/ckeditor5-heading/theme/icons/heading4.svg';
import heading5 from '@ckeditor/ckeditor5-heading/theme/icons/heading5.svg';
import heading6 from '@ckeditor/ckeditor5-heading/theme/icons/heading6.svg';

import indent from '@ckeditor/ckeditor5-indent/theme/icons/indent.svg';
import outdent from '@ckeditor/ckeditor5-indent/theme/icons/outdent.svg';

import marker from '@ckeditor/ckeditor5-highlight/theme/icons/marker.svg';
import pen from '@ckeditor/ckeditor5-highlight/theme/icons/pen.svg';

import html from '@ckeditor/ckeditor5-html-embed/theme/icons/html.svg';

import link from '@ckeditor/ckeditor5-link/theme/icons/link.svg';
import unlink from '@ckeditor/ckeditor5-link/theme/icons/unlink.svg';

import bulletedList from '@ckeditor/ckeditor5-list/theme/icons/bulletedlist.svg';
import numberedList from '@ckeditor/ckeditor5-list/theme/icons/numberedlist.svg';
import todoList from '@ckeditor/ckeditor5-list/theme/icons/todolist.svg';

import media from '@ckeditor/ckeditor5-media-embed/theme/icons/media.svg';

import pageBreak from '@ckeditor/ckeditor5-page-break/theme/icons/pagebreak.svg';

import paragraph from '@ckeditor/ckeditor5-paragraph/theme/icons/paragraph.svg';

import removeFormat from '@ckeditor/ckeditor5-remove-format/theme/icons/remove-format.svg';

import contentLock from '@ckeditor/ckeditor5-restricted-editing/theme/icons/contentlock.svg';
import contentUnlock from '@ckeditor/ckeditor5-restricted-editing/theme/icons/contentunlock.svg';

import selectAll from '@ckeditor/ckeditor5-select-all/theme/icons/select-all.svg';

import sourceEditing from '@ckeditor/ckeditor5-source-editing/theme/icons/source-editing.svg';

import specialCharacters from '@ckeditor/ckeditor5-special-characters/theme/icons/specialcharacters.svg';

import table from '@ckeditor/ckeditor5-table/theme/icons/table.svg';
import tableRow from '@ckeditor/ckeditor5-table/theme/icons/table-row.svg';
import tableColumn from '@ckeditor/ckeditor5-table/theme/icons/table-column.svg';
import tableMergeCell from '@ckeditor/ckeditor5-table/theme/icons/table-merge-cell.svg';
import tableCellProperties from '@ckeditor/ckeditor5-table/theme/icons/table-cell-properties.svg';
import tableProperties from '@ckeditor/ckeditor5-table/theme/icons/table-properties.svg';

import nextArrow from '@ckeditor/ckeditor5-ui/theme/icons/next-arrow.svg';
import previousArrow from '@ckeditor/ckeditor5-ui/theme/icons/previous-arrow.svg';

import undo from '@ckeditor/ckeditor5-undo/theme/icons/undo.svg';
import redo from '@ckeditor/ckeditor5-undo/theme/icons/redo.svg';

import loupe from '@ckeditor/ckeditor5-find-and-replace/theme/icons/find-replace.svg';
```
</details>

### Using custom icons

The easiest way to implement custom icons is to use webpack's [`NormalModuleReplacementPlugin`](https://webpack.js.org/plugins/normal-module-replacement-plugin/) plugin. For example, to replace the bold icon use the following code in your `webpack.config.js`:

```js
...
plugins: [
	new webpack.NormalModuleReplacementPlugin(
		/bold\.svg/,
		'/absolute/path/to/my/icon.svg'
	)
]
```

You can also use the relative path which is resolved relative to the resource that imports `bold.svg` (the {@link module:basic-styles/bold/boldui~BoldUI `BoldUI`} class file in this scenario).

Learn more about {@link installation/advanced/integrating-from-source#webpack-configuration building CKEditor 5 using webpack}.
