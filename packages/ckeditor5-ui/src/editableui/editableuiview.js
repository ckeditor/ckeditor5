/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '../view.js';
import Template from '../template.js';

/**
 * The editable UI view class.
 *
 * See {@link ui.editableUI.EditableUI}.
 *
 * @memberOf ui.editableUI
 * @extends ui.View
 */
export default class EditableUIView extends View {
	/**
	 * Creates an instance of {@link ui.editableUI.EditableUIView} class.
	 *
	 * @param {utils.Locale} [locale] The {@link core.editor.Editor#locale editor's locale} instance.
	 * @param {HTMLElement} [editableElement] The editable element. If not specified, this view
	 * should create it. Otherwise, the existing element should be used.
	 */
	constructor( locale, editableElement ) {
		super( locale );

		const bind = this.bind;

		if ( editableElement ) {
			this.element = this.editableElement = editableElement;
		}

		this.template = new Template( {
			tag: 'div',
			attributes: {
				class: [
					bind.to( 'isFocused', value => value ? 'ck-focused' : 'ck-blurred' ),
					'ck-editor__editable'
				],
				contenteditable: bind.to( 'isReadOnly', value => !value ),
			}
		} );

		/**
		 * The element which is the main editable element (usually the one with `contentEditable="true"`).
		 *
		 * @readonly
		 * @member {HTMLElement} ui.editableUI.EditableUIView#editableElement
		 */

		/**
		 * Model of this editable UI view.
		 *
		 * @member {ui.editableUI.EditableUIViewModel} ui.editableUI.EditableUIView#model
		 */
	}

	/**
	 * Initializes the View by either applying the {@link template} to the existing
	 * {@link editableElement} or assigns {@link element} as {@link editableElement}.
	 */
	init() {
		if ( this.editableElement ) {
			this.template.apply( this.editableElement );
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

/**
 * The editable UI view {@link ui.Model} interface.
 *
 * @interface ui.editableUI.EditableUIViewModel
 */

/**
 * Controls whether the editable is writable or not.
 *
 * @observable
 * @member {Boolean} ui.editableUI.EditableUIViewModel#isReadOnly
 */

/**
 * Controls whether the editable is focused, i.e. the user is typing in it.
 *
 * @observable
 * @member {Boolean} ui.editableUI.EditableUIViewModel#isFocused
 */

/**
 * The name of the editable UI view.
 *
 * @observable
 * @member {String} ui.editableUI.EditableUIViewModel#name
 */
