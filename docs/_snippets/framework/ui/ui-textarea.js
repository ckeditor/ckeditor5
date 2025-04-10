/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { TextareaView } from 'ckeditor5';

const textarea = new TextareaView();

textarea.set( {
	minRows: 4,
	maxRows: 10,
	resize: 'horizontal'
} );
textarea.render();

document.querySelector( '.ui-textarea' ).append( textarea.element );
