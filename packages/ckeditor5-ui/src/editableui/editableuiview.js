/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
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
	constructor( locale, editableElement, editingView ) {
		super( locale );

		this.editingView = editingView;

		if ( editableElement ) {
			this.element = this.editableElement = editableElement;
		}

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

	attachDomRootActions() {
		const viewRoot = this.editingView.domConverter.domToView( this.element );
		const updateFocusClasses = () => {
			this.editingView.change( writer => {
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
		if ( this.externalElement ) {
			this.template.revert( this.externalElement );
		}

		super.destroy();
	}
}
