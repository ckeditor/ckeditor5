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
	 * @param {ui.TemplateDefinition} def
	 */
	setEditableElement( editableElement, def = { attributes: {} } ) {
		const bind = this.attributeBinder;
		const t = this.t;

		if ( this.editableElement ) {
			throw new CKEditorError(
				'editableview-cannot-override-editableelement: The editableElement cannot be overriden.'
			);
		}

		this.editableElement = editableElement;

		if ( !def.attributes.class ) {
			def.attributes.class = [];
		}

		Object.assign( def.attributes, {
			role: 'textbox',
			'aria-label': t( 'Rich Text Editor, %0', [ this.model.editableName ] ),
			title: t( 'Rich Text Editor, %0', [ this.model.editableName ] ),
		} );

		def.attributes.class.push(
			'ck-editor__editable',
			bind.to( 'isFocused', value => value ? 'ck-focused' : 'ck-blurred' )
		);

		def.attributes.contenteditable = bind.to( 'isEditable' );

		this.applyTemplateToElement( editableElement, def );
	}
}
