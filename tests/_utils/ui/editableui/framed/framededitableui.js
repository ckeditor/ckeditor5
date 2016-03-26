/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditableUI from '/ckeditor5/ui/editableui/editableui.js';

export default class FramedEditableUI extends EditableUI {
	constructor( editor, editableModel ) {
		super( editor, editableModel );

		this.viewModel.bind( 'width', 'height' ).to( editor.ui );
	}
}
