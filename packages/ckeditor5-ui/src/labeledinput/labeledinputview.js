/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/labeledinput/labeledinputview
 */

import View from '../view';
import uid from '@ckeditor/ckeditor5-utils/src/uid';
import LabelView from '../label/labelview';
import '../../theme/components/labeledinput/labeledinput.css';

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

		const inputUid = `ck-input-${ uid() }`;
		const errorUid = `ck-error-${ uid() }`;

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
		 * The validation error text. When set, it will be displayed
		 * next to the {@link #inputView} as a typical validation error message.
		 * Set it to `null` to hide the message.
		 *
		 * **Note:** Setting this property to anything but `null` will automatically
		 * make the {@link module:ui/inputtext/inputtextview~InputTextView#hasError `hasError`}
		 * of the {@link #inputView} `true`.
		 *
		 * **Note:** Typing in the {@link #inputView} which fires the
		 * {@link module:ui/inputtext/inputtextview~InputTextView#event:input `input` event}
		 * resets this property back to `null`, indicating that the input field can be re–validated.
		 *
		 * @observable
		 * @member {String|null} #errorText
		 */
		this.set( 'errorText', null );

		/**
		 * The label view.
		 *
		 * @member {module:ui/label/labelview~LabelView} #labelView
		 */
		this.labelView = this._createLabelView( inputUid );

		/**
		 * The input view.
		 *
		 * @member {module:ui/inputtext/inputtextview~InputTextView} #inputView
		 */
		this.inputView = this._createInputView( InputView, inputUid, errorUid );

		/**
		 * The error view for the {@link #inputView}.
		 *
		 * @member {module:ui/view~View} #errorView
		 */
		this.errorView = this._createErrorView( errorUid );

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-labeled-input',
					bind.if( 'isReadOnly', 'ck-disabled' )
				]
			},
			children: [
				this.labelView,
				this.inputView,
				this.errorView
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
	 * @param {String} inputUid Unique id to set as inputView#id attribute.
	 * @param {String} errorUid Unique id of the error for the input's `aria-describedby` attribute.
	 * @returns {module:ui/inputtext/inputtextview~InputTextView}
	 */
	_createInputView( InputView, inputUid, errorUid ) {
		const inputView = new InputView( this.locale, errorUid );

		inputView.id = inputUid;
		inputView.ariaDesribedById = errorUid;
		inputView.bind( 'value' ).to( this );
		inputView.bind( 'isReadOnly' ).to( this );
		inputView.bind( 'hasError' ).to( this, 'errorText', value => !!value );

		inputView.on( 'input', () => {
			// UX: Make the error text disappear and disable the error indicator as the user
			// starts fixing the errors.
			this.errorText = null;
		} );

		return inputView;
	}

	/**
	 * Creates the error view instance.
	 *
	 * @private
	 * @param {String} errorUid Unique id of the error, shared with the input's `aria-describedby` attribute.
	 * @returns {module:ui/view~View}
	 */
	_createErrorView( errorUid ) {
		const errorView = new View( this.locale );
		const bind = this.bindTemplate;

		errorView.setTemplate( 				{
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-labeled-input__error',
					bind.if( 'errorText', 'ck-hidden', value => !value )
				],
				id: errorUid
			},
			children: [
				{
					text: bind.to( 'errorText' )
				}
			]
		} );

		return errorView;
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
