/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/labeledview/creators
 */

import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

export function labeledInputCreator( labeledView, viewUid, statusUid ) {
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

export function labeledDropdownCreator( labeledView, viewUid, statusUid ) {
	const dropdownView = createDropdown( labeledView.locale );

	dropdownView.set( {
		id: viewUid,
		ariaDescribedById: statusUid
	} );

	dropdownView.bind( 'isEnabled' ).to( labeledView );
	dropdownView.bind( 'hasError' ).to( labeledView, 'errorText', value => !!value );

	return dropdownView;
}
