/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconBold, IconItalic, IconCheck, IconCancel } from 'ckeditor5/src/icons.js';
import testUtils from '@ckeditor/ckeditor5-ui/tests/_utils/utils.js';

import Collection from '@ckeditor/ckeditor5-utils/src/collection.js';
import Model from '@ckeditor/ckeditor5-ui/src/model.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import Locale from '@ckeditor/ckeditor5-utils/src/locale.js';

import IconView from '@ckeditor/ckeditor5-ui/src/icon/iconview.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import SwitchButtonView from '@ckeditor/ckeditor5-ui/src/button/switchbuttonview.js';

import { createDropdown, addListToDropdown, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils.js';

import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview.js';
import ToolbarSeparatorView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarseparatorview.js';

import LabeledFieldView from '@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview.js';
import { createLabeledInputText } from '@ckeditor/ckeditor5-ui/src/labeledfield/utils.js';

import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview.js';
import { SpinnerView } from '@ckeditor/ckeditor5-ui';

const locale = new Locale();

class TextView extends View {
	constructor() {
		super();

		this.element = document.createElement( 'span' );
		this.element.innerHTML = 'Sample text';
	}
}

class ToolbarNewlineView extends View {
	constructor() {
		super();

		this.setTemplate( {
			tag: 'span',
			attributes: {
				class: 'ck-toolbar__newline'
			}
		} );
	}
}

const ui = testUtils.createTestUIView( {
	'iconPlain1': '#icon-plain-1',
	'iconPlain2': '#icon-plain-2',
	'iconColor1': '#icon-color-1',
	'iconColor2': '#icon-color-2',

	'buttonStates': '#button-states',
	'buttonTypes': '#button-types',
	'buttonIcon': '#button-icon',
	'buttonKeystroke': '#button-keystroke',
	'buttonCustom': '#button-custom',
	'buttonIconCustom': '#button-icon-custom',
	'buttonIconStates': '#button-icon-states',
	'buttonResponsive1': '#button-responsive-1',
	'buttonResponsive2': '#button-responsive-2',
	'buttonResponsive3': '#button-responsive-3',
	'buttonTooltip': '#button-tooltip',
	'buttonSpinner': '#button-spinner',

	listDropdown: '#list-dropdown',
	buttonDropdown: '#button-dropdown',

	'toolbarText': '#toolbar-text',
	'toolbarButton': '#toolbar-button',
	'toolbarRounded': '#toolbar-rounded',
	'toolbarWrap': '#toolbar-wrap',
	'toolbarSeparator': '#toolbar-separator',
	'toolbarMultiRow': '#toolbar-multi-row',
	'toolbarCompact': '#toolbar-compact',

	'inputLabeled': '#input-labeled',
	'inputReadOnly': '#input-read-only'
} );

renderIcon();
renderButton();
renderDropdown();
renderToolbar();
renderInput();

function renderIcon() {
	// --- In-text ------------------------------------------------------------

	ui.iconPlain1.add( icon( IconBold ) );
	ui.iconPlain2.add( icon( IconItalic ) );
	ui.iconColor1.add( icon( IconBold ) );
	ui.iconColor2.add( icon( IconItalic ) );
}

function renderButton() {
	// --- States ------------------------------------------------------------

	ui.buttonStates.add( toolbar( [
		button( {
			label: 'State: normal (none)'
		} ),
		button( {
			label: 'State: disabled',
			isEnabled: false
		} ),
		button( {
			label: 'State: on',
			isOn: true
		} )
	] ) );

	// --- Types ------------------------------------------------------------

	const actionButton = button( { label: 'Action button' } );
	const roundedButton = button( { label: 'Rounded corners' } );
	const boldButton = button( { label: 'Bold text' } );
	const saveButton = button( { label: 'Save', withText: false, icon: IconCheck } );
	const cancelButton = button( { label: 'Cancel', withText: false, icon: IconCancel } );

	ui.buttonTypes.add( toolbar( [
		actionButton, roundedButton, boldButton, saveButton, cancelButton
	] ) );

	// TODO: It requires model interface.
	actionButton.element.classList.add( 'ck-button-action' );

	// TODO: It requires model interface.
	roundedButton.element.classList.add( 'ck-rounded-corners' );

	// TODO: It requires model interface.
	boldButton.element.classList.add( 'ck-button-bold' );

	saveButton.element.classList.add( 'ck-button-save' );
	cancelButton.element.classList.add( 'ck-button-cancel' );

	// --- Icon ------------------------------------------------------------

	ui.buttonIcon.add( toolbar( [
		button( {
			label: 'Bold',
			icon: IconBold
		} )
	] ) );

	const styledButton = button( {
		label: 'Button with an icon and custom styles',
		icon: IconItalic
	} );

	ui.buttonIconCustom.add( toolbar( [ styledButton ] ) );

	// TODO: It probably requires model interface.
	styledButton.element.setAttribute( 'style', 'border-radius: 100px; border: 0' );

	const disabledActionButton = button( {
		label: 'Disabled action',
		icon: IconBold,
		isEnabled: false
	} );

	ui.buttonIconStates.add( toolbar( [
		button( {
			label: 'Disabled',
			icon: IconBold,
			isEnabled: false
		} ),
		disabledActionButton,
		button( {
			label: 'Bold',
			withText: false,
			tooltip: true,
			icon: IconBold
		} )
	] ) );

	// TODO: It requires model interface.
	disabledActionButton.element.classList.add( 'ck-button-action' );

	// --- Keystrokes ------------------------------------------------------------

	ui.buttonKeystroke.add( toolbar( [
		button( {
			label: 'Foo',
			keystroke: 'Ctrl+A',
			withKeystroke: true
		} ),
		button( {
			label: 'Bar',
			icon: IconBold,
			keystroke: 'Shift+Tab',
			withKeystroke: true
		} )
	] ) );

	// --- Responsive ------------------------------------------------------------

	for ( let i = 1; i < 4; i++ ) {
		const notextButton = button( {
			label: 'Bold',
			withText: false,
			tooltip: true,
			icon: IconBold
		} );

		ui[ `buttonResponsive${ i }` ].add( toolbar( [
			button( {
				label: 'A button',
				isEnabled: true
			} ),
			button( {
				label: 'Bold',
				icon: IconBold,
				isEnabled: true
			} ),
			notextButton
		] ) );

		// TODO: It requires model interface.
		notextButton.element.classList.add( 'ck-button-action' );
	}

	// --- Tooltip ------------------------------------------------------------

	ui.buttonTooltip.add( toolbar( [
		button( {
			label: 'This button has a tooltip when hovered (south)',
			withText: true,
			tooltip: 'The content of the tooltip'
		} ),
		button( {
			label: 'North',
			withText: true,
			keystroke: 'Ctrl+N',
			tooltip: true,
			tooltipPosition: 'n'
		} ),
		button( {
			label: 'West',
			withText: true,
			keystroke: 'Ctrl+N',
			tooltip: true,
			tooltipPosition: 'w'
		} ),
		button( {
			label: 'East',
			withText: true,
			keystroke: 'Ctrl+N',
			tooltip: true,
			tooltipPosition: 'e'
		} ),
		button( {
			label: 'South East',
			withText: true,
			keystroke: 'Ctrl+N',
			tooltip: true,
			tooltipPosition: 'se'
		} ),
		button( {
			label: 'South West',
			withText: true,
			keystroke: 'Ctrl+N',
			tooltip: true,
			tooltipPosition: 'sw'
		} )
	] ) );

	// --- With spinner ------------------------------------------------------------

	const buttonWithSpinner = button( {
		label: 'Button with spinner',
		withText: false
	} );

	const spinnerView = new SpinnerView();
	spinnerView.isVisible = true;

	buttonWithSpinner.children.add( spinnerView );

	ui.buttonSpinner.add( toolbar( [
		buttonWithSpinner
	] ) );
}

function renderDropdown() {
	// --- ListDropdown ------------------------------------------------------------

	const collection = new Collection( { idProperty: 'label' } );

	collection.add( {
		type: 'switchbutton',
		model: new Model( {
			label: 'A switchable list item',
			withText: true
		} )
	} );

	collection.add( {
		type: 'switchbutton',
		model: new Model( {
			label: 'On with an icon',
			withText: true,
			isOn: true,
			icon: IconBold
		} )
	} );

	collection.add( {
		type: 'button',
		model: new Model( {
			label: 'Icon and key',
			withText: true,
			icon: IconBold,
			keystroke: 'Shift+Tab',
			withKeystroke: true
		} )
	} );

	collection.add( {
		type: 'button',
		model: new Model( {
			label: 'On with a keystroke',
			withText: true,
			isOn: true,
			icon: IconBold,
			keystroke: 'Ctrl+A',
			withKeystroke: true
		} )
	} );

	collection.add( {
		type: 'switchbutton',
		model: new Model( {
			label: 'Disabled',
			withText: true,
			isEnabled: false
		} )
	} );

	collection.add( { type: 'separator' } );

	[ 'Arial', 'Tahoma', 'Georgia' ].forEach( font => {
		collection.add( {
			type: 'button',
			model: new Model( {
				label: `${ font } (style attr)`,
				style: `font-family: ${ font }`,
				withText: true
			} )
		} );
	} );

	collection.add( { type: 'separator' } );

	collection.add( {
		type: 'button',
		model: new Model( {
			label: 'Bold',
			withText: true,
			icon: IconBold
		} )
	} );

	collection.add( {
		type: 'button',
		model: new Model( {
			label: 'This item is on',
			withText: true,
			icon: IconBold,
			isOn: true
		} )
	} );

	collection.add( {
		type: 'button',
		model: new Model( {
			label: 'Disabled',
			withText: true,
			icon: IconBold,
			isEnabled: false
		} )
	} );

	ui.listDropdown.add( toolbar( [
		listDropdown( {
			label: 'Normal state',
			isEnabled: true,
			items: collection
		} ),
		listDropdown( {
			label: 'Disabled',
			isEnabled: false,
			items: collection
		} )
	] ) );

	ui.buttonDropdown.add( toolbar( [
		toolbarDropdown( {
			label: 'Normal state',
			isEnabled: true,
			buttons: [
				button( {
					withText: false,
					label: 'foo',
					icon: IconBold
				} ),
				button( {
					withText: false,
					label: 'foo',
					icon: IconBold
				} )
			]
		} ),
		toolbarDropdown( {
			label: 'Disabled',
			isEnabled: false,
			buttons: [
				button( {
					withText: false,
					isEnabled: false,
					label: 'foo',
					icon: IconBold
				} ),
				button( {
					withText: false,
					isEnabled: false,
					label: 'foo',
					icon: IconItalic
				} )
			]
		} )
	] ) );
}

function renderToolbar() {
	// --- Text ------------------------------------------------------------

	ui.toolbarText.add( toolbar( [
		icon( IconBold ),
		text()
	] ) );

	// --- Button ------------------------------------------------------------

	ui.toolbarButton.add( toolbar( [
		button(),
		text(),
		button( {
			label: 'Button with an icon',
			icon: IconBold
		} ),
		listDropdown(),
		splitButtonDropdown( {
			label: 'Split button dropdown',
			withText: false,
			icon: IconBold
		} ),
		button(),
		switchbutton( {
			label: 'Switchable',
			withText: true
		} )
	] ) );

	// --- Rounded ------------------------------------------------------------

	ui.toolbarRounded.add( toolbar( [
		button( {
			label: 'A button which corners are also rounded because of toolbar class'
		} ),
		button( {
			label: 'Button with an icon',
			icon: IconBold
		} )
	] ) );

	// --- Wrap ------------------------------------------------------------

	const wrapToolbar = toolbar( [
		button(),
		button(),
		button()
	] );

	ui.toolbarWrap.add( wrapToolbar );

	wrapToolbar.element.style.width = '150px';

	// --- Separator ------------------------------------------------------------

	ui.toolbarSeparator.add( toolbar( [
		button(),
		button(),
		toolbarSeparator(),
		button( {
			label: 'Foo',
			icon: IconBold
		} ),
		toolbarSeparator(),
		button( {
			label: 'Bar RTL',
			icon: IconBold
		} )
	] ) );

	// --- Multi row ------------------------------------------------------------

	ui.toolbarMultiRow.add( toolbar( [
		button(),
		button(),
		toolbarNewLine(),
		button( {
			label: 'Foo',
			icon: IconBold
		} ),
		button( {
			label: 'Bar',
			icon: IconBold
		} ),
		button( {
			label: 'Baz',
			icon: IconBold
		} )
	] ) );

	// --- Compact ------------------------------------------------------------

	const compactToolbar = toolbar( [
		button( {
			icon: IconBold,
			withText: false
		} ),
		button( {
			icon: IconItalic,
			withText: false,
			isOn: true
		} ),
		button( {
			icon: IconCancel,
			withText: false
		} )
	] );

	compactToolbar.isCompact = true;

	ui.toolbarCompact.add( compactToolbar );
}

function renderInput() {
	ui.inputLabeled.add( input() );
	ui.inputReadOnly.add( input( {
		label: 'A read–only input',
		isEnabled: false,
		value: 'Read–only input value'
	} ) );
}

function text() {
	return new TextView();
}

function icon( content ) {
	const icon = new IconView();
	icon.content = content;

	return icon;
}

function button( {
	label = 'Button',
	isEnabled = true,
	isOn = false,
	withText = true,
	keystroke = null,
	tooltip,
	tooltipPosition = 's',
	withKeystroke = false,
	icon
} = {} ) {
	const button = new ButtonView();

	button.set( { label, isEnabled, isOn, withText, icon, keystroke, tooltip, withKeystroke, tooltipPosition } );

	return button;
}

function switchbutton( {
	label = 'Switch button',
	isEnabled = true,
	isOn = false,
	withText = true,
	keystroke = null,
	tooltip,
	tooltipPosition = 's',
	icon
} = {} ) {
	const button = new SwitchButtonView();

	button.set( { label, isEnabled, isOn, withText, icon, keystroke, tooltip, tooltipPosition } );

	button.on( 'execute', () => ( button.isOn = !button.isOn ) );

	return button;
}

function toolbar( children = [] ) {
	const toolbar = new ToolbarView( locale );

	children.forEach( c => toolbar.items.add( c ) );

	return toolbar;
}

function listDropdown( {
	label = 'Dropdown',
	isEnabled = true,
	isOn = false,
	withText = true,
	items = new Collection( { idProperty: 'label' } )
} = {} ) {
	const dropdown = createDropdown( locale );
	addListToDropdown( dropdown, items );

	dropdown.buttonView.set( { label, isEnabled, isOn, withText } );

	return dropdown;
}

function toolbarDropdown( {
	label = 'Button dropdown',
	isEnabled = true,
	isOn = false,
	withText = true,
	isVertical = true,
	buttons = []
} = {} ) {
	const dropdown = createDropdown( locale );

	addToolbarToDropdown( dropdown, buttons );

	dropdown.buttonView.set( { label, isEnabled, isVertical, isOn, withText } );

	return dropdown;
}

function splitButtonDropdown( {
	label = 'Button dropdown',
	icon = undefined,
	isEnabled = true,
	isOn = false,
	withText = true,
	isVertical = true,
	buttons = []
} = {} ) {
	const dropdown = createDropdown( locale, SplitButtonView );

	addToolbarToDropdown( dropdown, buttons );

	dropdown.buttonView.set( { icon, label, isEnabled, isVertical, isOn, withText } );

	return dropdown;
}

function toolbarSeparator() {
	return new ToolbarSeparatorView();
}

function toolbarNewLine() {
	return new ToolbarNewlineView();
}

function input( {
	label = 'Labeled input',
	isEnabled = true,
	value = 'The value of the input'
} = {} ) {
	const labeledField = new LabeledFieldView( {}, createLabeledInputText );

	labeledField.set( { isEnabled, label, value } );

	return labeledField;
}

function setManualTestDirection( direction ) {
	document.querySelector( '.manual-test-container' ).classList.add( 'ck' );
	document.querySelector( '.manual-test-container' ).setAttribute( 'dir', direction );
}

document.querySelector( '#direcion-selector' ).addEventListener( 'change', evt => {
	setManualTestDirection( evt.target.value );
} );

setManualTestDirection( 'ltr' );
