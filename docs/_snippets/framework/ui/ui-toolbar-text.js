/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals document */

import { ToolbarView, View } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

const locale = new Locale();

const text = new View();
text.element = document.createElement( 'span' );
text.element.innerHTML = 'Toolbar text';

const toolbarText = new ToolbarView( locale );
toolbarText.items.add( text );
toolbarText.render();

document.querySelector( '.ui-toolbar-text' ).append( toolbarText.element );
