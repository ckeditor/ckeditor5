/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/labeledview/utils
 */

import InputTextView from '../inputtext/inputtextview';
import { createDropdown } from '../dropdown/utils';

/**
 * A helper for creating labeled dropdowns.
 *
 * It creates an instance of a {@link module:ui/inputtext/inputtextview~InputTextView input text} that is
 * logically related to a {@link module:ui/labeledview/labeledview~LabeledView labeled view} in DOM.
 *
 * The helper does the following:
 *
 * * It sets input's `id` and `ariaDescribedById` attributes.
 * * It binds input's `isReadOnly` to the labeled view.
 * * It binds input's `hasError` to the labeled view.
 * * It enables a logic that cleans up the error when user starts typing in the input..
 *
 * Usage:
 *
 *		const labeledInputView = new LabeledView( locale, createLabeledDropdown );
 *		console.log( labeledInputView.view ); // An input instance.
 *
 * @param {module:ui/labeledview/labeledview~LabeledView} labeledView The instance of the labeled view.
 * @param {String} viewUid An UID string that allows DOM logical connection between the
 * {@link module:ui/labeledview/labeledview~LabeledView#labelView labeled view's label} and the input.
 * @param {String} statusUid An UID string that allows DOM logical connection between the
 * {@link module:ui/labeledview/labeledview~LabeledView#statusView labeled view's status} and the input.
 * @returns {module:ui/inputtext/inputtextview~InputTextView} The input text view instance.
 */
export function createLabeledInputText( labeledView, viewUid, statusUid ) {
	const inputView = new InputTextView( labeledView.locale );

	inputView.set( {
		id: viewUid,
		ariaDescribedById: statusUid
	} );

	inputView.bind( 'isReadOnly' ).to( labeledView, 'isEnabled', value => !value );
	inputView.bind( 'hasError' ).to( labeledView, 'errorText', value => !!value );

	inputView.on( 'input', () => {
		// UX: Make the error text disappear and disable the error indicator as the user
		// starts fixing the errors.
		labeledView.errorText = null;
	} );

	return inputView;
}

/**
 * A helper for creating labeled dropdowns.
 *
 * It creates an instance of a {@link module:ui/dropdown/dropdownview~DropdownView dropdown} that is
 * logically related to a {@link module:ui/labeledview/labeledview~LabeledView labeled view}.
 *
 * The helper does the following:
 *
 * * It sets dropdown's `id` and `ariaDescribedById` attributes.
 * * It binds input's `isEnabled` to the labeled view.
 *
 * Usage:
 *
 *		const labeledInputView = new LabeledView( locale, createLabeledDropdown );
 *		console.log( labeledInputView.view ); // A dropdown instance.
 *
 * @param {module:ui/labeledview/labeledview~LabeledView} labeledView The instance of the labeled view.
 * @param {String} viewUid An UID string that allows DOM logical connection between the
 * {@link module:ui/labeledview/labeledview~LabeledView#labelView labeled view label} and the dropdown.
 * @param {String} statusUid An UID string that allows DOM logical connection between the
 * {@link module:ui/labeledview/labeledview~LabeledView#statusView labeled view status} and the dropdown.
 * @returns {module:ui/dropdown/dropdownview~DropdownView} The dropdown view instance.
 */
export function createLabeledDropdown( labeledView, viewUid, statusUid ) {
	const dropdownView = createDropdown( labeledView.locale );

	dropdownView.set( {
		id: viewUid,
		ariaDescribedById: statusUid
	} );

	dropdownView.bind( 'isEnabled' ).to( labeledView );

	return dropdownView;
}
