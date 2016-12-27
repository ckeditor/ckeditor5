/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import testUtils from 'ckeditor5-ui/tests/_utils/utils';

import Collection from 'ckeditor5-utils/src/collection';
import Model from 'ckeditor5-ui/src/model';
import View from 'ckeditor5-ui/src/view';
import Template from 'ckeditor5-ui/src/template';

import IconView from 'ckeditor5-ui/src/icon/iconview';
import ButtonView from 'ckeditor5-ui/src/button/buttonview';
import createListDropdown from 'ckeditor5-ui/src/dropdown/list/createlistdropdown';
import ToolbarView from 'ckeditor5-ui/src/toolbar/toolbarview';

// TODO needs to be filled with icon imports.
const availableIcons = [];

testUtils.createTestUIView( {
	'iconPlain1':					'#icon-plain-1',
	'iconPlain2':					'#icon-plain-2',
	'iconColor1':					'#icon-color-1',
	'iconColor2':					'#icon-color-2',
	'iconAvailability':				'#icon-availability',
	'iconAvailabilityColor':		'#icon-availability-color',

	'buttonStates':					'#button-states',
	'buttonTypes':					'#button-types',
	'buttonIcon':					'#button-icon',
	'buttonCustom':					'#button-custom',
	'buttonIconCustom':				'#button-icon-custom',
	'buttonIconStates':				'#button-icon-states',
	'buttonResponsive1':			'#button-responsive-1',
	'buttonResponsive2':			'#button-responsive-2',
	'buttonResponsive3':			'#button-responsive-3',

	dropdown:						'#dropdown',

	'toolbarText':					'#toolbar-text',
	'toolbarButton':				'#toolbar-button',
	'toolbarRounded':				'#toolbar-rounded',
	'toolbarWrap':					'#toolbar-wrap',
	'toolbarSeparator':				'#toolbar-separator',
	'toolbarMultiRow':				'#toolbar-multi-row',

	body:							'div#body'
} ).then( ui => {
	renderIcon( ui );
	renderButton( ui );
	renderDropdown( ui );
	renderToolbar( ui );
} );

function renderIcon( ui ) {
	// --- In-text ------------------------------------------------------------

	ui.iconPlain1.add( icon( 'bold' ) );
	ui.iconPlain2.add( icon( 'quote' ) );
	ui.iconColor1.add( icon( 'bold' ) );
	ui.iconColor2.add( icon( 'quote' ) );

	// --- Availability ------------------------------------------------------------

	availableIcons.forEach( i => {
		ui.iconAvailability.add( icon( i ) );
		ui.iconAvailabilityColor.add( icon( i ) );
	} );
}

function renderButton( ui ) {
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

	availableIcons.forEach( i => {
		ui.buttonIcon.add( button( {
			label: i,
			icon: i
		} ) );
	} );

	const styledButton = button( {
		label: 'Button with an icon and custom styles',
		icon: 'italic'
	} );

	// TODO: It probably requires model interface.
	styledButton.element.setAttribute( 'style', 'border-radius: 100px; border: 0' );

	ui.buttonIconCustom.add( styledButton );

	ui.buttonIconStates.add( button( {
		label: 'Disabled',
		icon: 'bold',
		isEnabled: false
	} ) );

	const disabledActionButton = button( {
		label: 'Disabled action',
		icon: 'bold',
		isEnabled: false
	} );

	// TODO: It requires model interface.
	disabledActionButton.element.classList.add( 'ck-button-action' );

	ui.buttonIconStates.add( disabledActionButton );

	ui.buttonIconStates.add( button( {
		label: 'Bold',
		withText: false,
		icon: 'bold'
	} ) );

	// --- Responsive ------------------------------------------------------------

	for ( let i = 1; i < 4; i++ ) {
		ui[ `buttonResponsive${ i }` ].add( button( {
			label: 'A button',
			isEnabled: true
		} ) );

		ui[ `buttonResponsive${ i }` ].add( button( {
			label: 'Bold',
			icon: 'bold',
			isEnabled: true
		} ) );

		const notextButton = button( {
			label: 'Link',
			withText: false,
			icon: 'link'
		} );

		// TODO: It requires model interface.
		notextButton.element.classList.add( 'ck-button-action' );

		ui[ `buttonResponsive${ i }` ].add( notextButton );
	}
}

function renderDropdown( ui ) {
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

function renderToolbar( ui ) {
	// --- Text ------------------------------------------------------------

	ui.toolbarText.add( toolbar( [
		icon( 'bold' ),
		text()
	] ) );

	// --- Button ------------------------------------------------------------

	ui.toolbarButton.add( toolbar( [
		button(),
		text(),
		button( {
			label: 'Button with an icon',
			icon: 'bold'
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
			icon: 'bold'
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
			label: 'Link',
			icon: 'link'
		} ),
		toolbarSeparator(),
		button( {
			label: 'Unlink RTL',
			icon: 'unlink'
		} )
	] ) );

	// --- Multi row ------------------------------------------------------------

	ui.toolbarMultiRow.add( toolbar( [
		button(),
		button(),
		toolbarNewLine(),
		button( {
			label: 'Link',
			icon: 'link'
		} ),
		button( {
			label: 'Unlink RTL',
			icon: 'unlink'
		} ),
		button( {
			label: 'Link',
			icon: 'link'
		} )
	] ) );
}

const TextView = class extends View {
	constructor() {
		super();

		this.element = document.createTextNode( 'Sample text' );
	}
};

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
	icon
} = {} ) {
	const button = new ButtonView();

	button.set( { label, isEnabled, isOn, withText, icon } );

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

const ToolbarSeparatorView = class extends View {
	constructor() {
		super();

		this.template = new Template( {
			tag: 'span',
			attributes: {
				class: 'ck-toolbar-separator'
			}
		} );
	}
};

function toolbarSeparator() {
	return new ToolbarSeparatorView();
}

const ToolbarNewlineView = class extends View {
	constructor() {
		super();

		this.template = new Template( {
			tag: 'span',
			attributes: {
				class: 'ck-toolbar-newline'
			}
		} );
	}
};

function toolbarNewLine() {
	return new ToolbarNewlineView();
}
