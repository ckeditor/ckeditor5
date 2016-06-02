/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import View from '../view.js';
import Template from '/ckeditor5/ui/template.js';

/**
 * @memberOf ui.editableUI
 * @extends ui.View
 */
export default class EditableUIView extends View {
	/**
	 * Creates an instance of the EditableUIView class.
	 *
	 * @param {utils.Observable} model (View)Model of this View.
	 * @param {utils.Locale} [locale] The {@link ckeditor5.Editor#locale editor's locale} instance.
	 * @param {HTMLElement} [editableElement] The editable element. If not specified, this view
	 * should create it. Otherwise, the existing element should be used.
	 */
	constructor( model, locale, editableElement ) {
		super( model, locale );

		if ( editableElement ) {
			this.element = this.editableElement = editableElement;
		}

		this.template = new Template( {
			tag: 'div',
			attributes: {
				class: [
					this.bind.to( 'isFocused', value => value ? 'ck-focused' : 'ck-blurred' ),
					'ck-editor__editable'
				],
				contenteditable: this.bind.to( 'isReadOnly', value => !value ),
			}
		} );

		/**
		 * The element which is the main editable element (usually the one with `contentEditable="true"`).
		 *
		 * @readonly
		 * @member {HTMLElement} ui.editableUI.EditableUIView#editableElement
		 */
	}

	/**
	 * Initializes the View by either applying the {@link template} to the existing
	 * {@link editableElement} or assigns {@link element} as {@link editableElement}.
	 */
	init() {
		if ( this.editableElement ) {
			this.applyTemplateToElement( this.editableElement, this.template.definition );
		} else {
			this.editableElement = this.element;
		}

		super.init();
	}

	destroy() {
		super.destroy();

		this.editableElement.contentEditable = false;
	}
}
