/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	View,
	LabeledFieldView,
	createLabeledInputText,
	ButtonView,
	submitHandler
} from '@ckeditor/ckeditor5-ui';
import { IconCheck, IconCancel } from '@ckeditor/ckeditor5-icons';

export default class FormView extends View {
	constructor( locale ) {
		super( locale );

		const t = locale.t;

		this.abbrInputView = this._createInput( t( 'Add abbreviation' ) );
		this.titleInputView = this._createInput( t( 'Add title' ) );

		this.saveButtonView = this._createButton( t( 'Save' ), IconCheck, 'ck-button-save' );
		// Set the type to 'submit', which will trigger the submit event on entire form
		// when clicked (see submitHandler() in render() below).
		this.saveButtonView.type = 'submit';

		this.cancelButtonView = this._createButton( t( 'Cancel' ), IconCancel, 'ck-button-cancel' );

		// Delegate ButtonView#execute to FormView#cancel
		this.cancelButtonView.delegate( 'execute' ).to( this, 'cancel' );

		this.childViews = this.createCollection( [
			this.abbrInputView,
			this.titleInputView,
			this.saveButtonView,
			this.cancelButtonView
		] );

		this.setTemplate( {
			tag: 'form',
			attributes: {
				class: [ 'ck', 'ck-abbr-form' ],
				tabindex: '-1'
			},
			children: this.childViews
		} );
	}

	render() {
		super.render();

		// Submit the form when the user clicked the save button or pressed enter in the input.
		submitHandler( {
			view: this
		} );
	}

	focus() {
		this.childViews.first.focus();
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
