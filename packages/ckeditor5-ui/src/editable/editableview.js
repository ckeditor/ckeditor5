/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import View from '../ui/view.js';
import CKEditorError from '../ckeditorerror.js';

export default class EditableView extends View {
	/**
	 * The element which is the main editable element (usually the one with `contentEditable="true"`).
	 *
	 * @readonly
	 * @property {HTMLElement} editableElement
	 */

	setEditableElement( editableElement ) {
		if ( this.editableElement ) {
			throw new CKEditorError(
				'editableview-cannot-override-editableelement: The editableElement cannot be overriden.'
			);
		}

		this.editableElement = editableElement;

		this.applyTemplateToElement( editableElement, {
			// This shouldn't be necessary here (#202).
			tag: 'div',

			on: {
				focus: () => {
					this.model.isFocused = true;
				},
				blur: () => {
					this.model.isFocused = false;
				}
			},

			attributes: {
				contentEditable: this.bindToAttribute( 'isEditable' )
			}
		} );
	}
}
