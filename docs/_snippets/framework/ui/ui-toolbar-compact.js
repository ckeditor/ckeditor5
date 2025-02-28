/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals document */

import { ButtonView, ToolbarView } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

const locale = new Locale();

const button = new ButtonView();
button.set( { label: 'Button', withText: true } );

const toolbarCompact = new ToolbarView( locale );
toolbarCompact.isCompact = true;
toolbarCompact.items.add( button );
toolbarCompact.render();

document.querySelector( '.ui-toolbar-compact' ).append( toolbarCompact.element );
