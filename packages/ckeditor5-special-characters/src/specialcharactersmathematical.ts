/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharactersmathematical
 */

import { Plugin } from 'ckeditor5/src/core';
import type SpecialCharacters from './specialcharacters';

/**
 * A plugin that provides special characters for the "Mathematical" category.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     plugins: [ ..., SpecialCharacters, SpecialCharactersMathematical ],
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 */
export default class SpecialCharactersMathematical extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'SpecialCharactersMathematical' {
		return 'SpecialCharactersMathematical';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;
		const plugin: SpecialCharacters = editor.plugins.get( 'SpecialCharacters' );

		plugin.addItems( 'Mathematical', [
			{ character: '<', title: t( 'Less-than sign' ) },
			{ character: '>', title: t( 'Greater-than sign' ) },
			{ character: '≤', title: t( 'Less-than or equal to' ) },
			{ character: '≥', title: t( 'Greater-than or equal to' ) },
			{ character: '–', title: t( 'En dash' ) },
			{ character: '—', title: t( 'Em dash' ) },
			{ character: '¯', title: t( 'Macron' ) },
			{ character: '‾', title: t( 'Overline' ) },
			{ character: '°', title: t( 'Degree sign' ) },
			{ character: '−', title: t( 'Minus sign' ) },
			{ character: '±', title: t( 'Plus-minus sign' ) },
			{ character: '÷', title: t( 'Division sign' ) },
			{ character: '⁄', title: t( 'Fraction slash' ) },
			{ character: '×', title: t( 'Multiplication sign' ) },
			{ character: 'ƒ', title: t( 'Latin small letter f with hook' ) },
			{ character: '∫', title: t( 'Integral' ) },
			{ character: '∑', title: t( 'N-ary summation' ) },
			{ character: '∞', title: t( 'Infinity' ) },
			{ character: '√', title: t( 'Square root' ) },
			{ character: '∼', title: t( 'Tilde operator' ) },
			{ character: '≅', title: t( 'Approximately equal to' ) },
			{ character: '≈', title: t( 'Almost equal to' ) },
			{ character: '≠', title: t( 'Not equal to' ) },
			{ character: '≡', title: t( 'Identical to' ) },
			{ character: '∈', title: t( 'Element of' ) },
			{ character: '∉', title: t( 'Not an element of' ) },
			{ character: '∋', title: t( 'Contains as member' ) },
			{ character: '∏', title: t( 'N-ary product' ) },
			{ character: '∧', title: t( 'Logical and' ) },
			{ character: '∨', title: t( 'Logical or' ) },
			{ character: '¬', title: t( 'Not sign' ) },
			{ character: '∩', title: t( 'Intersection' ) },
			{ character: '∪', title: t( 'Union' ) },
			{ character: '∂', title: t( 'Partial differential' ) },
			{ character: '∀', title: t( 'For all' ) },
			{ character: '∃', title: t( 'There exists' ) },
			{ character: '∅', title: t( 'Empty set' ) },
			{ character: '∇', title: t( 'Nabla' ) },
			{ character: '∗', title: t( 'Asterisk operator' ) },
			{ character: '∝', title: t( 'Proportional to' ) },
			{ character: '∠', title: t( 'Angle' ) },
			{ character: '¼', title: t( 'Vulgar fraction one quarter' ) },
			{ character: '½', title: t( 'Vulgar fraction one half' ) },
			{ character: '¾', title: t( 'Vulgar fraction three quarters' ) }
		], { label: t( 'Mathematical' ) } );
	}
}
