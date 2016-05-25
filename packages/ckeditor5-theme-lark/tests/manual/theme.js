/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import testUtils from '/tests/ckeditor5/_utils/utils.js';

import Collection from '/ckeditor5/utils/collection.js';
import IconManagerView from '/ckeditor5/ui/iconmanagerview.js';
import Model from '/ckeditor5/ui/model.js';
import Controller from '/ckeditor5/ui/controller.js';
import View from '/ckeditor5/ui/view.js';

import iconManagerModel from '/theme/iconmanagermodel.js';
import IconView from '/ckeditor5/ui/icon/iconview.js';

import Button from '/ckeditor5/ui/button/button.js';
import ButtonView from '/ckeditor5/ui/button/buttonview.js';

import ListDropdown from '/ckeditor5/ui/dropdown/list/listdropdown.js';
import ListDropdownView from '/ckeditor5/ui/dropdown/list/listdropdownview.js';

import Toolbar from '/ckeditor5/ui/toolbar/toolbar.js';
import ToolbarView from '/ckeditor5/ui/toolbar/toolbarview.js';

testUtils.createTestUIController( {
	'icon-plain-1':					'#icon-plain-1',
	'icon-plain-2':					'#icon-plain-2',
	'icon-color-1':					'#icon-color-1',
	'icon-color-2':					'#icon-color-2',
	'icon-availability':			'#icon-availability',
	'icon-availability-color':		'#icon-availability-color',

	'button-states':				'#button-states',
	'button-types':					'#button-types',
	'button-icon':					'#button-icon',
	'button-custom':				'#button-custom',
	'button-icon-custom':			'#button-icon-custom',
	'button-icon-states':			'#button-icon-states',
	'button-responsive-1':			'#button-responsive-1',
	'button-responsive-2':			'#button-responsive-2',
	'button-responsive-3':			'#button-responsive-3',

	dropdown:						'#dropdown',

	'toolbar-text':					'#toolbar-text',
	'toolbar-button':				'#toolbar-button',
	'toolbar-rounded':				'#toolbar-rounded',
	'toolbar-wrap':					'#toolbar-wrap',
	'toolbar-separator':			'#toolbar-separator',
	'toolbar-multi-row':			'#toolbar-multi-row',

	body:							'div#body'
} ).then( ui => {
	renderIcon( ui );
	renderButton( ui );
	renderDropdown( ui );
	renderToolbar( ui );
} );

function renderIcon( ui ) {
	// --- IconManager ------------------------------------------------------------

	ui.add( 'body', new Controller( null, new IconManagerView( iconManagerModel ) ) );

	// --- In-text ------------------------------------------------------------

	ui.add( 'icon-plain-1', icon( 'bold' ) );
	ui.add( 'icon-plain-2', icon( 'quote' ) );

	ui.add( 'icon-color-1', icon( 'bold' ) );
	ui.add( 'icon-color-2', icon( 'quote' ) );

	// --- Availability ------------------------------------------------------------

	iconManagerModel.icons.forEach( i => {
		ui.add( 'icon-availability', icon( i ) );
		ui.add( 'icon-availability-color', icon( i ) );
	} );
}

