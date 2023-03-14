/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Locale, View, ToolbarView, document */

const locale = new Locale();

const text = new View();
text.element = document.createTextNode( 'Toolbar text' );

const toolbarText = new ToolbarView( locale );
toolbarText.items.add( text );
toolbarText.render();

document.querySelector( '.ui-toolbar-text' ).append( toolbarText.element );
