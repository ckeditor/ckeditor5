---
category: framework-architecture
order: 50
modified_at: 2023-03-06
---

# UI components

The CKEditor 5 framework provides several UI components that can be helpful when developing a new user interface. All UI classes come with the `set()` method, which sets the properties of the components, such as labels, icons, placeholders, etc.

<info-box>
    This article lists all available components and their variants. If you want to understand the implementation details check {@link framework/architecture/ui-library the UI library guide}.
</info-box>

## Balloon

{@snippet framework/ui/ui-balloon}

A balloon panel is a floating component that can appear depending on the context. It can be pinned to a specific position or added dynamically at the caret position. You can use it to display any UI within the editor. You can create a balloon panel as an instance of the `BalloonPanelView` class.

```js
import { BalloonPanelView, ButtonView } from '@ckeditor/ckeditor5-ui';

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

document.getElementById( 'balloon' ).append( balloon.element );
```

Two positions describe the placement of the ballon. The first one describes the relationship between the element and the pinned balloon. The second one is the position of the balloon arrow. It creates many possible balloon positions:

- `northWestArrowSouthWest`
- `northWestArrowSouthMiddleWest`
- `northWestArrowSouth`
- `northWestArrowSouthMiddleEast`
- `northWestArrowSouthEast`
- `northArrowSouthWest`
- `northArrowSouthMiddleWest`
- `northArrowSouth`
- `northArrowSouthMiddleEast`
- `northArrowSouthEast`
- `northEastArrowSouthWest`
- `northEastArrowSouthMiddleWest`
- `northEastArrowSouth`
- `northEastArrowSouthMiddleEast`
- `northEastArrowSouthEast`
- `southWestArrowNorthWest`
- `southWestArrowNorthMiddleWest`
- `southWestArrowNorth`
- `southWestArrowNorthMiddleEast`
- `southWestArrowNorthEast`
- `southArrowNorthWest`
- `southArrowNorthMiddleWest`
- `southArrowNorth`
- `southArrowNorthMiddleEast`
- `southArrowNorthEast`
- `southEastArrowNorthWest`
- `southEastArrowNorthMiddleWest`
- `southEastArrowNorth`
- `southEastArrowNorthMiddleEast`
- `southEastArrowNorthEast`
- `viewportStickyNorth`

## Button

{@snippet framework/ui/ui-button}

There are two basic buttons in CKEditor 5 UI library: a standard button and a switch. You can instantiate the standard button with the `ButtonView` class. By modifying the passed config, you can get different button variants and states.

### Action

To get an action button, add the `ck-button-action` class.

```js
import { ButtonView } from '@ckeditor/ckeditor5-ui';

const actionButton = new ButtonView();

actionButton.set( {
    label: 'Action button',
    withText: true,
    class: 'ck-button-action'
} );
actionButton.render();

document.getElementById( 'button-action' ).append( actionButton.element );
```

### Rounded

To get a rounded button, add the `ck-rounded-corners` class.

```js
import { ButtonView } from '@ckeditor/ckeditor5-ui';

const roundedButton = new ButtonView();

roundedButton.set( {
    label: 'Rounded button',
    withText: true,
    class: 'ck-rounded-corners'
} );
roundedButton.render();

document.getElementById( 'button-rounded' ).append( roundedButton.element );
```

### Bold

To get a bold button, add the `ck-button-bold` class.

```js
import { ButtonView } from '@ckeditor/ckeditor5-ui';

const boldButton = new ButtonView();

boldButton.set( {
    label: 'Bold button',
    withText: true,
    class: 'ck-button-bold'
} );
boldButton.render();

document.getElementById( 'button-bold' ).append( boldButton.element );
```

### Icon

To get a button with an icon, import it first, then set the icon property on the button. There are also classes you can use to style icons appropriately.

```js
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg'

const saveButton = new ButtonView();

saveButton.set( {
    label: 'Save',
    withText: false,
    icon: checkIcon,
    class: 'ck-button-save'
} );
saveButton.render();

document.getElementById( 'button-icon' ).append( saveButton.element );
```

### Keystrokes

To get a button with a shortcut, add the keystroke property. To display the shortcut on the button, set the `withKeystroke` property to `true`. If you also add a label, it will display next to the shortcut. You don't need to worry about different shortcuts for different OSes - the shortcut is relative to the OS. For example, "CTRL+I" shortcut, Mac OS will display as "⌘+I".

