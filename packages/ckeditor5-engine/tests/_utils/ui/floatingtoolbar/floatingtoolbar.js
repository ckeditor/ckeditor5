/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Toolbar from '/ckeditor5/ui/toolbar/toolbar.js';

export default class FloatingToolbar extends Toolbar {
	constructor( editor, model, view ) {
		super( editor, model, view );

		model.bind( 'isVisible' ).to( editor.editable, 'isFocused' );
	}
}
