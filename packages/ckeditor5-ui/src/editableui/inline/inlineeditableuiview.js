/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditableUIView from '/ckeditor5/ui/editableui/editableuiview.js';

export default class InlineEditableView extends EditableUIView {
	constructor( model, locale, editableElement ) {
		super( model, locale );

		if ( editableElement ) {
			this.element = editableElement;
		} else {
			const bind = this.attributeBinder;

			this.template = {
				tag: 'div',
				attributes: {
					contentEditable: bind.to( 'isEditable' )
				}
			};
		}
	}

	init() {
		this.setEditableElement( this.element );

		super.init();
	}

	destroy() {
		super.destroy();

		this.editableElement.contentEditable = false;
	}
}