```js
import { ButtonView } from '@ckeditor/ckeditor5-ui';

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

### Tooltip

To get a button with a tooltip, add the tooltip property. You can use it to display additional information on button hover. If you set it to true, a label value is displayed.

```js
import { ButtonView } from '@ckeditor/ckeditor5-ui';

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

By default, the tooltip will appear to the south of the button. However, you can adjust its position by the `tooltipPosition` property. You can set the property to:

- `n` &ndash; North
- `w` &ndash; West
- `s` &ndash; South
- `e` &ndash; East
- `se` &ndash; South-east
- `sw` &ndash; South-west

A tooltip needs the `TooltipManager` to work correctly. You need to add it during CKEditor creation.

```js
ClassicEditor
    .create( document.getElementById( 'ui-editor' ), {
        // Editor config.
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

Buttons are enabled and clickable by default. You can also set the state explicitly by adding the `isEnabled` property with a `true` value.

```js
import { ButtonView } from '@ckeditor/ckeditor5-ui';

const enabledButton = new ButtonView();

enabledButton.set( {
    label: 'Enabled state',
    withText: true,
    isEnabled: true
} );
enabledButton.render();

document.getElementById( 'button-enabled' ).append( enabledButton.element );
```

#### Disabled

To disable a button, set the `isEnabled` property to `false`.

```js
import { ButtonView } from '@ckeditor/ckeditor5-ui';

const disabledButton = new ButtonView();

disabledButton.set( {
    label: 'Disabled state',
    withText: true,
    isEnabled: false
} );
disabledButton.render();

document.getElementById( 'button-disabled' ).append( disabledButton.element );
```

#### On

Some actions in the editor can constantly be active. To indicate them, you can set the `isOn` property to `true`.

```js
import { ButtonView } from '@ckeditor/ckeditor5-ui';

const onButton = new ButtonView();

onButton.set( { label: 'On state', withText: true, isOn: true } );
onButton.render();

document.getElementById( 'button-on' ).append( onButton.element );
```

## Switch

{@snippet framework/ui/ui-switch}

You need a different class to instantiate a switch button - `SwitchButtonView`. To make it work properly, you also need to add an event listener with the `on()` method. Every click triggers the flip of the `isOn` property - it's responsible for turning the button on and off.

```js
import { SwitchButtonView } from '@ckeditor/ckeditor5-ui';

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

## Dropdown

{@snippet framework/ui/ui-dropdown}

A dropdown consists of two elements: a button and a panel. The button expands the dropdown menu. The dropdown panel can hold any UI element. You can use the `createDropdown` helper method to create a dropdown. By default, it uses the `DropdownButtonView` class. But you can replace it with the `ButtonView` or `SplitButtonView` class.

### List

Inside a dropdown, you can put a list. To do so, you can use the `addListToDropdown` helper function. Also, you must add items to a collection before putting them inside the dropdown.

```js
import { 
    addListToDropdown,
    ButtonView,
    createDropdown
} from '@ckeditor/ckeditor5-ui';
import { Collection, Locale } from '@ckeditor/ckeditor5-utils';
import { Model } from '@ckeditor/ckeditor5-engine';

const locale = new Locale();

const collection = new Collection();
collection.add( {
    type: 'button',
    model: new Model( {
        label: 'Button',
        withText: true
    } )
} );
collection.add( {
    type: 'switchbutton',
    model: new Model( {
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

### Toolbar

You can use the `addToolbarToDropdown` helper function to add a toolbar to the dropdown. Inside the toolbar, you can put buttons.

```js
import {
    addToolbarToDropdown,
    ButtonView,
    createDropdown
} from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';
import boldIcon from '@ckeditor/ckeditor5-core/theme/icons/bold.svg';
import italicIcon from '@ckeditor/ckeditor5-basic-styles/theme/icons/italic.svg';

const locale = new Locale();

const bold = new ButtonView();
const italic = new ButtonView();

bold.set( { label: 'Bold', withText: false, icon: boldIcon  } );
italic.set( { label: 'Italic', withText: false, icon: italicIcon  } );

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

### Split button

Besides the standard button, you can also use the split button for a dropdown. It has two clickable sections: one for the main action and a second for expanding the dropdown with more options.

