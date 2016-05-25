/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import CKEDITOR from '/ckeditor.js';
import ClassicCreator from '/ckeditor5/creator-classic/classiccreator.js';
import Bold from '/ckeditor5/basic-styles/bold.js';
import Italic from '/ckeditor5/basic-styles/italic.js';

CKEDITOR.create( '#editor1', {
	creator: ClassicCreator,
	features: [ Bold, Italic ],
	toolbar: [ 'bold', 'italic' ]
} )
.then( editor => {
	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );
