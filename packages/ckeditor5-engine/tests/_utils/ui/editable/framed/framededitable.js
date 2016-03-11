/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editable from '/ckeditor5/ui/editable/editable.js';

export default class FramedEditable extends Editable {
	constructor( editor ) {
		super( editor );

		this.viewModel.bind( 'width', 'height' ).to( editor.ui );
	}
}
