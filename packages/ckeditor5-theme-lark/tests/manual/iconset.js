/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import * as icons from 'ckeditor5/src/icons.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview.js';
import Locale from '@ckeditor/ckeditor5-utils/src/locale.js';

const toolbar = new ToolbarView( new Locale() );

for ( const i in icons ) {
	const button = new ButtonView();

	button.set( {
		label: i,
		icon: icons[ i ],
		tooltip: true
	} );

	button.iconView.fillColor = 'hsl(47deg 100% 66%)';

	toolbar.items.add( button );
}

toolbar.class = 'ck-editor-toolbar ck-reset_all';
toolbar.render();

document.querySelector( '#standard' ).appendChild( toolbar.element );
document.querySelector( '#color' ).appendChild( toolbar.element.cloneNode( true ) );
document.querySelector( '#inverted' ).appendChild( toolbar.element.cloneNode( true ) );
document.querySelector( '#zoom' ).appendChild( toolbar.element.cloneNode( true ) );
