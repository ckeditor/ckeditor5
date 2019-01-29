/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { isFunction } from 'lodash-es';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * @module core/editor/utils/attachtoform
 */

/**
 * Checks if the editor is initialized on a `<textarea>` element that belongs to a form. If yes, it updates the editor's element
 * content before submitting the form.
 *
 * This helper requires the {@link module:core/editor/utils/elementapimixin~ElementApi ElementApi interface}.
 *
 * @param {module:core/editor/editor~Editor} editor Editor instance.
 */
export default function attachToForm( editor ) {
	if ( !isFunction( editor.updateSourceElement ) ) {
		/**
		 * The editor passed to `attachToForm()` must implement the
		 * {@link module:core/editor/utils/elementapimixin~ElementApi} interface.
		 *
		 * @error attachtoform-missing-elementapi-interface
		 */
		throw new CKEditorError( 'attachtoform-missing-elementapi-interface: Editor passed to attachToForm() must implement ElementApi.' );
	}

	const sourceElement = editor.sourceElement;

	// Only when replacing a textarea which is inside of a form element.
	if ( sourceElement && sourceElement.tagName.toLowerCase() === 'textarea' && sourceElement.form ) {
		let originalSubmit;
		const form = sourceElement.form;
		const onSubmit = () => editor.updateSourceElement();

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
