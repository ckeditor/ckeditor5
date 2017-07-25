/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import testUtils from '@ckeditor/ckeditor5-ui/tests/_utils/utils';

import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import View from '@ckeditor/ckeditor5-ui/src/view';
import Template from '@ckeditor/ckeditor5-ui/src/template';

import IconView from '@ckeditor/ckeditor5-ui/src/icon/iconview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import createListDropdown from '@ckeditor/ckeditor5-ui/src/dropdown/list/createlistdropdown';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import ToolbarSeparatorView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarseparatorview';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import LabeledInputView from '@ckeditor/ckeditor5-ui/src/labeledinput/labeledinputview';

import boldIcon from '@ckeditor/ckeditor5-basic-styles/theme/icons/bold.svg';
import italicIcon from '@ckeditor/ckeditor5-basic-styles/theme/icons/italic.svg';

import '../../theme/theme.scss';

class TextView extends View {
	constructor() {
		super();

		this.element = document.createTextNode( 'Sample text' );
	}
}

class ToolbarNewlineView extends View {
	constructor() {
		super();

		this.template = new Template( {
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
	'buttonCustom': '#button-custom',
	'buttonIconCustom': '#button-icon-custom',
	'buttonIconStates': '#button-icon-states',
	'buttonResponsive1': '#button-responsive-1',
	'buttonResponsive2': '#button-responsive-2',
	'buttonResponsive3': '#button-responsive-3',
	'buttonTooltip': '#button-tooltip',

	dropdown: '#dropdown',

	'toolbarText': '#toolbar-text',
	'toolbarButton': '#toolbar-button',
	'toolbarRounded': '#toolbar-rounded',
	'toolbarWrap': '#toolbar-wrap',
	'toolbarSeparator': '#toolbar-separator',
	'toolbarMultiRow': '#toolbar-multi-row',

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

	ui.buttonStates.add( button( {
		label: 'State: normal (none)',
	} ) );

	ui.buttonStates.add( button( {
		label: 'State: disabled',
		isEnabled: false
	} ) );

	ui.buttonStates.add( button( {
		label: 'State: on',
		isOn: true
	} ) );

	// --- Types ------------------------------------------------------------

	const actionButton = button( { label: 'Action button' } );
	const roundedButton = button( { label: 'Rounded corners' } );
	const boldButton = button( { label: 'Bold text' } );

	// TODO: It requires model interface.
	actionButton.element.classList.add( 'ck-button-action' );

	// TODO: It requires model interface.
	roundedButton.element.classList.add( 'ck-rounded-corners' );

	// TODO: It requires model interface.
	boldButton.element.classList.add( 'ck-button-bold' );

	ui.buttonTypes.add( actionButton );
	ui.buttonTypes.add( roundedButton );
	ui.buttonTypes.add( boldButton );

	// --- Icon ------------------------------------------------------------

	ui.buttonIcon.add( button( {
		label: 'Bold',
		icon: boldIcon
	} ) );

	const styledButton = button( {
		label: 'Button with an icon and custom styles',
		icon: italicIcon
	} );

	// TODO: It probably requires model interface.
	styledButton.element.setAttribute( 'style', 'border-radius: 100px; border: 0' );

	ui.buttonIconCustom.add( styledButton );

	ui.buttonIconStates.add( button( {
		label: 'Disabled',
		icon: boldIcon,
		isEnabled: false
	} ) );

	const disabledActionButton = button( {
		label: 'Disabled action',
		icon: boldIcon,
		isEnabled: false
	} );

	// TODO: It requires model interface.
	disabledActionButton.element.classList.add( 'ck-button-action' );

	ui.buttonIconStates.add( disabledActionButton );

	ui.buttonIconStates.add( button( {
		label: 'Bold',
		withText: false,
		tooltip: true,
		icon: boldIcon
	} ) );

	// --- Responsive ------------------------------------------------------------

	for ( let i = 1; i < 4; i++ ) {
		ui[ `buttonResponsive${ i }` ].add( button( {
			label: 'A button',
			isEnabled: true
		} ) );

		ui[ `buttonResponsive${ i }` ].add( button( {
			label: 'Bold',
			icon: boldIcon,
			isEnabled: true
		} ) );

		const notextButton = button( {
			label: 'Bold',
			withText: false,
			tooltip: true,
			icon: boldIcon
		} );

		// TODO: It requires model interface.
		notextButton.element.classList.add( 'ck-button-action' );

		ui[ `buttonResponsive${ i }` ].add( notextButton );
	}

	// --- Tooltip ------------------------------------------------------------

	ui.buttonTooltip.add( button( {
		label: 'This button has a tooltip (south)',
		withText: true,
		tooltip: 'The content of the tooltip',
	} ) );

	ui.buttonTooltip.add( button( {
		label: 'This one too – north',
		withText: true,
		keystroke: 'Ctrl+N',
		tooltip: true,
		tooltipPosition: 'n'
	} ) );
}

function renderDropdown() {
	// --- ListDropdown ------------------------------------------------------------

	const collection = new Collection( { idProperty: 'label' } );

	[ 'Arial', 'Tahoma', 'Georgia' ].forEach( font => {
		collection.add( new Model( {
			label: font,
			style: `font-family: ${ font }`
		} ) );
	} );

	const itemListModel = new Model( {
		items: collection
	} );

	ui.dropdown.add( dropdown( {
		label: 'Normal state',
		isEnabled: true,
		content: itemListModel
	} ) );

	ui.dropdown.add( dropdown( {
		label: 'Disabled',
		isEnabled: false,
		content: itemListModel
	} ) );
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
		dropdown(),
		button()
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

	wrapToolbar.element.style.width = '150px';

	ui.toolbarWrap.add( wrapToolbar );

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
	icon
} = {} ) {
	const button = new ButtonView();

	button.set( { label, isEnabled, isOn, withText, icon, keystroke, tooltip, tooltipPosition } );

	return button;
}

function toolbar( children = [] ) {
	const toolbar = new ToolbarView();

	children.forEach( c => toolbar.items.add( c ) );

	return toolbar;
}

function dropdown( {
	label = 'Dropdown',
	isEnabled = true,
	isOn = false,
	withText = true,
	items = new Collection( { idProperty: 'label' } )
} = {} ) {
	const model = new Model( { label, isEnabled, items, isOn, withText } );
	const dropdown = createListDropdown( model, {} );

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
