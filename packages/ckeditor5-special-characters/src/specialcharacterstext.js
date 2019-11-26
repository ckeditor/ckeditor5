/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharacters
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class SpecialCharactersText extends Plugin {
	init() {
		this.editor.plugins.get( 'SpecialCharacters' ).addItems( 'Text', [
			{
				character: '‹',
				title: 'Single left-pointing angle quotation mark'
			},
			{
				character: '›',
				title: 'Single right-pointing angle quotation mark'
			},
			{
				character: '«',
				title: 'Left-pointing double angle quotation mark'
			},
			{
				character: '»',
				title: 'Right-pointing double angle quotation mark'
			},
			{
				character: '‘',
				title: 'Left single quotation mark'
			},
			{
				character: '’',
				title: 'Right single quotation mark'
			},
			{
				character: '“',
				title: 'Left double quotation mark'
			},
			{
				character: '”',
				title: 'Right double quotation mark'
			},
			{
				character: '‚',
				title: 'Single low-9 quotation mark'
			},
			{
				character: '„',
				title: 'Double low-9 quotation mark'
			},
			{
				character: '¡',
				title: 'Inverted exclamation mark'
			},
			{
				character: '¿',
				title: 'Inverted question mark'
			},
			{
				character: '‥',
				title: 'Two dot leader'
			},
			{
				character: '…',
				title: 'Horizontal ellipsis'
			},
			{
				character: '‡',
				title: 'Double dagger'
			},
			{
				character: '‰',
				title: 'Per mille sign'
			},
			{
				character: '‱',
				title: 'Per ten thousand sign'
			},
			{
				character: '‼',
				title: 'Double exclamation mark'
			},
			{
				character: '⁈',
				title: 'Question exclamation mark'
			},
			{
				character: '⁉',
				title: 'Exclamation question mark'
			},
			{
				character: '⁇',
				title: 'Double question mark'
			}
		] );
	}
}
