/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, ButtonView */

// --- Button options ------------------------------------------------------------
const actionButton = new ButtonView();
actionButton.set( {
	label: 'An action button',
	withText: true,
	class: 'ck-button-action'
} );
actionButton.render();
document.getElementById( 'action-button' ).append( actionButton.element );

const roundedButton = new ButtonView();
roundedButton.set( {
	label: 'A button with rounded corners',
	withText: true,
	class: 'ck-rounded-corners'
} );
roundedButton.render();
document.getElementById( 'rounded-button' ).append( roundedButton.element );

const boldButton = new ButtonView();
boldButton.set( {
	label: 'A bold button',
	withText: true,
	class: 'ck-button-bold'
} );
boldButton.render();
document.getElementById( 'bold-button' ).append( boldButton.element );

const disabledButton = new ButtonView();
disabledButton.set( {
	isEnabled: false,
	label: 'A disabled button',
	withText: true
} );
disabledButton.render();
document.getElementById( 'disabled-button' ).append( disabledButton.element );

const onButton = new ButtonView();
onButton.set( {
	isOn: true,
	label: 'A pressed button',
	withText: true
} );
onButton.render();
document.getElementById( 'on-button' ).append( onButton.element );

