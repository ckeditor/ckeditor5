/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Locale } from '@ckeditor/ckeditor5-utils';
import DropdownMenuView from '../../../src/menu/dropdownmenuview.js';
import { icons } from '@ckeditor/ckeditor5-core/src/index.js';
import { ButtonView, ListItemView, ListView, SplitButtonView } from '../../../src/index.js';

function createDropdownMenuView( title, {
	withText = false,
	isEnabled = true,
	icon = null,
	label = 'Dropdown menu'
} = {} ) {
	createComponent( 'ltr' );
	createComponent( 'rtl' );

	function createComponent( dir: 'ltr' | 'rtl' ) {
		const locale = new Locale( { uiLanguage: ( dir === 'rtl' ? 'ar' : 'en' ) } );
		const wrapper = createExampleWrapper( title, dir );

		const dropdownMenuView = new DropdownMenuView( locale );

		dropdownMenuView.isEnabled = isEnabled;

		dropdownMenuView.buttonView.set( {
			label,
			icon,
			withText
		} );

		dropdownMenuView.render();
		dropdownMenuView.menuView.children.add( createFocusableContent( locale ) );

		wrapper.lastChild!.appendChild( dropdownMenuView.element! );
	}
}

function createSplitButtonDropdownMenuView( title, {
	withText = false,
	isEnabled = true,
	icon = null,
	label = 'Dropdown menu'
} = {} ) {
	createComponent( 'ltr' );
	createComponent( 'rtl' );

	function createComponent( dir: 'ltr' | 'rtl' ) {
		const locale = new Locale( { uiLanguage: ( dir === 'rtl' ? 'ar' : 'en' ) } );
		const wrapper = createExampleWrapper( title, dir );
		const splitButtonView = new SplitButtonView( locale );
		const dropdownMenuView = new DropdownMenuView( locale, splitButtonView );

		dropdownMenuView.isEnabled = isEnabled;

		dropdownMenuView.buttonView.set( {
			label,
			icon,
			withText
		} );

		dropdownMenuView.render();
		dropdownMenuView.menuView.children.add( createFocusableContent( locale ) );

		wrapper.lastChild!.appendChild( dropdownMenuView.element! );
	}
}

function createExampleWrapper( title, dir ) {
	const wrapper = document.createElement( 'section' );
	const container = document.createElement( 'div' );
	const header = document.createElement( 'h3' );
	header.textContent = `${ title } (${ dir })`;
	container.setAttribute( 'class', 'ck ck-reset_all ck-rounded-corners' );
	container.setAttribute( 'dir', dir );

	wrapper.appendChild( header );
	wrapper.appendChild( container );

	document.querySelector( '#dropdown-menu-view' )!.appendChild( wrapper );

	return wrapper;
}

function createFocusableContent( locale ) {
	const listView = new ListView( locale );

	[ 'Item A', 'Item B', 'Item C' ].forEach( label => {
		const listItemView = new ListItemView( locale );
		const buttonView = new ButtonView( locale );

		buttonView.label = label;
		buttonView.withText = true;

		listItemView.children.add( buttonView );
		listView.items.add( listItemView );
	} );

	return listView;
}

createDropdownMenuView( 'Icon only', { icon: icons.bold } );
createDropdownMenuView( 'Icon only, disabled', { icon: icons.bold, isEnabled: false } );
createDropdownMenuView( 'Short label', { label: 'Label', withText: true } );
createDropdownMenuView( 'Label, no icon', { withText: true } );
createDropdownMenuView( 'Label, no icon, disabled', { withText: true, isEnabled: false } );
createDropdownMenuView( 'Label and icon', { withText: true, icon: icons.bold } );

createSplitButtonDropdownMenuView( 'Split button icon only', { icon: icons.bold } );
createSplitButtonDropdownMenuView( 'Split button disabled', { icon: icons.bold, isEnabled: false } );

