/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/labeledinput/labeledinputview
 */

import View from '../view';
import Template from '../template';
import uid from '@ckeditor/ckeditor5-utils/src/uid';

import LabelView from '../label/labelview';

/**
 * The labeled input view class.
 *
 * @extends module:ui/view~View
 */
export default class LabeledInputView extends View {
	/**
	 * Creates an instance of the labeled input view class.
	 *
	 * @param {module:utils/locale~Locale} locale The locale instance.
	 * @param {Function} InputView Constructor of the input view.
	 */
	constructor( locale, InputView ) {
		super( locale );

		const id = `ck-input-${ uid() }`;

		/**
		 * The text of the label.
		 *
		 * @observable
		 * @member {String} #label
		 */
		this.set( 'label' );

		/**
		 * The value of the input.
		 *
		 * @observable
		 * @member {String} #value
		 */
		this.set( 'value' );

		/**
		 * Controls whether the component is in read-only mode.
		 *
		 * @observable
		 * @member {Boolean} #isReadOnly
		 */
		this.set( 'isReadOnly', false );

		/**
		 * The label view.
		 *
		 * @member {module:ui/label/labelview~LabelView} #labelView
		 */
		this.labelView = this._createLabelView( id );

		/**
		 * The input view.
		 *
		 * @member {module:ui/view~View} #inputView
		 */
		this.inputView = this._createInputView( InputView, id );

		const bind = this.bindTemplate;

		this.template = new Template( {
			tag: 'div',
			attributes: {
				class: [
					bind.if( 'isReadOnly', 'ck-disabled' )
				]
			},
			children: [
				this.labelView,
				this.inputView
			]
		} );
	}

	/**
	 * Creates label view class instance and bind with view.
	 *
	 * @private
	 * @param {String} id Unique id to set as labelView#for attribute.
	 * @returns {module:ui/label/labelview~LabelView}
	 */
	_createLabelView( id ) {
		const labelView = new LabelView( this.locale );

		labelView.for = id;
		labelView.bind( 'text' ).to( this, 'label' );

		return labelView;
	}

	/**
	 * Creates input view class instance and bind with view.
	 *
	 * @private
	 * @param {Function} InputView Input view constructor.
	 * @param {String} id Unique id to set as inputView#id attribute.
	 * @returns {module:ui/inputtext/inputtextview~InputTextView}
	 */
	_createInputView( InputView, id ) {
		const inputView = new InputView( this.locale );

		inputView.id = id;
		inputView.bind( 'value' ).to( this );
		inputView.bind( 'isReadOnly' ).to( this );

		return inputView;
	}

	/**
	 * Moves the focus to the input and selects the value.
	 */
	select() {
		this.inputView.select();
	}

	/**
	 * Focuses the input.
	 */
	focus() {
		this.inputView.focus();
	}
}
