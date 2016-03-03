/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Toolbar from '/ckeditor5/core/ui/bindings/toolbar.js';

export default class FloatingToolbar extends Toolbar {
	constructor( model, view, editor ) {
		super( model, view, editor );

		model.bind( 'isVisible' ).to( editor.editable, 'isFocused' );
	}
}
