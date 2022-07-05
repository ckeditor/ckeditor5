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

export default class FormView extends View {
	constructor( locale ) {
		super( locale );

		const t = locale.t;

		this.abbrInputView = this._createInput( 'abbreviation' );
		this.titleInputView = this._createInput( 'title' );
		this.saveButtonView = this._createButton( t( 'Save' ), icons.check, 'ck-button-save', 'submit' );
		this.cancelButtonView = this._createButton( t( 'Cancel' ), icons.cancel, 'ck-button-cancel', 'cancel' );

		this.childViews = this.createCollection( [
			this.abbrInputView,
			this.titleInputView,
			this.saveButtonView,
			this.cancelButtonView
		] );

		this.setTemplate( {
			tag: 'form',
			attributes: {
				class: [ 'ck', 'ck-responsive-form' ],
				tabindex: '-1',
				style: { 'padding': '2px' }
			},
			children: this.childViews
		} );
	}

	render() {
		super.render();

		submitHandler( {
			view: this
		} );
	}

	focus() {
		this.childViews.first.focus();
	}

	_createInput( inputName ) {
		const t = this.locale.t;

		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.label = t( `Add ${ inputName }` );

		labeledInput.extendTemplate( {
			attributes: {
				style: {
					'padding': '2px',
					'padding-top': '6px'
				}
			}
		} );

		return labeledInput;
	}

	_createButton( label, icon, className, eventName ) {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			icon,
			tooltip: true
		} );

		button.extendTemplate( {
			attributes: {
				class: className
			}
		} );

		button.delegate( 'execute' ).to( this, eventName );

		return button;
	}
}
