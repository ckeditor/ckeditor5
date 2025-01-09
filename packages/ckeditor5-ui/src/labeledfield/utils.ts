/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/labeledfield/utils
 */

import InputTextView from '../inputtext/inputtextview.js';
import InputNumberView from '../inputnumber/inputnumberview.js';
import TextareaView from '../textarea/textareaview.js';
import { createDropdown } from '../dropdown/utils.js';

import type DropdownView from '../dropdown/dropdownview.js';
import type { InputViewInputEvent } from '../input/inputview.js';
import type { LabeledFieldViewCreator } from './labeledfieldview.js';

/**
 * A helper for creating labeled inputs.
 *
 * It creates an instance of a {@link module:ui/inputtext/inputtextview~InputTextView input text} that is
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
 * ```ts
 * const labeledInputView = new LabeledFieldView( locale, createLabeledInputText );
 * console.log( labeledInputView.fieldView ); // A text input instance.
 * ```
 *
 * @param labeledFieldView The instance of the labeled field view.
 * @param viewUid A UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#labelView labeled view's label} and the input.
 * @param statusUid A UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#statusView labeled view's status} and the input.
 * @returns The input text view instance.
 */
const createLabeledInputText: LabeledFieldViewCreator<InputTextView> = ( labeledFieldView, viewUid, statusUid ) => {
	const inputView = new InputTextView( labeledFieldView.locale );

	inputView.set( {
		id: viewUid,
		ariaDescribedById: statusUid
	} );

	inputView.bind( 'isReadOnly' ).to( labeledFieldView, 'isEnabled', value => !value );
	inputView.bind( 'hasError' ).to( labeledFieldView, 'errorText', value => !!value );

	inputView.on<InputViewInputEvent>( 'input', () => {
		// UX: Make the error text disappear and disable the error indicator as the user
		// starts fixing the errors.
		labeledFieldView.errorText = null;
	} );

	labeledFieldView.bind( 'isEmpty', 'isFocused', 'placeholder' ).to( inputView );

	return inputView;
};

/**
 * A helper for creating labeled number inputs.
 *
 * It creates an instance of a {@link module:ui/inputnumber/inputnumberview~InputNumberView input number} that is
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
 * ```ts
 * const labeledInputView = new LabeledFieldView( locale, createLabeledInputNumber );
 * console.log( labeledInputView.fieldView ); // A number input instance.
 * ```
 *
 * @param labeledFieldView The instance of the labeled field view.
 * @param viewUid A UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#labelView labeled view's label} and the input.
 * @param statusUid A UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#statusView labeled view's status} and the input.
 * @returns The input number view instance.
 */
const createLabeledInputNumber: LabeledFieldViewCreator<InputNumberView> = ( labeledFieldView, viewUid, statusUid ) => {
	const inputView = new InputNumberView( labeledFieldView.locale );

	inputView.set( {
		id: viewUid,
		ariaDescribedById: statusUid,
		inputMode: 'numeric'
	} );

	inputView.bind( 'isReadOnly' ).to( labeledFieldView, 'isEnabled', value => !value );
	inputView.bind( 'hasError' ).to( labeledFieldView, 'errorText', value => !!value );

	inputView.on<InputViewInputEvent>( 'input', () => {
		// UX: Make the error text disappear and disable the error indicator as the user
		// starts fixing the errors.
		labeledFieldView.errorText = null;
	} );

	labeledFieldView.bind( 'isEmpty', 'isFocused', 'placeholder' ).to( inputView );

	return inputView;
};

/**
 * A helper for creating labeled textarea.
 *
 * It creates an instance of a {@link module:ui/textarea/textareaview~TextareaView textarea} that is
 * logically related to a {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView labeled view} in DOM.
 *
 * The helper does the following:
 *
 * * It sets textarea's `id` and `ariaDescribedById` attributes.
 * * It binds textarea's `isReadOnly` to the labeled view.
 * * It binds textarea's `hasError` to the labeled view.
 * * It enables a logic that cleans up the error when user starts typing in the textarea.
 *
 * Usage:
 *
 * ```ts
 * const labeledTextarea = new LabeledFieldView( locale, createLabeledTextarea );
 * console.log( labeledTextarea.fieldView ); // A textarea instance.
 * ```
 *
 * @param labeledFieldView The instance of the labeled field view.
 * @param viewUid A UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#labelView labeled view's label} and the textarea.
 * @param statusUid A UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#statusView labeled view's status} and the textarea.
 * @returns The textarea view instance.
 */
const createLabeledTextarea: LabeledFieldViewCreator<TextareaView> = ( labeledFieldView, viewUid, statusUid ) => {
	const textareaView = new TextareaView( labeledFieldView.locale );

	textareaView.set( {
		id: viewUid,
		ariaDescribedById: statusUid
	} );

	textareaView.bind( 'isReadOnly' ).to( labeledFieldView, 'isEnabled', value => !value );
	textareaView.bind( 'hasError' ).to( labeledFieldView, 'errorText', value => !!value );

	textareaView.on<InputViewInputEvent>( 'input', () => {
		// UX: Make the error text disappear and disable the error indicator as the user
		// starts fixing the errors.
		labeledFieldView.errorText = null;
	} );

	labeledFieldView.bind( 'isEmpty', 'isFocused', 'placeholder' ).to( textareaView );

	return textareaView;
};

/**
 * A helper for creating labeled dropdowns.
 *
 * It creates an instance of a {@link module:ui/dropdown/dropdownview~DropdownView dropdown} that is
 * logically related to a {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView labeled field view}.
 *
 * The helper does the following:
 *
 * * It sets dropdown's `id` and `ariaDescribedById` attributes.
 * * It binds input's `isEnabled` to the labeled view.
 *
 * Usage:
 *
 * ```ts
 * const labeledInputView = new LabeledFieldView( locale, createLabeledDropdown );
 * console.log( labeledInputView.fieldView ); // A dropdown instance.
 * ```
 *
 * @param labeledFieldView The instance of the labeled field view.
 * @param viewUid A UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#labelView labeled view label} and the dropdown.
 * @param statusUid A UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#statusView labeled view status} and the dropdown.
 * @returns The dropdown view instance.
 */
const createLabeledDropdown: LabeledFieldViewCreator<DropdownView> = ( labeledFieldView, viewUid, statusUid ) => {
	const dropdownView = createDropdown( labeledFieldView.locale );

	dropdownView.set( {
		id: viewUid,
		ariaDescribedById: statusUid
	} );

	dropdownView.bind( 'isEnabled' ).to( labeledFieldView );

	return dropdownView;
};

export {
	createLabeledInputNumber,
	createLabeledInputText,
	createLabeledTextarea,
	createLabeledDropdown
};
