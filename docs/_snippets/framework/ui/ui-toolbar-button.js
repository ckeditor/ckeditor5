/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Locale, ButtonView, ToolbarView, document */

const locale = new Locale();

const button = new ButtonView();
button.set( { label: 'Button', withText: true } );

const toolbarButton = new ToolbarView( locale );
toolbarButton.items.add( button );
toolbarButton.render();

document.querySelector( '.ui-toolbar-button' ).append( toolbarButton.element );
