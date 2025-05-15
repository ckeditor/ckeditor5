/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ButtonView, ToolbarView, Locale } from 'ckeditor5';

const locale = new Locale();

const enabledButton = new ButtonView();
enabledButton.set( {
	label: 'Enabled state',
	withText: true,
	isEnabled: true
} );
enabledButton.render();

const disabledButton = new ButtonView();
disabledButton.set( {
	label: 'Disabled state',
	withText: true,
	isEnabled: false
} );
disabledButton.render();

const onButton = new ButtonView();
onButton.set( { label: 'On state', withText: true, isOn: true } );
onButton.render();

const buttons = [ enabledButton, disabledButton, onButton ];

const toolbarButtonStates = new ToolbarView( locale );
buttons.forEach( button => toolbarButtonStates.items.add( button ) );
toolbarButtonStates.render();

document.querySelector( '.ui-button-states' ).append( toolbarButtonStates.element );
