/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditableUI from '/ckeditor5/ui/editableui/editableui.js';

/**
 * The basic implementation of an iframe-based {@link ui.editableUI.EditableUI}.
 *
 * @memberOf ui.editableUI.iframe
 * @extends ui.editableUI.EditableUI
 */
export default class FramedEditableUIIframe extends EditableUI {
	/**
	 * Creates a new instance of the iframe–based {@link ui.editableUI.EditableUI EditableUI}.
	 *
	 * @param {ckeditor5.Editor} editor The editor instance.
	 * @param {utils.Observable} editableModel The model for the editable.
	 */
	constructor( editor, editableModel ) {
		super( editor, editableModel );

		this.viewModel.bind( 'width', 'height' ).to( editor.ui );
	}
}
