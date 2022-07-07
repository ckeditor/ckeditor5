/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	View,
	LabeledFieldView,
	createLabeledInputText,
	ButtonView,
	submitHandler
} from '@ckeditor/ckeditor5-ui';
import { icons } from '@ckeditor/ckeditor5-core';

// [cancel button]
//		-> clicked
//			-> fires ButtonView#execute
//				-> delegated to ForView#cancel
//					-> FormView#cancel is fired (and AbbrUI can listen to it).

// [submit button]
//		-> clicked
//			-> fires ButtonView#execute -> ignored
//			-> fires <form> submit in DOM
//				-> submit handler listens to <form> submit event
//					-> it cancels it to NOT reload the web page
//						-> it fires FormView#submit instead
//							-> AbbrUI can listen to this event

export default class FormView extends View {
	constructor( locale ) {
		super( locale );

		const t = locale.t;

		this.abbrInputView = this._createInput( t( 'Add abbreviation' ) );
		this.titleInputView = this._createInput( t( 'Add title' ) );

		this.saveButtonView = this._createButton( t( 'Save' ), icons.check, 'ck-button-save' );
		// Submit type of the button will trigger the submit event on entire form when clicked (see submitHandler() in render() below).
		this.saveButtonView.type = 'submit';

		this.cancelButtonView = this._createButton( t( 'Cancel' ), icons.cancel, 'ck-button-cancel' );

		// TODO: Comment
		this.cancelButtonView.delegate( 'execute' ).to( this, 'cancel' );

		this.setTemplate( {
			tag: 'form',
			attributes: {
				class: [ 'ck', 'ck-abbr-form' ],
				tabindex: '-1'
			},
			children: [ this.abbrInputView, this.titleInputView, this.saveButtonView, this.cancelButtonView ]
		} );
	}

	render() {
		super.render();

		// Submit the form when the user clicked the save button or pressed enter in the input.
		submitHandler( {
			view: this
		} );
	}

	_createInput( label ) {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.label = label;

		return labeledInput;
	}

	_createButton( label, icon, className ) {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			icon,
			tooltip: true,
			class: className
		} );

		return button;
	}
}
