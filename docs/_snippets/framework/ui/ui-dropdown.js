/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	ButtonView,
	SplitButtonView,
	ToolbarView,
	addListToDropdown,
	addToolbarToDropdown,
	createDropdown,
	ViewModel,
	IconBold,
	IconItalic,
	Collection,
	Locale
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

const splitButtonDropdown = createDropdown( locale, SplitButtonView );
addToolbarToDropdown( splitButtonDropdown, [ ...buttons ] );
splitButtonDropdown.buttonView.set( {
	label: 'Split button dropdown',
	withText: true
} );
splitButtonDropdown.render();

const dropdowns = [ listDropdown, toolbarDropdown, splitButtonDropdown ];

const toolbar = new ToolbarView( locale );
dropdowns.forEach( dropdown => toolbar.items.add( dropdown ) );
toolbar.render();

document.querySelector( '.ui-dropdown' ).append( toolbar.element );
