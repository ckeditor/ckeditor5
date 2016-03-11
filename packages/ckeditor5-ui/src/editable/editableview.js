/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import View from '../view.js';
import CKEditorError from '../../utils/ckeditorerror.js';

/**
 * @memberOf ui.editable
 * @extends ui.View
 */
export default class EditableView extends View {
	/**
	 * The element which is the main editable element (usually the one with `contentEditable="true"`).
	 *
	 * @readonly
	 * @member {HTMLElement} ui.editable.EditableView#editableElement
	 */

	/**
	 * Sets the {@link #editableElement} property and applies necessary bindings to it.
	 *
	 * @param {HTMLElement} editableElement
	 */
	setEditableElement( editableElement ) {
		const bind = this.attributeBinder;

		if ( this.editableElement ) {
			throw new CKEditorError(
				'editableview-cannot-override-editableelement: The editableElement cannot be overriden.'
			);
		}

		this.editableElement = editableElement;

		this.applyTemplateToElement( editableElement, {
			on: {
				focus: () => {
					this.model.isFocused = true;
				},
				blur: () => {
					this.model.isFocused = false;
				}
			},

			attributes: {
				contentEditable: bind.to( 'isEditable' )
			}
		} );
	}
}
