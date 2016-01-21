/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editable from '/ckeditor5/core/editable/editable.js';
import FramedEditableView from './view.js';

export default class FramedEditable extends Editable {
	constructor( editor ) {
		super( FramedEditableView );

		this.viewModel.bind( 'width', 'height' ).to( editor.ui );

		this.view = new FramedEditableView( this.viewModel );
	}
}
