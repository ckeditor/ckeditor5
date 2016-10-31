/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BlockAutoformatEngine from './blockautoformatengine.js';
import InlineAutoformatEngine from './inlineautoformatengine.js';
import Feature from '../core/feature.js';
import HeadingEngine from '../heading/headingengine.js';
import ListEngine from '../list/listengine.js';
import BoldEngine from '../basic-styles/boldengine.js';
import ItalicEngine from '../basic-styles/italicengine.js';

/**
 * Includes set of predefined Autoformatting actions:
 * * Bulleted list,
 * * Numbered list,
 * * Headings.
 *
 * @memberOf autoformat
 * @extends core.Feature
 */
export default class Autoformat extends Feature {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ HeadingEngine, ListEngine, BoldEngine, ItalicEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._addListAutoformats();
		this._addHeadingAutoformats();
		this._addInlineAutoformats();
	}

	/**
	 * Adds autoformatting related to ListEngine commands.
	 *
	 * When typed:
	 * - `* ` or `- ` - paragraph will be changed to a bulleted list,
	 * - `1. ` or `1) ` - paragraph will be changed to a numbered list (1 can be any digit or list of digits).
	 *
	 * @private
	 */
	_addListAutoformats() {
		new BlockAutoformatEngine( this.editor, /^[\*\-]\s$/, 'bulletedList' );
		new BlockAutoformatEngine( this.editor, /^\d+[\.|)]?\s$/, 'numberedList' );
	}

	/**
	 * Adds autoformatting related to HeadingEngine commands.
	 * When typed `# ` or `## ` or `### ` paragraph will be changed to a corresponding heading level.
	 *
	 * @private
	 */
	_addHeadingAutoformats() {
		new BlockAutoformatEngine( this.editor, /^(#{1,3})\s$/, ( context ) => {
			const { batch, match } = context;
			const headingLevel = match[ 1 ].length;

			this.editor.execute( 'heading', {
				batch,
				formatId: `heading${ headingLevel }`
			} );
		} );
	}

	/**
	 * Adds inline autoformatting capabilities to the editor.
	 *
	 * When typed:
	 * - `**foobar**`: `**` characters are removed, and `foobar` is set to bold,
	 * - `__foobar__`: `__` characters are removed, and `foobar` is set to bold,
	 * - `*foobar*`: `*` characters are removed, and `foobar` is set to italic,
	 * - `_foobar_`: `_` characters are removed, and `foobar` is set to italic.
	 *
	 * @private
	 */
	_addInlineAutoformats() {
		new InlineAutoformatEngine( this.editor, /(\*\*|__)([^\*_]+?)(\*\*|__)$/g, 'bold' );
		new InlineAutoformatEngine( this.editor, /(?:^|[^\*_])(\*|_)([^\*_]+?)(\*|_)$/g, 'italic' );
	}
}
