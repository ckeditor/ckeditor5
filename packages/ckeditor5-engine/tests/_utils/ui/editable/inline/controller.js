/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editable from '/ckeditor5/core/editable/editable.js';
import InlineEditableView from './view.js';

export default class InlineEditable extends Editable {
	constructor( editor, editableElement ) {
		super();

		this.viewModel.bind( 'width', 'height' ).to( editor.ui );

		this.view = new InlineEditableView( this.viewModel );
		this.view.element = editableElement;
	}
}
