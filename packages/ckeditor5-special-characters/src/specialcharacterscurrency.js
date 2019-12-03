/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharacters
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import SpecialCharacters from './specialcharacters';

export default class SpecialCharactersCurrency extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [
			SpecialCharacters
		];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this.editor.plugins.get( 'SpecialCharacters' ).addItems( 'Currency', [
			{
				character: '$',
				title: 'Dollar sign'
			},
			{
				character: '€',
				title: 'Euro sign'
			},
			{
				character: '¥',
				title: 'Yen sign'
			},
			{
				character: '£',
				title: 'Pound sign'
			},
			{
				character: '¢',
				title: 'Cent sign'
			},
			{
				character: '₠',
				title: 'Euro-currency sign'
			},
			{
				character: '₡',
				title: 'Colon sign'
			},
			{
				character: '₢',
				title: 'Cruzeiro sign'
			},
			{
				character: '₣',
				title: 'French franc sign'
			},
			{
				character: '₤',
				title: 'Lira sign'
			},
			{
				character: '¤',
				title: 'Currency sign'
			},
			{
				character: '₿',
				title: 'Bitcoin sign'
			},
			{
				character: '₥',
				title: 'Mill sign'
			},
			{
				character: '₦',
				title: 'Naira sign'
			},
			{
				character: '₧',
				title: 'Peseta sign'
			},
			{
				character: '₨',
				title: 'Rupee sign'
			},
			{
				character: '₩',
				title: 'Won sign'
			},
			{
				character: '₪',
				title: 'New sheqel sign'
			},
			{
				character: '₫',
				title: 'Dong sign'
			},
			{
				character: '₭',
				title: 'Kip sign'
			},
			{
				character: '₮',
				title: 'Tugrik sign'
			},
			{
				character: '₯',
				title: 'Drachma sign'
			},
			{
				character: '₰',
				title: 'German penny sign'
			},
			{
				character: '₱',
				title: 'Peso sign'
			},
			{
				character: '₲',
				title: 'Guarani sign'
			},
			{
				character: '₳',
				title: 'Austral sign'
			},
			{
				character: '₴',
				title: 'Hryvnia sign'
			},
			{
				character: '₵',
				title: 'Cedi sign'
			},
			{
				character: '₶',
				title: 'Livre tournois sign'
			},
			{
				character: '₷',
				title: 'Spesmilo sign'
			},
			{
				character: '₸',
				title: 'Tenge sign'
			},
			{
				character: '₹',
				title: 'Indian rupee sign'
			},
			{
				character: '₺',
				title: 'Turkish lira sign'
			},
			{
				character: '₻',
				title: 'Nordic mark sign'
			},
			{
				character: '₼',
				title: 'Manat sign'
			},
			{
				character: '₽',
				title: 'Ruble sign'
			}/* ,
			{
				character: '円',
				title: ''
			},
			{
				character: '元',
				title: ''
			},
			{
				character: '圓',
				title: ''
			},
			{
				character: '圆',
				title: ''
			} */
		] );
	}
}
