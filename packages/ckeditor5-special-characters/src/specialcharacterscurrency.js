/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharacterscurrency
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * A plugin that provides special characters for the "Currency" category.
 *
 *		ClassicEditor
 *			.create( {
 *				plugins: [ ..., SpecialCharacters, SpecialCharactersCurrency ],
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * @extends module:core/plugin~Plugin
 */
export default class SpecialCharactersCurrency extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.plugins.get( 'SpecialCharacters' ).addItems( 'Currency', [
			{ character: '$', title: t( 'Dollar sign' ) },
			{ character: '€', title: t( 'Euro sign' ) },
			{ character: '¥', title: t( 'Yen sign' ) },
			{ character: '£', title: t( 'Pound sign' ) },
			{ character: '¢', title: t( 'Cent sign' ) },
			{ character: '₠', title: t( 'Euro-currency sign' ) },
			{ character: '₡', title: t( 'Colon sign' ) },
			{ character: '₢', title: t( 'Cruzeiro sign' ) },
			{ character: '₣', title: t( 'French franc sign' ) },
			{ character: '₤', title: t( 'Lira sign' ) },
			{ character: '¤', title: t( 'Currency sign' ) },
			{ character: '₿', title: t( 'Bitcoin sign' ) },
			{ character: '₥', title: t( 'Mill sign' ) },
			{ character: '₦', title: t( 'Naira sign' ) },
			{ character: '₧', title: t( 'Peseta sign' ) },
			{ character: '₨', title: t( 'Rupee sign' ) },
			{ character: '₩', title: t( 'Won sign' ) },
			{ character: '₪', title: t( 'New sheqel sign' ) },
			{ character: '₫', title: t( 'Dong sign' ) },
			{ character: '₭', title: t( 'Kip sign' ) },
			{ character: '₮', title: t( 'Tugrik sign' ) },
			{ character: '₯', title: t( 'Drachma sign' ) },
			{ character: '₰', title: t( 'German penny sign' ) },
			{ character: '₱', title: t( 'Peso sign' ) },
			{ character: '₲', title: t( 'Guarani sign' ) },
			{ character: '₳', title: t( 'Austral sign' ) },
			{ character: '₴', title: t( 'Hryvnia sign' ) },
			{ character: '₵', title: t( 'Cedi sign' ) },
			{ character: '₶', title: t( 'Livre tournois sign' ) },
			{ character: '₷', title: t( 'Spesmilo sign' ) },
			{ character: '₸', title: t( 'Tenge sign' ) },
			{ character: '₹', title: t( 'Indian rupee sign' ) },
			{ character: '₺', title: t( 'Turkish lira sign' ) },
			{ character: '₻', title: t( 'Nordic mark sign' ) },
			{ character: '₼', title: t( 'Manat sign' ) },
			{ character: '₽', title: t( 'Ruble sign' ) }
		] );
	}
}
