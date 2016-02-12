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

		/**
		 * @private
		 * @property {View} _view
		 */
	}

	get view() {
		return this._view;
	}

	set view( view ) {
		if ( view ) {
			this._view = view;

			view.register( 'editable', true );
		}
	}
}
