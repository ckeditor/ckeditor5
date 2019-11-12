/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharacters
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class SpecialCharactersArrows extends Plugin {
	init() {
		this.editor.plugins.get( 'SpecialCharacters' ).addItems( 'Arrows', [
			{
				title: 'arrow left',
				character: '←'
			},
			{
				title: 'arrow right',
				character: '→'
			}
		] );

		this.editor.plugins.get( 'SpecialCharacters' ).addItems( 'Arrows', [
			{
				title: 'arrow up',
				character: '↑'
			},
			{
				title: 'arrow down',
				character: '↓'
			}
		] );
	}
}
