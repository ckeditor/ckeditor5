/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/pastefromoffice
 */

import { Plugin } from 'ckeditor5/src/core.js';

import { ClipboardPipeline } from 'ckeditor5/src/clipboard.js';

import MSWordNormalizer from './normalizers/mswordnormalizer.js';
import GoogleDocsNormalizer from './normalizers/googledocsnormalizer.js';
import GoogleSheetsNormalizer from './normalizers/googlesheetsnormalizer.js';

import { parseHtml } from './filters/parse.js';
import type { Normalizer, NormalizerData } from './normalizer.js';

/**
 * The Paste from Office plugin.
 *
 * This plugin handles content pasted from Office apps and transforms it (if necessary)
 * to a valid structure which can then be understood by the editor features.
 *
 * Transformation is made by a set of predefined {@link module:paste-from-office/normalizer~Normalizer normalizers}.
 * This plugin includes following normalizers:
 * * {@link module:paste-from-office/normalizers/mswordnormalizer~MSWordNormalizer Microsoft Word normalizer}
 * * {@link module:paste-from-office/normalizers/googledocsnormalizer~GoogleDocsNormalizer Google Docs normalizer}
 *
 * For more information about this feature check the {@glink api/paste-from-office package page}.
 */
export default class PasteFromOffice extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'PasteFromOffice' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ClipboardPipeline ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const clipboardPipeline: ClipboardPipeline = editor.plugins.get( 'ClipboardPipeline' );
		const viewDocument = editor.editing.view.document;
		const normalizers: Array<Normalizer> = [];
		const hasMultiLevelListPlugin = this.editor.plugins.has( 'MultiLevelList' );

		normalizers.push( new MSWordNormalizer( viewDocument, hasMultiLevelListPlugin ) );
		normalizers.push( new GoogleDocsNormalizer( viewDocument ) );
		normalizers.push( new GoogleSheetsNormalizer( viewDocument ) );

		clipboardPipeline.on(
			'inputTransformation',
			( evt, data: NormalizerData ) => {
				if ( data._isTransformedWithPasteFromOffice ) {
					return;
				}

				const codeBlock = editor.model.document.selection.getFirstPosition()!.parent;

				if ( codeBlock.is( 'element', 'codeBlock' ) ) {
					return;
				}

				const htmlString = data.dataTransfer.getData( 'text/html' );
				const activeNormalizer = normalizers.find( normalizer => normalizer.isActive( htmlString ) );

				if ( activeNormalizer ) {
					if ( !data._parsedData ) {
						data._parsedData = parseHtml( htmlString, viewDocument.stylesProcessor );
					}

					activeNormalizer.execute( data );

					data._isTransformedWithPasteFromOffice = true;
				}
			},
			{ priority: 'high' }
		);
	}
}
