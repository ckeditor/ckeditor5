/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEDITOR from '/ckeditor.js';
import ClassicCreator from '/ckeditor5/creator-classic/classiccreator.js';
import Bold from '/ckeditor5/basic-styles/bold.js';

CKEDITOR.create( '#editor1', {
	creator: ClassicCreator,
	features: [ Bold ],
	toolbar: [ 'bold' ]
} );
