/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import testUtils from '@ckeditor/ckeditor5-ui/tests/_utils/utils';

import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import View from '@ckeditor/ckeditor5-ui/src/view';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

import IconView from '@ckeditor/ckeditor5-ui/src/icon/iconview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import SwitchButtonView from '@ckeditor/ckeditor5-ui/src/button/switchbuttonview';

import { createDropdown, addListToDropdown, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import ToolbarSeparatorView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarseparatorview';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import LabeledInputView from '@ckeditor/ckeditor5-ui/src/labeledinput/labeledinputview';

import boldIcon from '@ckeditor/ckeditor5-basic-styles/theme/icons/bold.svg';
import italicIcon from '@ckeditor/ckeditor5-basic-styles/theme/icons/italic.svg';
import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview';

const locale = new Locale();

class TextView extends View {
	constructor() {
		super();

		this.element = document.createTextNode( 'Sample text' );
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

	ui.iconPlain1.add( icon( boldIcon ) );
	ui.iconPlain2.add( icon( italicIcon ) );
	ui.iconColor1.add( icon( boldIcon ) );
	ui.iconColor2.add( icon( italicIcon ) );
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
	const saveButton = button( { label: 'Save', withText: false, icon: checkIcon } );
	const cancelButton = button( { label: 'Cancel', withText: false, icon: cancelIcon } );

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
			icon: boldIcon
		} )
	] ) );

	const styledButton = button( {
		label: 'Button with an icon and custom styles',
		icon: italicIcon
	} );

	ui.buttonIconCustom.add( toolbar( [ styledButton ] ) );

	// TODO: It probably requires model interface.
	styledButton.element.setAttribute( 'style', 'border-radius: 100px; border: 0' );

	const disabledActionButton = button( {
		label: 'Disabled action',
		icon: boldIcon,
		isEnabled: false
	} );

	ui.buttonIconStates.add( toolbar( [
		button( {
			label: 'Disabled',
			icon: boldIcon,
			isEnabled: false
		} ),
		disabledActionButton,
		button( {
			label: 'Bold',
			withText: false,
			tooltip: true,
			icon: boldIcon
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
			icon: boldIcon,
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
			icon: boldIcon
		} );

		ui[ `buttonResponsive${ i }` ].add( toolbar( [
			button( {
				label: 'A button',
				isEnabled: true
			} ),
			button( {
				label: 'Bold',
				icon: boldIcon,
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
			label: 'This button has a tooltip (south)',
			withText: true,
			tooltip: 'The content of the tooltip'
		} ),
		button( {
			label: 'This one too – north',
			withText: true,
			keystroke: 'Ctrl+N',
			tooltip: true,
			tooltipPosition: 'n'
		} )
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
			icon: boldIcon
		} )
	} );

	collection.add( {
		type: 'button',
		model: new Model( {
			label: 'Icon and key',
			withText: true,
			icon: boldIcon,
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
			icon: boldIcon,
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
			icon: boldIcon
		} )
	} );

	collection.add( {
		type: 'button',
		model: new Model( {
			label: 'This item is on',
			withText: true,
			icon: boldIcon,
			isOn: true
		} )
	} );

	collection.add( {
		type: 'button',
		model: new Model( {
			label: 'Disabled',
			withText: true,
			icon: boldIcon,
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
					icon: boldIcon
				} ),
				button( {
					withText: false,
					label: 'foo',
					icon: italicIcon
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
					icon: boldIcon
				} ),
				button( {
					withText: false,
					isEnabled: false,
					label: 'foo',
					icon: italicIcon
				} )
			]
		} )
	] ) );
}

function renderToolbar() {
	// --- Text ------------------------------------------------------------

	ui.toolbarText.add( toolbar( [
		icon( boldIcon ),
		text()
	] ) );

	// --- Button ------------------------------------------------------------

	ui.toolbarButton.add( toolbar( [
		button(),
		text(),
		button( {
			label: 'Button with an icon',
			icon: boldIcon
		} ),
		listDropdown(),
		splitButtonDropdown( {
			label: 'Split button dropdown',
			withText: false,
			icon: boldIcon
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
			icon: boldIcon
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
			icon: boldIcon
		} ),
		toolbarSeparator(),
		button( {
			label: 'Bar RTL',
			icon: boldIcon
		} )
	] ) );

	// --- Multi row ------------------------------------------------------------

	ui.toolbarMultiRow.add( toolbar( [
		button(),
		button(),
		toolbarNewLine(),
		button( {
			label: 'Foo',
			icon: boldIcon
		} ),
		button( {
			label: 'Bar',
			icon: boldIcon
		} ),
		button( {
			label: 'Baz',
			icon: boldIcon
		} )
	] ) );

	// --- Compact ------------------------------------------------------------

	const compactToolbar = toolbar( [
		button( {
			icon: boldIcon,
			withText: false
		} ),
		button( {
			icon: italicIcon,
			withText: false,
			isOn: true
		} ),
		button( {
			icon: cancelIcon,
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
		isReadOnly: true,
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
	isReadOnly = false,
	value = 'The value of the input'
} = {} ) {
	const labeledInput = new LabeledInputView( {}, InputTextView );

	labeledInput.set( { isReadOnly, label, value } );

	return labeledInput;
}

function setManualTestDirection( direction ) {
	document.querySelector( '.manual-test-container' ).classList.add( 'ck' );
	document.querySelector( '.manual-test-container' ).setAttribute( 'dir', direction );
}

document.querySelector( '#direcion-selector' ).addEventListener( 'change', evt => {
	setManualTestDirection( evt.target.value );
} );

setManualTestDirection( 'ltr' );
