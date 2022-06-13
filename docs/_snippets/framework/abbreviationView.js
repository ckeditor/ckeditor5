/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import {
	View,
	LabeledFieldView,
	createLabeledInputText,
	ButtonView
} from '@ckeditor/ckeditor5-ui';
import { icons } from '@ckeditor/ckeditor5-core';

export default class FormView extends View {
	constructor( locale ) {
		super( locale );

		const t = locale.t;
		const bind = this.bindTemplate;
		this.abbrInputView = this._createInput( 'abbreviation' );
		this.titleInputView = this._createInput( 'title' );
		this.saveButtonView = this._createButton( t( 'Save' ), icons.check, 'ck-button-save' );
		this.saveButtonView.type = 'submit';
		this.cancelButtonView = this._createButton( t( 'Cancel' ), icons.cancel, 'ck-button-cancel', 'cancel' );

		const classList = [ 'ck', 'ck-responsive-form' ];

		this.setTemplate( {
			tag: 'form',
			attributes: {
				classList,
				tabindex: '-1'
			},
			children: this.children
		} );
	}

	render() {
		super.render();

		// submitHandler( {
		// 	view: this
		// } );

		const childViews = [
			this.abbrInputView,
			this.titleInputView,
			this.saveButtonView,
			this.cancelButtonView
		];

		// childViews.forEach( v => {
		// 	// Register the view as focusable.
		// 	this._focusables.add( v );

		// 	// Register the view in the focus tracker.
		// 	this.focusTracker.add( v.element );
		// } );

		// // Start listening for the keystrokes coming from #element.
		// this.keystrokes.listenTo( this.element );
	}

	_createInput( inputType ) {
		const t = this.locale.t;
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.label = t( `Add ${ inputType }` );

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
