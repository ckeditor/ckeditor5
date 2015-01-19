/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * The base class for CKEditor plugin classes.
 *
 * @class Plugin
 */

CKEDITOR.define( function() {
	function Plugin( editor ) {
		this.editor = editor;
	}

	return Plugin;
} );
