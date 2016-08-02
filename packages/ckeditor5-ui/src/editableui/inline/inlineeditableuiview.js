/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import EditableUIView from '../../editableui/editableuiview.js';
import Template from '../../template.js';

/**
 * The inline editable UI class implementing an inline {@link ui.editableUI.EditableUIView}.
 *
 * See {@link ui.editableUI.EditableUI}, {@link ui.editableUI.EditableUIView}.
 *
 * @memberOf ui.editableUI.inline
 * @extends ui.editableUI.EditableUIView
 */
export default class InlineEditableUIView extends EditableUIView {
	/**
	 * Creates an instance of the InlineEditableUIView class.
	 *
	 * @param {utils.Locale} [locale] The {@link core.editor.Editor#locale editor's locale} instance.
	 * @param {HTMLElement} [editableElement] The editable element. If not specified, the {@link EditableUIView}
	 * should create it. Otherwise, the existing element should be used.
	 */
	constructor( locale, editableElement ) {
		super( locale, editableElement );

		const bind = this.bind;
		const t = this.t;

		const getLabel = ( value ) => {
			return t( 'Rich Text Editor, %0', [ value ] );
		};

		Template.extend( this.template, {
			attributes: {
				role: 'textbox',
				'aria-label': bind.to( 'name', getLabel ),
				title: bind.to( 'name', getLabel ),
				class: 'ck-editor__editable_inline'
			}
		} );
	}
}
