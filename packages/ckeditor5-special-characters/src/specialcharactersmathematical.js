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
			{
				title: 'precedes',
				character: '≺'
			},
			{
				title: 'succeeds',
				character: '≻'
			}
		] );

		this.editor.plugins.get( 'SpecialCharacters' ).addItems( 'Mathematical', [
			{
				title: 'precedes or equal to',
				character: '≼'
			},
			{
				title: 'succeeds or equal to',
				character: '≽'
			}
		] );
	}
}