```js
import {
    addToolbarToDropdown,
    ButtonView,
    createDropdown,
    SplitButtonView
} from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';
import boldIcon from '@ckeditor/ckeditor5-core/theme/icons/bold.svg';
import italicIcon from '@ckeditor/ckeditor5-basic-styles/theme/icons/italic.svg';

const locale = new Locale();

const bold = new ButtonView();
const italic = new ButtonView();

bold.set( { label: 'Bold', withText: false, icon: boldIcon  } );
italic.set( { label: 'Italic', withText: false, icon: italicIcon  } );

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

### States

{@snippet framework/ui/ui-dropdown-states}

Dropdowns use buttons. Because of that, states and properties remain the same.

#### Enabled

Buttons in dropdowns are enabled and clickable by default. You can also set the state explicitly by adding the `isEnabled` property with a `true` value.

```js
import { createDropdown } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

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

#### Disabled

To disable a button, set the `isEnabled` property to `false`. It prevents the dropdown from being expanded.

```js
import { createDropdown } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

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

## Icons

{@snippet framework/ui/ui-icons}

The CKEditor 5 library has a collection of icons representing different editor functionalities. Icons are SVG files and follow the style of the surrounding text. You can instantiate an icon with the `IconView` class. The `content` property stores the SVG source of the icon.

```js
import { IconView } from '@ckeditor/ckeditor5-ui';
import boldIcon from '@ckeditor/ckeditor5-core/theme/icons/bold.svg';

const icon = new IconView();

icon.content = boldIcon;
icon.render();

document.getElementById( 'icon-bold' ).append( icon.element );
```

CKEditor 5 features use different icons. You can find them in their respective packages. Here's a list of all available icons.

```js
import boldIcon from '@ckeditor/ckeditor5-core/theme/icons/bold.svg';
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
import lowVision from '@ckeditor/ckeditor5-core/theme/icons/low-vision.svg';
import image from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import alignBottom from '@ckeditor/ckeditor5-core/theme/icons/align-bottom.svg';
import alignMiddle from '@ckeditor/ckeditor5-core/theme/icons/align-middle.svg';
import alignTop from '@ckeditor/ckeditor5-core/theme/icons/align-top.svg';
import alignLeft from '@ckeditor/ckeditor5-core/theme/icons/align-left.svg';
import alignCenter from '@ckeditor/ckeditor5-core/theme/icons/align-center.svg';
import alignRight from '@ckeditor/ckeditor5-core/theme/icons/align-right.svg';
import alignJustify from '@ckeditor/ckeditor5-core/theme/icons/align-justify.svg';
import objectLeft from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import objectCenter from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import objectRight from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';
import objectFullWidth from '@ckeditor/ckeditor5-core/theme/icons/object-full-width.svg';
import objectInline from '@ckeditor/ckeditor5-core/theme/icons/object-inline.svg';
import objectBlockLeft from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import objectBlockRight from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';
import objectSizeFull from '@ckeditor/ckeditor5-core/theme/icons/object-size-full.svg';
import objectSizeLarge from '@ckeditor/ckeditor5-core/theme/icons/object-size-large.svg';
import objectSizeSmall from '@ckeditor/ckeditor5-core/theme/icons/object-size-small.svg';
import objectSizeMedium from '@ckeditor/ckeditor5-core/theme/icons/object-size-medium.svg';
import pencil from '@ckeditor/ckeditor5-core/theme/icons/pencil.svg';
import pilcrow from '@ckeditor/ckeditor5-core/theme/icons/pilcrow.svg';
import quote from '@ckeditor/ckeditor5-core/theme/icons/quote.svg';
import threeVerticalDots from '@ckeditor/ckeditor5-core/theme/icons/three-vertical-dots.svg';

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

import paragraph from '@ckeditor/ckeditor5-core/theme/icons/paragraph.svg';

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

## Input

{@snippet framework/ui/ui-input}

There are also inputs in the CKEditor 5 UI library. There are a few use cases to put inputs inside a main toolbar, but you also can add them to balloon panels.

### Text

You can use the `LabaledFieldView` class to instantiate an input. It takes two parameters: `locale` and a helper function. Pass the `createLabeledInputText` helper function to create a text input.

```js
import { createLabeledInputText, LabeledFieldView } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

const locale = new Locale();

const textInput = new LabeledFieldView( locale, createLabeledInputText );
textInput.set( { label: 'Text input', value: 'Value of the input' } );
textInput.render();

document.getElementById( 'input-text' ).append( textInput.element );
```

