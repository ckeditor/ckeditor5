/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals document */

import { ButtonView, ToolbarView, addToolbarToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

const locale = new Locale();

const button = new ButtonView();
button.set( { label: 'Button', withText: true } );
const buttons = [ button ];

const enabledDropdown = createDropdown( locale );
enabledDropdown.buttonView.set( {
	label: 'Enabled state',
	isEnabled: true,
	withText: true
} );
addToolbarToDropdown( enabledDropdown, buttons );
enabledDropdown.render();

const disabledDropdown = createDropdown( locale );
disabledDropdown.buttonView.set( {
	label: 'Disabled state',
	isEnabled: false,
	withText: true
} );
disabledDropdown.render();

const dropdowns = [ enabledDropdown, disabledDropdown ];

const toolbar = new ToolbarView( locale );
dropdowns.forEach( dropdown => toolbar.items.add( dropdown ) );
toolbar.render();

document.querySelector( '.ui-dropdown-states' ).append( toolbar.element );
