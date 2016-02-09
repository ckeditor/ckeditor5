/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditorUI from '/ckeditor5/core/editorui.js';
import ControllerCollection from '/ckeditor5/core/ui/controllercollection.js';

export default class BoxlessEditorUI extends EditorUI {
	constructor( editor ) {
		super( editor );

		this.collections.add( new ControllerCollection( 'editable' ) );
	}

	init() {
		// We cannot register the region earlier because the view is set after classes instantiation.
		// TODO We can change view property into a setter and create region immediately.
		this.view.register( 'editable', true );

		return super.init();
	}
}
