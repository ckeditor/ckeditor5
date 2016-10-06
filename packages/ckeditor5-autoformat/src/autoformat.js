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
			new AutoformatEngine( editor, /^[\*\-]\s$/, ( context ) => {
				const { range, batch, element } = context;
				const ancestors = element.getAncestors();
				const command = editor.commands.get( 'bulletedList' );

				const isInList = command.value || ancestors.some( ( element ) => {
					return element.name === 'listItem';
				} );

				if ( isInList ) {
					return;
				}

				batch.remove( range );
				editor.execute( 'bulletedList', { batch } );
			} );
		}

		if ( editor.commands.has( 'numberedList' ) ) {
			new AutoformatEngine( editor, /^\d+[\.|)]?\s$/, ( context ) => {
				const { range, batch, element } = context;
				const ancestors = element.getAncestors();
				const command = editor.commands.get( 'numberedList' );

				const isInList = command.value || ancestors.some( ( element ) => {
					return element.name === 'listItem';
				} );

				if ( isInList ) {
					return;
				}

				batch.remove( range );
				editor.execute( 'numberedList', { batch } );
			} );
		}

		if ( editor.commands.has( 'heading' ) ) {
			// The batch must come from the AutoformatEngine, because it should be the same batch which is later
			// used by the command. E.g.:
			//
			// <p>## ^</p> -> <heading2>^</heading2> (two steps: executing heading command + removing the text prefix)
			//
			// After ctrl+z: <p>## ^</p> (so undo two steps)
			new AutoformatEngine( editor, /^(#{1,3})\s$/, ( context ) => {
				const { range, batch, match } = context;

				// TODO The heading command may be reconfigured in the future to support a different number
				// of headings. That option must be exposed somehow, because we need to know here whether the replacement
				// can be done or not.
				const headingLevel = match[ 1 ].length;

				batch.remove( range );
				editor.execute( 'heading', {
					batch,
					formatId: `heading${ headingLevel }`
				} );
			} );
		}
	}
}
