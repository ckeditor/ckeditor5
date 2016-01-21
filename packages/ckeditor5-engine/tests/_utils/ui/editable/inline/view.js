/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditableView from '/ckeditor5/core/editable/view.js';

export default class InlineEditableView extends EditableView {
	init() {
		this.setEditableElement( this.element );

		super.init();
	}

	destroy() {
		super.destroy();

		this.editableElement.contentEditable = false;
	}
}
