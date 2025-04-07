/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconView, ToolbarView, Locale } from 'ckeditor5';
import * as icons from 'ckeditor5';

const locale = new Locale();
const toolbarIcons = new ToolbarView( locale );

Object
	.entries( icons )

	/**
	 * The `@ckeditor/ckeditor5-icons` import actually resolves to `ckeditor5`,
	 * so it includes everything we export from the `ckeditor5` package. For this
	 * reason, we need to filter out only the icons.
	 */
	.filter( ( [ key, value ] ) => key.startsWith( 'Icon' ) && typeof value === 'string' && value.startsWith( '<svg' ) )
	.forEach( ( [ , value ] ) => {
		const icon = new IconView();

		icon.content = value;
		icon.render();
		toolbarIcons.items.add( icon );
	} );

toolbarIcons.render();

document.querySelector( '.ui-icons' ).append( toolbarIcons.element );
