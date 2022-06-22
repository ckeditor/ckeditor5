/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	View,
	LabeledFieldView,
	createLabeledInputText,
	ButtonView,
	submitHandler,
	FocusCycler
} from '@ckeditor/ckeditor5-ui';
import { FocusTracker, KeystrokeHandler } from '@ckeditor/ckeditor5-utils';
import { icons } from '@ckeditor/ckeditor5-core';

export default class FormView extends View {
	constructor( locale ) {
		super( locale );

		const t = locale.t;
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this.abbrInputView = this._createInput( 'abbreviation' );
		this.titleInputView = this._createInput( 'title' );
		this.saveButtonView = this._createButton( t( 'Save' ), icons.check, 'ck-button-save' );
		this.saveButtonView.type = 'submit';
		this.cancelButtonView = this._createButton( t( 'Cancel' ), icons.cancel, 'ck-button-cancel', 'cancel' );

		this.childViews = this.createCollection( [
			this.abbrInputView,
			this.titleInputView,
			this.saveButtonView,
			this.cancelButtonView
		] );

		this._focusCycler = new FocusCycler( {
			focusables: this.childViews,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );
		const classList = [ 'ck', 'ck-responsive-form', 'ck-vertical-form' ];

		this.setTemplate( {
			tag: 'form',
			attributes: {
				classList,
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

		this.childViews._items.forEach( v => {
			// Register the view in the focus tracker.
			this.focusTracker.add( v.element );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );
	}

	destroy() {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	focus() {
		this._focusCycler.focusFirst();
	}

	_createInput( inputType ) {
		const t = this.locale.t;

		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.label = t( `Add ${ inputType }` );

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
