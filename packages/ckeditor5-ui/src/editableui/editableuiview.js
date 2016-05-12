/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import View from '../view.js';

/**
 * @memberOf ui.editableUI
 * @extends ui.View
 */
export default class EditableUIView extends View {
	/**
	 * Creates an instance of the EditableUIView class.
	 *
	 * @param {ui.Model} model (View)Model of this view.
	 * @param {utils.Locale} [locale] The {@link ckeditor5.Editor#locale editor's locale} instance.
	 * @param {HTMLElement} [editableElement] The editable element. If not specified the editable UI view
	 * should create it. Otherwise, the existing element should be used.
	 */
	constructor( model, locale, editableElement ) {
		super( model, locale );

		const bind = this.attributeBinder;

		if ( editableElement ) {
			this.element = this.editableElement = editableElement;
		}

		this.template = {
			tag: 'div',
			attributes: {
				class: [
					bind.to( 'isFocused', value => value ? 'ck-focused' : 'ck-blurred' ),
					'ck-editor__editable'
				],
				contenteditable: bind.to( 'isEditable' ),
			}
		};
	}

	init() {
		if ( this.editableElement ) {
			this.applyTemplateToElement( this.editableElement, this.template );
		} else {
			this.editableElement = this.element;
		}

		return super.init();
	}

	destroy() {
		this.editableElement.contentEditable = false;
	}

	/**
	 * The element which is the main editable element (usually the one with `contentEditable="true"`).
	 *
	 * @readonly
	 * @member {HTMLElement} ui.editable.EditableUIView#editableElement
	 */
}
