/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import AutoformatEngine from './autoformatengine.js';
import Feature from '../core/feature.js';
import HeadingEngine from '../heading/headingengine.js';
import ListEngine from '../list/listengine.js';

/**
 * Includes set of predefined Autoformatting actions:
 * * bulleted list
 * * numbered list
 * * headings
 *
 * @memberOf autoformat
 * @extends core.Feature
 */
export default class Autoformat extends Feature {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ HeadingEngine, ListEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// When `* ` or `- ` is typed, paragraph will be changed to a bulleted list.
		if ( editor.commands.has( 'bulletedList' ) ) {
			new AutoformatEngine( editor, /^[\*\-]\s$/, 'bulletedList' );
		}

		// When `1. ` or `1) ` (1 can be any digit or list of digits) is typed, paragraph will be changed to a numbered list.
		if ( editor.commands.has( 'numberedList' ) ) {
			new AutoformatEngine( editor, /^\d+[\.|)]?\s$/, 'numberedList' );
		}

		// When `#`, `##` or `###` is typed, paragraph will be changed to a corresponding heading level.
		if ( editor.commands.has( 'heading' ) ) {
			new AutoformatEngine( editor, /^(#{1,3})\s$/, ( context ) => {
				const { batch, match } = context;
				const headingLevel = match[ 1 ].length;

				editor.execute( 'heading', {
					batch,
					formatId: `heading${ headingLevel }`
				} );
			} );
		}
	}
}
