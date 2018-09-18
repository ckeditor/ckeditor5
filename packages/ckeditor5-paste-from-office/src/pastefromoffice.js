/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module pastefromoffice/pastefromoffice
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { parseHtml } from './filters/utils';
import { paragraphsToLists } from './filters/list';

/**
 * This plugin handles content pasted from Word and transforms it (if necessary)
 * to format suitable for editor {@link module:engine/model/model~Model}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class PasteFromOffice extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'PasteFromOffice';
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

				editor.plugins.get( 'Clipboard' ).fire( 'inputTransformation', {
					content: this._normalizeWordInput( html )
				} );
			}
		} );
	}

	/**
	 * Normalizes input pasted from Word to format suitable for editor {@link module:engine/model/model~Model}.
	 *
	 * **Notice**: this function was exposed mainly for testing purposes and should not be called directly.
	 *
	 * @protected
	 * @param {String} input Word input.
	 * @returns {module:engine/view/documentfragment~DocumentFragment} Normalized input.
	 */
	_normalizeWordInput( input ) {
		const { body, stylesString } = parseHtml( input );
		const normalizedInput = paragraphsToLists( body, stylesString );

		return normalizedInput;
	}
}

// Checks if given HTML string is a result of pasting content from Word.
//
// @param {String} html HTML string to test.
// @returns {Boolean} True if given HTML string is a Word HTML.
function isWordInput( html ) {
	return !!( html && ( html.match( /<meta\s*name="?generator"?\s*content="?microsoft\s*word\s*\d+"?\/?>/gi ) ||
		html.match( /xmlns:o="urn:schemas-microsoft-com/gi ) ) );
}
