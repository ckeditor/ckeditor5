/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/editor/utils/attachtoform
 */

import { isFunction } from 'lodash-es';

import { CKEditorError } from '@ckeditor/ckeditor5-utils';

import type { default as Editor, EditorDestroyEvent } from '../editor';
import type { ElementApi } from './elementapimixin';

/**
 * Checks if the editor is initialized on a `<textarea>` element that belongs to a form. If yes, it updates the editor's element
 * content before submitting the form.
 *
 * This helper requires the {@link module:core/editor/utils/elementapimixin~ElementApi ElementApi interface}.
 *
 * @param editor Editor instance.
 */
export default function attachToForm( editor: Editor & ElementApi ): void {
	if ( !isFunction( editor.updateSourceElement ) ) {
		/**
		 * The editor passed to `attachToForm()` must implement the
		 * {@link module:core/editor/utils/elementapimixin~ElementApi} interface.
		 *
		 * @error attachtoform-missing-elementapi-interface
		 */
		throw new CKEditorError(
			'attachtoform-missing-elementapi-interface',
			editor
		);
	}

	const sourceElement = editor.sourceElement;

	// Only when replacing a textarea which is inside of a form element.
	if ( isTextArea( sourceElement ) && sourceElement.form ) {
		let originalSubmit: () => void;
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
		editor.on<EditorDestroyEvent>( 'destroy', () => {
			form.removeEventListener( 'submit', onSubmit );

			if ( originalSubmit ) {
				form.submit = originalSubmit;
			}
		} );
	}
}

function isTextArea( sourceElement: HTMLElement | undefined ): sourceElement is HTMLTextAreaElement {
	return !!sourceElement && sourceElement.tagName.toLowerCase() === 'textarea';
}
