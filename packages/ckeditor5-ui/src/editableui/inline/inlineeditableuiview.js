/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditableUIView from '/ckeditor5/ui/editableui/editableuiview.js';

/**
 * The class implementing an inline {@link ui.editableUI.EditableUIView}.
 *
 * @memberOf ui.editableUI.inline
 * @extends ui.editableUI.EditableUIView
 */
export default class InlineEditableUIView extends EditableUIView {
	/**
	 * Creates an instance of the InlineEditableUIView class.
	 *
	 * @param {utils.Observable} model (View)Model of this view.
	 * @param {utils.Locale} [locale] The {@link ckeditor5.Editor#locale editor's locale} instance.
	 * @param {HTMLElement} [editableElement] The editable element. If not specified, the {@link EditableUIView}
	 * should create it. Otherwise, the existing element should be used.
	 */
	constructor( model, locale, editableElement ) {
		super( model, locale, editableElement );

		const label = this.t( 'Rich Text Editor, %0', [ this.model.editableName ] );

		Object.assign( this.template.attributes, {
			role: 'textbox',
			'aria-label': label,
			title: label
		} );

		this.template.attributes.class.push( 'ck-editor__editable_inline' );
	}
}
