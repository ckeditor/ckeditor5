/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window */

import { foo } from '@ckeditor/ckeditor5-dll/foo';
import { bar } from '@ckeditor/ckeditor5-dll/bar';
import { Plugin, ClassicEditor } from '@ckeditor/ckeditor5-dll/utils';

foo();
bar();

class MahPlugin extends Plugin {
	init() {
		console.log( 'works' );
	}
}

ClassicEditor.create( '#editor', {
	plugins: [ MahPlugin ]
} ).then( editor => {
	window.editor = editor;
} );
