/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, ButtonView, SwitchButtonView, checkIcon, Locale, ToolbarView */

const locale = new Locale();

const buttons = [];
const toolbar = new ToolbarView( locale );
const toolbarButton = new ButtonView();
toolbarButton.set( {
	label: 'Button',
	withText: true
} );
const toolbarSwitchButton = new SwitchButtonView();
toolbarSwitchButton.set( {
	label: 'Switch button ',
	withText: true
} );
const toolbarIconButton = new ButtonView();
toolbarIconButton.set( {
	label: 'Icon button',
	icon: checkIcon,
	tooltip: true
} );

buttons.push( toolbarButton, toolbarSwitchButton, toolbarIconButton );

buttons.forEach( c => toolbar.items.add( c ) );
toolbar.class = 'ck-editor-toolbar ck-reset_all';

toolbar.render();

document.getElementById( 'ui-toolbar' ).appendChild( toolbar.element );

toolbarSwitchButton.on( 'execute', () => {
	toolbarSwitchButton.isOn ? toolbarSwitchButton.isOn = false : toolbarSwitchButton.isOn = true;
} );