function renderButton( ui ) {
	// --- States ------------------------------------------------------------

	ui.add( 'button-states', button( {
		label: 'State: normal (none)',
	} ) );

	ui.add( 'button-states', button( {
		label: 'State: disabled',
		isEnabled: false
	} ) );

	ui.add( 'button-states', button( {
		label: 'State: on',
		isOn: true
	} ) );

	// --- Types ------------------------------------------------------------

	const actionButton = button( { label: 'Action button' } );
	const roundedButton = button( { label: 'Rounded corners' } );
	const boldButton = button( { label: 'Bold text' } );

	// TODO: It requires model interface.
	actionButton.view.element.classList.add( 'ck-button-action' );

	// TODO: It requires model interface.
	roundedButton.view.element.classList.add( 'ck-rounded-corners' );

	// TODO: It requires model interface.
	boldButton.view.element.classList.add( 'ck-button-bold' );

	ui.add( 'button-types', actionButton );
	ui.add( 'button-types', roundedButton );
	ui.add( 'button-types', boldButton );

	// --- Icon ------------------------------------------------------------

	iconManagerModel.icons.forEach( i => {
		ui.add( 'button-icon', button( {
			label: i,
			icon: i,
			iconAlign: 'LEFT'
		} ) );
	} );

	ui.add( 'button-icon-custom', button( {
		label: 'Icon to the left',
		icon: 'bold',
		iconAlign: 'LEFT'
	} ) );

	ui.add( 'button-icon-custom', button( {
		label: 'Icon to the right (RTL)',
		icon: 'bold',
		iconAlign: 'RIGHT'
	} ) );

	const styledButton = button( {
		label: 'Button with icon and custom styles',
		icon: 'italic',
		iconAlign: 'LEFT'
	} );

	// TODO: It probably requires model interface.
	styledButton.view.element.setAttribute( 'style', 'border-radius: 100px; border: 0' );

	ui.add( 'button-icon-custom', styledButton );

	ui.add( 'button-icon-states', button( {
		label: 'Disabled',
		icon: 'bold',
		iconAlign: 'LEFT',
		isEnabled: false
	} ) );

	const notextButton = button( {
		label: '',
		icon: 'bold',
		iconAlign: 'LEFT'
	} );

	// TODO: It requires model interface.
	notextButton.view.element.classList.add( 'ck-button-notext' );

	ui.add( 'button-icon-states', notextButton );

	const colChangeButton = button( {
		label: 'Icon follows text color',
		icon: 'bold',
		iconAlign: 'LEFT'
	} );

	// TODO: It requires model interface.
	colChangeButton.view.element.id = 'icon-color-change';

	ui.add( 'button-icon-states', colChangeButton );

	// --- Responsive ------------------------------------------------------------

	for ( let i = 1; i < 4; i++ ) {
		ui.add( `button-responsive-${ i }`, button( {
			label: 'A button',
			isEnabled: true
		} ) );

		ui.add( `button-responsive-${ i }`, button( {
			label: 'Bold',
			icon: 'bold',
			iconAlign: 'LEFT',
			isEnabled: true
		} ) );

		const notextButton = button( {
			label: '',
			icon: 'link',
			iconAlign: 'LEFT'
		} );

		// TODO: It requires model interface.
		notextButton.view.element.classList.add( 'ck-button-notext' );
		notextButton.view.element.classList.add( 'ck-button-action' );

		ui.add( `button-responsive-${ i }`, notextButton );
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

	const enabledModel = new Model( {
		label: 'Normal state',
		isEnabled: true,
		isOn: false,
		content: itemListModel
	} );

	const disabledModel = new Model( {
		label: 'Disabled',
		isEnabled: false,
		isOn: false,
		content: itemListModel
	} );

	ui.add( 'dropdown', new ListDropdown( enabledModel, new ListDropdownView( enabledModel ) ) );
	ui.add( 'dropdown', new ListDropdown( disabledModel, new ListDropdownView( disabledModel ) ) );
}

function renderToolbar( ui ) {
	// --- Text ------------------------------------------------------------

	ui.add( 'toolbar-text', toolbar( [
		icon( 'bold' ),
		text()
	] ) );

	// --- Button ------------------------------------------------------------

	ui.add( 'toolbar-button', toolbar( [
		button(),
		text(),
		button( {
			label: 'Button with icon',
			icon: 'bold',
			iconAlign: 'LEFT'
		} )
	] ) );

	// --- Rounded ------------------------------------------------------------

	ui.add( 'toolbar-rounded', toolbar( [
		button( {
			label: 'A button which corners are also rounded because of toolbar class'
		} ),
		button( {
			label: 'Button with icon',
			icon: 'bold',
			iconAlign: 'LEFT'
		} )
	] ) );

	// --- Wrap ------------------------------------------------------------

	const wrapToolbar = toolbar( [
		button(),
		button(),
		button()
	] );

	wrapToolbar.view.element.style.width = '150px';

	ui.add( 'toolbar-wrap', wrapToolbar );

	// --- Separator ------------------------------------------------------------

	ui.add( 'toolbar-separator', toolbar( [
		button(),
		button(),
		toolbarSeparator(),
		button( {
			label: 'Link',
			icon: 'link',
			iconAlign: 'LEFT'
		} ),
		toolbarSeparator(),
		button( {
			label: 'Unlink RTL',
			icon: 'unlink',
			iconAlign: 'RIGHT'
		} )
	] ) );

	// --- Multi row ------------------------------------------------------------

	ui.add( 'toolbar-multi-row', toolbar( [
		button(),
		button(),
		toolbarNewLine(),
		button( {
			label: 'Link',
			icon: 'link',
			iconAlign: 'LEFT'
		} ),
		button( {
			label: 'Unlink RTL',
			icon: 'unlink',
			iconAlign: 'RIGHT'
		} ),
		button( {
			label: 'Link',
			icon: 'link',
			iconAlign: 'LEFT'
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
	return new Controller( null, new TextView( null ) );
}

function icon( name ) {
	return new Controller( null, new IconView( new Model( { icon: name } ) ) );
}

function button( { label = 'Button', isEnabled = true, isOn = false, icon, iconAlign } = {} ) {
	const model = new Model( { label, isEnabled, isOn, icon, iconAlign } );

	return new Button( model, new ButtonView( model ) );
}

function toolbar( children = [] ) {
	const toolbar = new Toolbar( null, new ToolbarView( null ) );

	children.forEach( c => {
		toolbar.add( 'buttons', c );
	} );

	return toolbar;
}

const ToolbarSeparatorView = class extends View {
	constructor() {
		super();

		this.template = {
			tag: 'span',
			attributes: {
				class: 'ck-toolbar-separator'
			}
		};
	}
};

function toolbarSeparator() {
	return new Controller( null, new ToolbarSeparatorView( null ) );
}

const ToolbarNewlineView = class extends View {
	constructor() {
		super();

		this.template = {
			tag: 'span',
			attributes: {
				class: 'ck-toolbar-newline'
			}
		};
	}
};

function toolbarNewLine() {
	return new Controller( null, new ToolbarNewlineView( null ) );
}
