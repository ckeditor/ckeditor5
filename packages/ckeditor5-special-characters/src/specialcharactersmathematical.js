/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharacters
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class SpecialCharactersMathematical extends Plugin {
	init() {
		this.editor.plugins.get( 'SpecialCharacters' ).addItems( 'Mathematical', [
			{ title: 'greek small letter alpha', character: 'α' },
			{ title: 'greek small letter beta', character: 'β' },
			{ title: 'greek small letter delta', character: 'δ' },
			{ title: 'greek small letter epsilon', character: 'ε' },
			{ title: 'greek small letter theta', character: 'θ' },
			{ title: 'greek small letter lamda', character: 'λ' },
			{ title: 'greek small letter mu', character: 'μ' },
			{ title: 'greek small letter pi', character: 'π' },
			{ title: 'greek small letter phi', character: 'φ' },
			{ title: 'greek small letter psi', character: 'ψ' },
			{ title: 'greek capital letter omega', character: 'Ω' },
			{ title: 'precedes', character: '≺' },
			{ title: 'succeeds', character: '≻' },
			{ title: 'precedes or equal to', character: '≼' },
			{ title: 'succeeds or equal to', character: '≽' },
			{ title: 'double precedes', character: '⪻' },
			{ title: 'double succeeds', character: '⪼' },
			{ title: 'less-than', character: '<' },
			{ title: 'greater-than', character: '>' },
			{ title: 'less-than or equal to', character: '≤' },
			{ title: 'greater-than or equal to', character: '≥' },
			{ title: 'equals colon', character: '≕' },
			{ title: 'double colon equal', character: '⩴' },
			{ title: 'identical to', character: '≡' },
			{ title: 'not identical to', character: '≢' },
			{ title: 'almost equal to', character: '≈' },
			{ title: 'not almost equal to', character: '≉' },
			{ title: 'almost equal or equal to', character: '≊' },
			{ title: 'triple tilde', character: '≋' },
			{ title: 'true', character: '⊨' },
			{ title: 'not true', character: '⊭' },
			{ title: 'for all', character: '∀' },
			{ title: 'complement', character: '∁' },
			{ title: 'there exists', character: '∃' }
		] );
	}
}
