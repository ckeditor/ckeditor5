/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditableUIView from '/ckeditor5/ui/editableui/editableuiview.js';

export default class InlineEditableUIView extends EditableUIView {
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
