/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import CKEDITOR from '/ckeditor.js';
import ClassicCreator from '/ckeditor5/creator-classic/classiccreator.js';

CKEDITOR.create( '#editor', {
	creator: ClassicCreator,
	features: [ 'undo' ],
	toolbar: [ 'undo', 'redo' ]
} )
.then( editor => {
	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );
