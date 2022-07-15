/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/pastefromoffice
 */

import { Plugin } from 'ckeditor5/src/core';
import { ClipboardPipeline } from 'ckeditor5/src/clipboard';

import GoogleDocsNormalizer from './normalizers/googledocsnormalizer';
import MSWordNormalizer from './normalizers/mswordnormalizer';

import { parseHtml } from './filters/parse';

/**
 * The Paste from Office plugin.
 *
 * This plugin handles content pasted from Office apps and transforms it (if necessary)
 * to a valid structure which can then be understood by the editor features.
 *
 * Transformation is made by a set of predefined {@link module:paste-from-office/normalizer~Normalizer normalizers}.
 * This plugin includes following normalizers:
 *   * {@link module:paste-from-office/normalizers/mswordnormalizer~MSWordNormalizer Microsoft Word normalizer}
 *   * {@link module:paste-from-office/normalizers/googledocsnormalizer~GoogleDocsNormalizer Google Docs normalizer}
 *
 * For more information about this feature check the {@glink api/paste-from-office package page}.
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
	static get requires() {
		return [ ClipboardPipeline ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;
		const normalizers = [];

		normalizers.push( new MSWordNormalizer( viewDocument ) );
		normalizers.push( new GoogleDocsNormalizer( viewDocument ) );

		editor.plugins.get( 'ClipboardPipeline' ).on(
			'inputTransformation',
			( evt, data ) => {
				if ( data._isTransformedWithPasteFromOffice ) {
					return;
				}

				const codeBlock = editor.model.document.selection.getFirstPosition().parent;

				if ( codeBlock.is( 'element', 'codeBlock' ) ) {
					return;
				}

				const htmlString = data.dataTransfer.getData( 'text/html' );
				const activeNormalizer = normalizers.find( normalizer => normalizer.isActive( htmlString ) );

				if ( activeNormalizer ) {
					data._parsedData = parseHtml( htmlString, viewDocument.stylesProcessor );

					activeNormalizer.execute( data );

					data._isTransformedWithPasteFromOffice = true;
				}
			},
			{ priority: 'high' }
		);
	}
}
