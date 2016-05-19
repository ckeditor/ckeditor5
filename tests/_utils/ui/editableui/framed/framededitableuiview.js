/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditableUIView from '/ckeditor5/ui/editableui/editableuiview.js';

export default class FramedEditableUIView extends EditableUIView {
	constructor( model, locale, editableElement ) {
		super( model, locale, editableElement );

		this.template.attributes.class.push( 'ck-editor__editable_framed' );
	}
}
