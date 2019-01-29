/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
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

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-content',
					'ck-editor__editable',
					'ck-rounded-corners',
					bind.to( 'isFocused', value => value ? 'ck-focused' : 'ck-blurred' ),
					bind.if( 'isReadOnly', 'ck-read-only' )

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
		 * @private
		 * @member {HTMLElement} #_editableElement
		 */
		this._editableElement = editableElement;

		/**
		 * Whether an external {@link #_editableElement} was passed into the constructor, which also means
		 * the view will not render its {@link #template}.
		 *
		 * @private
		 * @member {Boolean} #_hasExternalElement
		 */
		this._hasExternalElement = !!this._editableElement;
	}

	/**
	 * Renders the view by either applying the {@link #template} to the existing
	 * {@link #_editableElement} or assigning {@link #element} as {@link #_editableElement}.
	 */
	render() {
		super.render();

		if ( this._hasExternalElement ) {
			this.template.apply( this.element = this._editableElement );
		} else {
			this._editableElement = this.element;
		}
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		if ( this._hasExternalElement ) {
			this.template.revert( this._editableElement );
		}

		super.destroy();
	}
}
