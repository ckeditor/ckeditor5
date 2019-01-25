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
	constructor( locale, editingView, editableElement ) {
		super( locale );

		this.editingView = editingView;

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-content',
					'ck-editor__editable',
					'ck-rounded-corners'
				]
			}
		} );

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

		const updateFocusClasses = () => {
			this.editingView.change( writer => {
				const viewRoot = this.editingView.document.getRoot( this.name );

				writer.addClass( this.isFocused ? 'ck-focused' : 'ck-blurred', viewRoot );
				writer.removeClass( this.isFocused ? 'ck-blurred' : 'ck-focused', viewRoot );
			} );
		};

		this.on( 'change:isFocused', updateFocusClasses );
		updateFocusClasses();
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
