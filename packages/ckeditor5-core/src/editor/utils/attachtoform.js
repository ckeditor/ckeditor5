/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import isFunction from '@ckeditor/ckeditor5-utils/src/lib/lodash/isFunction';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * @module core/editor/utils/attachtoform
 */

/**
 * Checks if editor is initialized on textarea element that belongs to a form. If yes - updates editor's element
 * contents before submitting the form.
 *
 * This helper requires {@link module:core/editor/utils/elementapimixin~ElementApi ElementApi interface}.
 *
 * @param {module:core/editor/editor~Editor} editor Editor instance.
 */
export default function attachToForm( editor ) {
	if ( !isFunction( editor.updateElement ) ) {
		/**
		 * {@link module:core/editor/utils/elementapimixin~ElementApi ElementApi interface} is required.
		 *
		 * @error attachtoform-missing-elementapi-interface
		 */
		throw new CKEditorError( 'attachtoform-missing-elementapi-interface: ElementApi interface is required.' );
	}

	const element = editor.element;

	// Only when replacing a textarea which is inside of a form element.
	if ( element && element.tagName.toLowerCase() === 'textarea' && element.form ) {
		let originalSubmit;
		const form = element.form;
		const onSubmit = () => editor.updateElement();

		// Replace the original form#submit() to call a custom submit function first.
		// Check if #submit is a function because the form might have an input named "submit".
		if ( isFunction( form.submit ) ) {
			originalSubmit = form.submit;

			form.submit = () => {
				onSubmit();
				originalSubmit.apply( form );
			};
		}

		// Update the replaced textarea with data before each form#submit event.
		form.addEventListener( 'submit', onSubmit );

		// Remove the submit listener and revert the original submit method on
		// editor#destroy.
		editor.on( 'destroy', () => {
			form.removeEventListener( 'submit', onSubmit );

			if ( originalSubmit ) {
				form.submit = originalSubmit;
			}
		} );
	}
}
