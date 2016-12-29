/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/editableui/editableuiview
 */

import View from '../view';
import Template from '../template';

/**
 * The editable UI view class.
 *
 * @extends module:ui/view~View
 */
export default class EditableUIView extends View {
	/**
	 * Creates an instance of EditableUIView class.
	 *
	 * @param {module:utils/locale~Locale} [locale] The locale instance.
	 * @param {HTMLElement} [editableElement] The editable element. If not specified, this view
	 * should create it. Otherwise, the existing element should be used.
	 */
	constructor( locale, editableElement ) {
		super( locale );

		const bind = this.bindTemplate;

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
		 * Controls whether the editable is writable or not.
		 *
		 * @observable
		 * @member {Boolean} #isReadOnly
		 */
		this.set( 'isReadOnly', false );

		/**
		 * Controls whether the editable is focused, i.e. the user is typing in it.
		 *
		 * @observable
		 * @member {Boolean} #isFocused
		 */
		this.set( 'isFocused', false );

		/**
		 * The element which is the main editable element (usually the one with `contentEditable="true"`).
		 *
		 * @readonly
		 * @member {HTMLElement} #editableElement
		 */
	}

	/**
	 * Initializes the view by either applying the {@link #template} to the existing
	 * {@link #editableElement} or assigning {@link #element} as {@link #editableElement}.
	 *
	 * @returns {Promise}
	 */
	init() {
		if ( this.editableElement ) {
			this.template.apply( this.editableElement );
		} else {
			this.editableElement = this.element;
		}

		return super.init();
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this.editableElement.contentEditable = false;

		return super.destroy();
	}
}
