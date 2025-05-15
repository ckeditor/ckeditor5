/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ButtonView, ToolbarView, Locale } from 'ckeditor5';

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
toolbarWrap.element.style.width = '175px';

document.querySelector( '.ui-toolbar-wrap' ).append( toolbarWrap.element );
