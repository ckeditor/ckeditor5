/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Creator from '/ckeditor5/core/creator.js';
import Ui from '/ckeditor5/core/ui/ui.js';
import Chrome from '/tests/core/_utils/ui/chrome/controller.js';
import FramedEditable from '/tests/core/_utils/ui/editable/framed/controller.js';

export default class ClassicCreator extends Creator {
	constructor( editor ) {
		super( editor );

		editor.ui = new Ui( editor, new Chrome() );
	}

	create() {
		this._replaceElement();
		this._setupEditable();

		return super.create()
			.then( () => this.loadDataFromEditorElement() );
	}

	destroy() {
		this.updateEditorElement();

		return super.destroy();
	}

	_setupEditable() {
		const editor = this.editor;
		const editable = new FramedEditable( editor );

		this.editor.editable = editable;
		this.editor.ui.chrome.collections.get( 'main' ).add( editable );
	}
}
