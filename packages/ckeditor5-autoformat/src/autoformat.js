/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import AutoformatEngine from './autoformatengine.js';
import Feature from '../core/feature.js';
import HeadingEngine from '../heading/headingengine.js';
import ListEngine from '../list/listengine.js';

/**
 * The autoformat feature. Looks for predefined regular expressions and converts inserted text accordingly.
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

		if ( editor.commands.has( 'bulletedList' ) ) {
			new AutoformatEngine( editor, /^[\*\-]\s$/, 'bulletedList' );
		}

		if ( editor.commands.has( 'numberedList' ) ) {
			new AutoformatEngine( editor, /^\d+[\.|)]?\s$/, 'numberedList' );
		}

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
