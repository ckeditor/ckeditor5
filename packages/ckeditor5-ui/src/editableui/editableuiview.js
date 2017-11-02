/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/editableui/editableuiview
 */

import View from '../view';

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

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					bind.to( 'isFocused', value => value ? 'ck-focused' : 'ck-blurred' ),
					'ck-editor__editable',
					'ck-rounded-corners'
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
		 * An external {@link #editableElement} passed into the constructor, which also means
		 * the view will not render its {@link #template}.
		 *
		 * @member {HTMLElement} #externalElement
		 */
		this.externalElement = editableElement;

		/**
		 * The element which is the main editable element (usually the one with `contentEditable="true"`).
		 *
		 * @readonly
		 * @member {HTMLElement} #editableElement
		 */
	}

	/**
	 * Renders the view by either applying the {@link #template} to the existing
	 * {@link #editableElement} or assigning {@link #element} as {@link #editableElement}.
	 */
	render() {
		super.render();

		if ( this.externalElement ) {
			this.template.apply( this.element = this.externalElement );
		} else {
			this.editableElement = this.element;
		}
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		if ( this.externalElement ) {
			this.template.revert( this.externalElement );
		}

		super.destroy();
	}
}
