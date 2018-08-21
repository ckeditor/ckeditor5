/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module pastefromword/pastefromword
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { extractBody, bodyToView, extractStyles } from './filters/common';
import { paragraphsToLists } from './filters/list';

/**
 * This plugin handles content pasted from Word and transforms it if necessary
 * to format suitable for editor {@link module:engine/model/model~Model}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class PasteFromWord extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'PasteFromWord';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const document = editor.editing.view.document;

		this.listenTo( document, 'clipboardInput', ( evt, data ) => {
			const html = data.dataTransfer.getData( 'text/html' );

			if ( isWordInput( html ) ) {
				evt.stop();

				const normalizedInput = this._normalizeWordInput( html, editor );

				editor.plugins.get( 'Clipboard' ).fire( 'inputTransformation', { content: normalizedInput } );
			}
		} );
	}

	/**
	 * Normalizes input pasted from Word to format suitable for editor {@link module:engine/model/model~Model}.
	 *
	 * @private
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 * @param {String} input Word input.
	 * @returns {module:engine/view/view~View} view Normalized input as {module:engine/view/view~View} instance.
	 */
	_normalizeWordInput( input, editor ) {
		const editorDocument = editor.editing.view.getDomRoot();
		const ownerDocument = editorDocument ? editorDocument.ownerDocument : null;

		return transformInput( input, ownerDocument,
			extractBody,
			bodyToView,
			extractStyles,
			paragraphsToLists
		).view;
	}
}

// Checks if given HTML string was produced by pasting content from Word.
//
// @param {String} html HTML string to test.
// @returns {Boolean} True if given HTML string is a Word HTML.
//
function isWordInput( html ) {
	return !!( html && html.match( /<meta\s*name="?generator"?\s*content="?microsoft\s*word\s*\d+"?\/?>/gi ) );
}

// Transforms given HTML string by provided transformation functions.
//
// @param {String} html HTML string to transform.
// @param {Document} domDocument Editor owner document.
// @param {Array.<Function>} transforms Functions which are used in the order of passing to transform given HTML.
// @returns {Object} data Object containing transformed parts of an input HTML string in a different formats. The number
// and type of formats depends on a provided transforms as each transform can create separate format or change existing one.
// @returns {String} data.html Input HTML string.
// @returns {*} data.* Any type of data created by transform functions. It directly depends on transform functions
// which were provided. to this function.
function transformInput( html, domDocument, ...transforms ) {
	let transformedData = { html };

	for ( const transform of transforms ) {
		transformedData = transform( transformedData, domDocument );
	}

	return transformedData;
}
