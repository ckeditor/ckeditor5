/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, ButtonView */

// --- Button options ------------------------------------------------------------
const actionButton = new ButtonView();
actionButton.set( {
	label: 'Action button',
	withText: true,
	class: 'ck-button-action'
} );
actionButton.render();
document.getElementById( 'action-button' ).append( actionButton.element );

const roundedButton = new ButtonView();
roundedButton.set( {
	label: 'Button with rounded corners',
	withText: true,
	class: 'ck-rounded-corners'
} );
roundedButton.render();
document.getElementById( 'rounded-button' ).append( roundedButton.element );

const boldButton = new ButtonView();
boldButton.set( {
	label: 'Bold button',
	withText: true,
	class: 'ck-button-bold'
} );
boldButton.render();
document.getElementById( 'bold-button' ).append( boldButton.element );

const disabledButton = new ButtonView();
disabledButton.set( {
	isEnabled: false,
	label: 'Disabled button',
	withText: true
} );
disabledButton.render();
document.getElementById( 'disabled-button' ).append( disabledButton.element );

const onButton = new ButtonView();
onButton.set( {
	isOn: true,
	label: 'Pressed button',
	withText: true
} );
onButton.render();
document.getElementById( 'on-button' ).append( onButton.element );

const customButton = new ButtonView();
customButton.set( {
	label: 'Custom styles button',
	withText: true,
	labelStyle: 'color: white; font-family: "Roboto Mono", serif'
} );

customButton.render();
customButton.element.style = 'background-color: darkred';

document.getElementById( 'custom-button' ).append( customButton.element );

