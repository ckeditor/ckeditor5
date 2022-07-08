/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
	 * @param {module:engine/view/view~View} editingView The editing view instance the editable is related to.
	 * @param {HTMLElement} [editableElement] The editable element. If not specified, the
	 * {@link module:ui/editableui/editableuiview~EditableUIView}
	 * will create it. Otherwise, the existing element will be used.
	 * @param {String} [accessibleLabelGenerator] TODO
	 */
	constructor( locale, editingView, editableElement, accessibleLabelGenerator ) {
		super( locale, editingView, editableElement );

		const t = locale.t;

		this.extendTemplate( {
			attributes: {
				role: 'textbox',
				class: 'ck-editor__editable_inline'
			}
		} );

		/**
		 * TODO
		 *
		 * @private
		 */
		this._accessibleLabelGenerator = accessibleLabelGenerator || ( () => t( 'Editor editing area: "%0"', this.name ) );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		const editingView = this._editingView;

		editingView.change( writer => {
			const viewRoot = editingView.document.getRoot( this.name );

			writer.setAttribute( 'aria-label', this._accessibleLabelGenerator( this ), viewRoot );
		} );
	}
}
