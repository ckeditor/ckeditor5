/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import AutoformatEngine from './autoformatengine.js';
import HeadingEngine from '../heading/headingengine.js';
import Feature from '../core/feature.js';

export default class Autoformat extends Feature {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ AutoformatEngine, HeadingEngine ];
	}

	init() {
		const editor = this.editor;

		// I've noticed the commands are set only when they are required.
		// I guess this is expected behavior, but it makes things harder.
		// For now I'll require needed commands explicitly.

		if ( editor.commands.has( 'blockquote' ) ) {
			new AutoformatEngine( /^> $/, 'blockquote' );
		}

		if ( editor.commands.has( 'bulletedList' ) ) {
			new AutoformatEngine( /^[\*\-] $/, 'bulletedList' );
		}

		if ( editor.commands.has( 'numberedList' ) ) {
			new AutoformatEngine( /^\d+[\.|)]? $/, 'numberedList' ); // "1 A", "1. A", "123 A"
		}

		if ( editor.commands.has( 'heading' ) ) {
			// The batch must come from the AutoformatEngine, because it should be the same batch which is later
			// used by the command. E.g.:
			//
			// <p>## ^</p> -> <heading2>^</heading2> (two steps: executing heading command + removing the text prefix)
			//
			// After ctrl+z: <p>## ^</p> (so undo two steps)
			new AutoformatEngine( /^(#{1,3}) $/, ( batch, regexpMatch ) => {
				// TODO The heading command may be reconfigured in the future to support a different number
				// of headings. That option must be exposed somehow, because we need to know here whether the replacement
				// can be done or not.
				const headingLevel = regexpMatch[ 1 ].length;

				editor.execute( 'heading', { batch, format: `heading${ headingLevel }` } );
			} ); // "# A", "## A"...
		}
	}
}
