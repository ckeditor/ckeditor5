/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Locale, ButtonView, ToolbarSeparatorView, ToolbarView, document */

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

document.querySelector( '.ui-toolbar-separator' ).append( toolbarSeparator.element );
