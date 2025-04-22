/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { SwitchButtonView, ToolbarView, Locale } from 'ckeditor5';

const locale = new Locale();

const switchButton = new SwitchButtonView();
switchButton.set( {
	label: 'Switch button',
	isEnbaled: true,
	withText: true
} );
switchButton.on( 'execute', () => ( switchButton.isOn = !switchButton.isOn ) );

const toolbarSwitch = new ToolbarView( locale );
toolbarSwitch.items.add( switchButton );
toolbarSwitch.render();

document.querySelector( '.ui-switch' ).append( toolbarSwitch.element );
