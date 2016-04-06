/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import View from '../view.js';
import CKEditorError from '../../utils/ckeditorerror.js';

/**
 * @memberOf ui.editableUI
 * @extends ui.View
 */
export default class EditableUIView extends View {
	/**
	 * Creates an instance of the EditableUIView class.
	 *
	 * @method constructor
	 * @param {ui.Model} model (View)Model of this view.
	 * @param {utils.Locale} [locale] The {@link ckeditor5.Editor#locale editor's locale} instance.
	 * @param {HTMLElement} [editableElement] The editable element. If not specified the editable UI view
	 * should create it. Otherwise, the existing element should be used.
	 */

	/**
	 * The element which is the main editable element (usually the one with `contentEditable="true"`).
	 *
	 * @readonly
	 * @member {HTMLElement} ui.editable.EditableUIView#editableElement
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
			attributes: {
				contenteditable: bind.to( 'isEditable' ),
				class: bind.to( 'isFocused', value => value ? 'ck-focused' : 'ck-blurred' )
			}
		} );
	}
}
