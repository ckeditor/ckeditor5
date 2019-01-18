/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/editableui/inline/inlineeditableuiview
 */

import EditableUIView from '../../editableui/editableuiview';

/**
 * The inline editable UI class implementing an inline {@link module:ui/editableui/editableuiview~EditableUIView}.
 *
 * @extends module:ui/editableui/editableuiview~EditableUIView
 */
export default class InlineEditableUIView extends EditableUIView {
	/**
	 * Creates an instance of the InlineEditableUIView class.
	 *
	 * @param {module:utils/locale~Locale} [locale] The locale instance.
	 * @param {HTMLElement} [editableElement] The editable element. If not specified, the
	 * {@link module:ui/editableui/editableuiview~EditableUIView}
	 * will create it. Otherwise, the existing element will be used.
	 */
	constructor( locale, editingView, editableElement ) {
		super( locale, editingView, editableElement );

		/**
		 * The name of the editable UI view.
		 *
		 * @observable
		 * @member {String} #name
		 */
		this.set( 'name', null );

		this.extendTemplate( {
			attributes: {
				role: 'textbox',
				class: 'ck-editor__editable_inline'
			}
		} );
	}

	enableEditingRootListeners() {
		super.enableEditingRootListeners();

		const t = this.t;
		const updateAriaLabelAttribute = () => {
			this.editingView.change( writer => {
				if ( this.name ) {
					writer.setAttribute( 'aria-label', t( 'Rich Text Editor, %0', [ this.name ] ), this.viewRoot );
				} else {
					writer.removeAttribute( 'aria-label', this.viewRoot );
				}
			} );
		};

		this.on( 'change:name', updateAriaLabelAttribute );
		updateAriaLabelAttribute();
	}

	disableEditingRootListeners() {
		this.editingView.change( writer => {
			writer.removeAttribute( 'aria-label', this.viewRoot );
		} );
	}
}
