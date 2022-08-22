/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, ButtonView, SwitchButtonView, createDropdown,
addToolbarToDropdown, checkIcon, Locale, ToolbarView, ToolbarSeparatorView, ToolbarLineBreakView, View */

const locale = new Locale();

const wrappedButtons = [];
const wrappedToolbar = new ToolbarView( locale );
const wrappedToolbarButton = new ButtonView();
wrappedToolbarButton.set( {
	label: 'A button',
	withText: true
} );
const wrappedToolbarSwitchButton = new SwitchButtonView();
wrappedToolbarSwitchButton.set( {
	label: 'A switch button ',
	withText: true
} );
const wrappedToolbarIconButton = new ButtonView();
wrappedToolbarIconButton.set( {
	label: 'An icon button',
	icon: checkIcon,
	tooltip: true
} );

wrappedButtons.push( wrappedToolbarIconButton, wrappedToolbarButton, wrappedToolbarSwitchButton );

wrappedButtons.forEach( c => wrappedToolbar.items.add( c ) );

wrappedToolbar.render();

wrappedToolbar.element.style.width = '150px';

document.getElementById( 'ui-toolbar-wrapped' ).appendChild( wrappedToolbar.element );

wrappedToolbarSwitchButton.on( 'execute', () => {
	wrappedToolbarSwitchButton.isOn ? wrappedToolbarSwitchButton.isOn = false : wrappedToolbarSwitchButton.isOn = true;
} );

// --- Compact toolbar ------------------------------------------------------------

const buttonsCompact = [];
const compactToolbar = new ToolbarView( locale );

const compactToolbarButton = new ButtonView();
compactToolbarButton.set( {
	label: 'A button',
	withText: true
} );
const compactToolbarSwitchButton = new SwitchButtonView();
compactToolbarSwitchButton.set( {
	label: 'A switch button ',
	withText: true
} );
const compactToolbarIconButton = new ButtonView();
compactToolbarIconButton.set( {
	label: 'An icon button',
	icon: checkIcon,
	tooltip: true
} );

buttonsCompact.push( compactToolbarButton, compactToolbarSwitchButton, compactToolbarIconButton );
buttonsCompact.forEach( c => compactToolbar.items.add( c ) );
compactToolbar.isCompact = true;
compactToolbar.render();
document.getElementById( 'ui-toolbar-compact' ).appendChild( compactToolbar.element );

compactToolbarSwitchButton.on( 'execute', () => {
	compactToolbarSwitchButton.isOn ? compactToolbarSwitchButton.isOn = false : compactToolbarSwitchButton.isOn = true;
} );

// --- Toolbar ------------------------------------------------------------

const buttons = [];
const toolbar = new ToolbarView( locale );

const toolbarButton = new ButtonView();
toolbarButton.set( {
	label: 'A button',
	withText: true
} );
const toolbarSwitchButton = new SwitchButtonView();
toolbarSwitchButton.set( {
	label: 'A switch button ',
	withText: true
} );
const toolbarIconButton = new ButtonView();
toolbarIconButton.set( {
	label: 'An icon button',
	icon: checkIcon,
	tooltip: true
} );
const toolbarSeparator = new ToolbarSeparatorView();
const toolbarLineBreak = new ToolbarLineBreakView();
buttons.push( toolbarButton, toolbarSeparator, toolbarSwitchButton, toolbarLineBreak, toolbarIconButton );

buttons.forEach( c => toolbar.items.add( c ) );
toolbar.render();
document.getElementById( 'ui-toolbar-lines' ).appendChild( toolbar.element );

toolbarSwitchButton.on( 'execute', () => {
	toolbarSwitchButton.isOn ? toolbarSwitchButton.isOn = false : toolbarSwitchButton.isOn = true;
} );
