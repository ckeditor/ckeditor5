/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Locale, ToolbarView, coreIcons, IconView, document */

const locale = new Locale();

const toolbarIcons = new ToolbarView( locale );

Object.values( coreIcons ).forEach( svg => {
	const icon = new IconView();
	icon.content = svg;
	icon.render();

	toolbarIcons.items.add( icon );
} );

toolbarIcons.render();

document.querySelector( '.ui-icons' ).append( toolbarIcons.element );