### Number

You can use the `LabaledFieldView` class to instantiate an input. It takes two parameters: `locale` and a helper function. Pass the `createLabeledInputNumber` helper function to create a number input.

```js
import { createLabeledInputNumber, LabeledFieldView } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

const locale = new Locale();

const numberInput = new LabeledFieldView( locale, createLabeledInputNumber );
numberInput.set( { label: 'Number input', value: 'Value of the input' } );
numberInput.render();

document.getElementById( 'input-number' ).append( numberInput.element );
```

### States

{@snippet framework/ui/ui-input-states}

Similarly to buttons, inputs can be enabled or disabled. The property names remain the same.

#### Enbaled

Inputs are enabled by default. You can also set the state explicitly by adding the `isEnabled` property with a `true` value.

```js
import { createLabeledInputText, LabeledFieldView } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

const locale = new Locale();

const enabledInput = new LabeledFieldView( locale, createLabeledInputText );
enabledInput.set( { label: 'Enabled state', isEnabled: true } );
enabledInput.render();

document.getElementById( 'input-enabled' ).append( enabledInput.element );
```

#### Disabled

To disable an input, set the `isEnabled` property to `false`. It prevents the input from getting users' data.

```js
import { createLabeledInputText, LabeledFieldView } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

const locale = new Locale();

const disabledInput = new LabeledFieldView( locale, createLabeledInputText );
disabledInput.set( { label: 'Disabled state', isEnabled: false } );
disabledInput.render();

document.getElementById( 'input-disabled' ).append( disabledInput.element );
```

## Toolbar

A toolbar is a base for other components. Usually, you would put other UI elements inside it. But it can also be nested inside a balloon or dropdown. You can use the `ToolbarView` class to instantiate a toolbar.

### Text

{@snippet framework/ui/ui-toolbar-text}

As mentioned earlier, you can put different UI elements inside a toolbar. A simple text node is one example. You can use the `items` property to add a component to a toolbar.

```js
import { ToolbarView, View } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

const locale = new Locale();

const text = new View();
text.element = document.createTextNode( 'Toolbar text' );

const toolbarText = new ToolbarView( locale );
toolbarText.items.add( text );
toolbarText.render();

document.getElementById( 'toolbar-text' ).append( toolbarText.element );
```

### Button

{@snippet framework/ui/ui-toolbar-button}

You can place any previously listed button inside a toolbar.

```js
import { ButtonView, ToolbarView  } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

const locale = new Locale();

const button = new ButtonView();
button.set( { label: 'Button', withText: true } );

const toolbarButton = new ToolbarView( locale );
toolbarButton.items.add( button );
toolbarButton.render();

document.getElementById( 'toolbar-button' ).append( toolbarButton.element );
```

### Wrap

{@snippet framework/ui/ui-toolbar-wrap}

A toolbar automatically wraps if you add more items and the space is limited.

```js
import { ButtonView, ToolbarView } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

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

### Separator

{@snippet framework/ui/ui-toolbar-separator}

You can divide toolbar elements with a separator to create logically connected groups. To instantiate a separator, use the `ToolbarSeparatorView` class. Adding the created instance between desired components will separate them visually.

```js
import { ButtonView, ToolbarSeparatorView, ToolbarView,  } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

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

### Multi-row

{@snippet framework/ui/ui-toolbar-multirow}

By default, a toolbar has one row. However, it can span into multiple rows. You can instantiate a line break with the `ToolbarLineBreakView` class. Adding the created instance after a desired component will place the following UI elements into the next row.

```js
import { ButtonView, ToolbarView } from '@ckeditor/ckeditor5-ui';
import ToolbarLineBreakView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarlinebreakview';
import { Locale } from '@ckeditor/ckeditor5-utils';

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

### Compact

{@snippet framework/ui/ui-toolbar-compact}

There is also a smaller version of a toolbar. To get a compact toolbar, set the `isCompact` property to `true`.

```js
import { ButtonView, ToolbarView } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

const locale = new Locale();

const button = new ButtonView();
button.set( { label: 'Button', withText: true } );

const toolbarCompact = new ToolbarView( locale );
toolbarCompact.isCompact = true;
toolbarCompact.items.add( button );
toolbarCompact.render();

document.getElementById( 'toolbar-compact' ).append( toolbarCompact.element );
```