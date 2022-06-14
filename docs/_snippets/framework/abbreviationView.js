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
	constructor( locale, selectedText ) {
		super( locale );

		const t = locale.t;

		this.abbrInputView = this._createInput( 'abbreviation', selectedText );
		this.titleInputView = this._createInput( 'title' );
		this.saveButtonView = this._createButton( t( 'Save' ), icons.check, 'ck-button-save' );
		this.saveButtonView.type = 'submit';
		this.cancelButtonView = this._createButton( t( 'Cancel' ), icons.cancel, 'ck-button-cancel', 'cancel' );

		const classList = [ 'ck', 'ck-responsive-form', 'ck-vertical-form' ];

		this.setTemplate( {
			tag: 'form',
			attributes: {
				classList,
				tabindex: '-1',
				style: { 'padding': '2px' }
			},
			children: [ this.abbrInputView, this.titleInputView, this.saveButtonView, this.cancelButtonView ]
		} );
	}

	render() {
		super.render();

		submitHandler( {
			view: this
		} );
	}

	_createInput( inputType, selectedText ) {
		const t = this.locale.t;
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.label = t( `Add ${ inputType }` );
		if ( selectedText ) {
			labeledInput.fieldView.value = selectedText;
		}
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

		if ( eventName ) {
			button.delegate( 'execute' ).to( this, eventName );
		}

		return button;
	}
}
