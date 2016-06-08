/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ClassicEditor from '/ckeditor5/creator-classic/classic.js';
import Link from '/ckeditor5/hackathon/link.js';
import TextTransformator from '/ckeditor5/hackathon/texttransformator.js';
import AutoLinker from '/ckeditor5/hackathon/autolinker.js';

ClassicEditor.create( document.querySelector( '#editor' ), {
	features: [ 'delete', 'enter', 'typing', 'paragraph', 'undo', Link, TextTransformator, AutoLinker ],
	toolbar: [ 'undo', 'redo' ]
} );
