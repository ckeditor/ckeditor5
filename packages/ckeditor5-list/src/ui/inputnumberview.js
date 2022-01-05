/**
 * @license Copyright (c) 2003-2022, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/ui/inputnumberview
 */

import { InputView } from 'ckeditor5/src/ui';

/**
 * The number input view class.
 *
 * @protected
 * @extends module:ui/input/inputview~InputView
 */
export default class InputNumberView extends InputView {
	/**
	 * Creates an instance of the input number view.
	 *
	 * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param {Object} [options] Options of the input.
	 * @param {Number} [options.min] The value of the `min` DOM attribute (the lowest accepted value).
	 * @param {Number} [options.max] The value of the `max` DOM attribute (the highest accepted value).
	 * @param {Number} [options.step] The value of the `step` DOM attribute.
	 */
	constructor( locale, { min, max, step } = {} ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * The value of the `min` DOM attribute (the lowest accepted value) set on the {@link #element}.
		 *
		 * @observable
		 * @default undefined
		 * @member {Number} #min
		 */
		this.set( 'min', min );

		/**
		 * The value of the `max` DOM attribute (the highest accepted value) set on the {@link #element}.
		 *
		 * @observable
		 * @default undefined
		 * @member {Number} #max
		 */
		this.set( 'max', max );

		/**
		 * The value of the `step` DOM attribute set on the {@link #element}.
		 *
		 * @observable
		 * @default undefined
		 * @member {Number} #step
		 */
		this.set( 'step', step );

		this.extendTemplate( {
			attributes: {
				type: 'number',
				class: [
					'ck-input-number'
				],
				min: bind.to( 'min' ),
				max: bind.to( 'max' ),
				step: bind.to( 'step' )
			}
		} );
	}
}

/**
 * A helper for creating labeled number inputs.
 *
 * It creates an instance of a {@link module:list/ui/inputnumberview~InputNumberView input number} that is
 * logically related to a {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView labeled view} in DOM.
 *
 * The helper does the following:
 *
 * * It sets input's `id` and `ariaDescribedById` attributes.
 * * It binds input's `isReadOnly` to the labeled view.
 * * It binds input's `hasError` to the labeled view.
 * * It enables a logic that cleans up the error when user starts typing in the input.
 *
 * Usage:
 *
 *		const labeledInputView = new LabeledFieldView( locale, createLabeledInputNumber );
 *		console.log( labeledInputView.fieldView ); // A number input instance.
 *
 * @protected
 * @param {module:ui/labeledfield/labeledfieldview~LabeledFieldView} labeledFieldView The instance of the labeled field view.
 * @param {String} viewUid An UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#labelView labeled view's label} and the input.
 * @param {String} statusUid An UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#statusView labeled view's status} and the input.
 * @returns {module:ui/inputtext/inputtextview~InputTextView} The input text view instance.
 */
export function createLabeledInputNumber( labeledFieldView, viewUid, statusUid ) {
	const inputView = new InputNumberView( labeledFieldView.locale );

	inputView.set( {
		id: viewUid,
		ariaDescribedById: statusUid,
		inputMode: 'numeric'
	} );

	inputView.bind( 'isReadOnly' ).to( labeledFieldView, 'isEnabled', value => !value );
	inputView.bind( 'hasError' ).to( labeledFieldView, 'errorText', value => !!value );

	inputView.on( 'input', () => {
		// UX: Make the error text disappear and disable the error indicator as the user
		// starts fixing the errors.
		labeledFieldView.errorText = null;
	} );

	labeledFieldView.bind( 'isEmpty', 'isFocused', 'placeholder' ).to( inputView );

	return inputView;
}
