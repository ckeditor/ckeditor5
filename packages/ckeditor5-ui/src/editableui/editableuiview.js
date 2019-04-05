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
	 * @param {module:engine/view/view~View} editingView The editing view instance the editable is related to.
	 * @param {HTMLElement} [editableElement] The editable element. If not specified, this view
	 * should create it. Otherwise, the existing element should be used.
	 */
	constructor( locale, editingView, editableElement ) {
		super( locale );

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
		 * The name of the editable UI view.
		 *
		 * @member {String} #name
		 */
		this.name = null;

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

		/**
		 * The editing view instance the editable is related to. Editable uses the editing
		 * view to dynamically modify its certain DOM attributes after {@link #render rendering}.
		 *
		 * **Note**: The DOM attributes are performed by the editing view and not UI
		 * {@link module:ui/view~View#bindTemplate template bindings} because once rendered,
		 * the editable DOM element must remain under the full control of the engine to work properly.
		 *
		 * @protected
		 * @member {module:engine/view/view~View} #isFocused
		 */
		this._editingView = editingView;
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

		this.on( 'change:isFocused', () => this._updateIsFocusedClasses() );
		this._updateIsFocusedClasses();
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

	/**
	 * Updates the `ck-focused` and `ck-blurred` CSS classes on the {@link #element} according to
	 * the {@link #isFocused} property value using the {@link #_editingView editing view} API.
	 *
	 * @private
	 */
	_updateIsFocusedClasses() {
		const editingView = this._editingView;

		if ( editingView.isRenderingInProgress ) {
			updateAfterRender( this );
		} else {
			update( this );
		}

		function update( view ) {
			editingView.change( writer => {
				const viewRoot = editingView.document.getRoot( view.name );

				writer.addClass( view.isFocused ? 'ck-focused' : 'ck-blurred', viewRoot );
				writer.removeClass( view.isFocused ? 'ck-blurred' : 'ck-focused', viewRoot );
			} );
		}

		// In a case of a multi-root editor, a callback will be attached more than once (one callback for each root).
		// While executing one callback the `isRenderingInProgress` observable is changing what causes executing another
		// callback and render is called inside the already pending render.
		// We need to be sure that callback is executed only when the value has changed from `true` to `false`.
		// See https://github.com/ckeditor/ckeditor5/issues/1676.
		function updateAfterRender( view ) {
			editingView.once( 'change:isRenderingInProgress', ( evt, name, value ) => {
				if ( !value ) {
					update( view );
				} else {
					updateAfterRender( view );
				}
			} );
		}
	}
}
