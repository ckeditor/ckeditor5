/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Creator from '/ckeditor5/core/creator.js';
import Ui from '/ckeditor5/core/ui/ui.js';
import ChromeLess from '/tests/core/_utils/ui/chromeless/controller.js';
import InlineEditable from '/tests/core/_utils/ui/editable/inline/controller.js';

export default class InlineCreator extends Creator {
	constructor( editor ) {
		super( editor );

		editor.ui = new Ui( editor, new ChromeLess() );
	}

	create() {
		this._setupEditable();

		return super.create()
			.then( () => this.loadDataFromEditorElement() );
	}

	destroy() {
		this.updateEditorElement();

		return super.destroy();
	}

	_setupEditable() {
		this.editor.editable = new InlineEditable( this.editor, this.editor.element );

		this.editor.ui.chrome.collections.get( 'editable' ).add( this.editor.editable );
	}
}
