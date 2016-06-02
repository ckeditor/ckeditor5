/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Bundle configuration with hard coded set of features.
 *
 * At this moment we don't know a list of every dependency needed in the bundle. It is because
 * editor features load automatically during initialization process. To work around this problem
 * we have created a custom entry file where we defined some of imports with features
 * needed to initialize editor.
 */

/**
 * Babel helper.
 *
 * @TODO: Move to bundle task.
 * Should be injected by bundle task, because our source code don't have to know that will be transformed.
 * But it is not so easy. It is only possible to pass string with file path to rollup,
 * so to do it we need to create a temporary file.
 */
import '../../../node_modules/regenerator-runtime/runtime.js';

import ClassicEditor from '../../../build/esnext/ckeditor5/creator-classic/classic.js';
import Delete from '../../../build/esnext/ckeditor5/delete/delete.js';
import Enter from '../../../build/esnext/ckeditor5/enter/enter.js';
import Typing from '../../../build/esnext/ckeditor5/typing/typing.js';
import Paragraph from '../../../build/esnext/ckeditor5/paragraph/paragraph.js';
import Undo from '../../../build/esnext/ckeditor5/undo/undo.js';
import BasicStylesBold from '../../../build/esnext/ckeditor5/basic-styles/bold.js';
import BasicStylesItalic from '../../../build/esnext/ckeditor5/basic-styles/italic.js';

/**
 * Class for creating editor with defined set of features.
 *
 * @extends ckeditor5.creator-classic.classic
 * @param {HTMLElement} element See {@link ckeditor5.creator-classic.classic#create}'s param.
 * @param {Object} config See {@link ckeditor5.creator-classic.classic#create}'s param.
 * @returns {Promise} Promise resolved once editor is ready.
 * @returns {ckeditor5.editor.StandardEditor} return.editor The editor instance.
 */
export default class BuildClassicEditor extends ClassicEditor {
	static create( element, config = {} ) {
		if ( !config.features ) {
			config.features = [];
		}

		if ( !config.toolbar ) {
			config.toolbar = [];
		}

		config.features = [ ...config.features, Delete, Enter, Typing, Paragraph, Undo, BasicStylesBold, BasicStylesItalic ];
		config.toolbar = [ ...config.toolbar, 'bold', 'italic', 'undo', 'redo' ];

		return ClassicEditor.create( element, config );
	}
}
