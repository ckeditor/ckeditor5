/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	ClassicEditor,
	Essentials,
	IconCheck,
	ButtonView,
	ToolbarView,
	TooltipManager,
	Locale
} from 'ckeditor5';

const locale = new Locale();

const actionButton = new ButtonView();
actionButton.set( {
	label: 'Action button',
	withText: true,
	class: 'ck-button-action'
} );
actionButton.render();

const roundedButton = new ButtonView();
roundedButton.set( {
	label: 'Rounded button',
	withText: true,
	class: 'ck-rounded-corners'
} );
roundedButton.render();

const boldButton = new ButtonView();
boldButton.set( {
	label: 'Bold button',
	withText: true,
	class: 'ck-button-bold'
} );
boldButton.render();

const saveButton = new ButtonView();
saveButton.set( {
	label: 'Save',
	withText: false,
	icon: IconCheck,
	class: 'ck-button-save'
} );
saveButton.render();

const keystrokeButton = new ButtonView();
keystrokeButton.set( {
	label: 'Italic',
	withText: true,
	withKeystroke: true,
	keystroke: 'Ctrl+I'
} );
keystrokeButton.render();

const tooltipButton = new ButtonView();
tooltipButton.set( {
	label: 'Tooltip button',
	withText: true,
	tooltip: 'The content of the tooltip',
	tooltipPosition: 's'
} );
tooltipButton.render();

const buttons = [ actionButton, roundedButton, boldButton, saveButton, keystrokeButton, tooltipButton ];

const toolbarButtons = new ToolbarView( locale );
buttons.forEach( button => toolbarButtons.items.add( button ) );
toolbarButtons.render();

document.querySelector( '.ui-button' ).append( toolbarButtons.element );

ClassicEditor
	.create( document.querySelector( '#ui-button-editor' ), {
		plugins: [ Essentials ]
	} )
	.then( editor => {
		window.tooltipManager = new TooltipManager( editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
