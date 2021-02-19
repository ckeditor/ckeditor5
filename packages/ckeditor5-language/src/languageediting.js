/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module block-quote/languageediting
 */

import { Plugin } from 'ckeditor5/src/core';
import LanguageCommand from './languagecommand';
import { parseLanguageToString, parseLanguageFromString } from './utils';

const LANGUAGE = 'language';

/**
 * The language editing.
 *
 * Introduces the `'language'` command and the `'language'` model element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class LanguageEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'LanguageEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		const t = editor.t;

		editor.config.define( 'language', {
			options: [
				{ title: t( 'Arabic' ), class: 'ck-language_ar', languageCode: 'ar' },
				{ title: t( 'French' ), class: 'ck-language_fr', languageCode: 'fr' },
				{ title: t( 'Spanish' ), class: 'ck-language_es', languageCode: 'es' }
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.model.schema.extend( '$text', { allowAttributes: LANGUAGE } );
		editor.model.schema.setAttributeProperties( LANGUAGE, {
			copyOnEnter: true
		} );

		this._defineConverters();

		editor.commands.add( LANGUAGE, new LanguageCommand( editor, LANGUAGE ) );
	}

	/**
	 * @private
	 */
	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToAttribute( {
			model: {
				key: LANGUAGE,
				value: viewElement => {
					const languageCode = viewElement.getAttribute( 'lang' );
					const textDirection = viewElement.getAttribute( 'dir' );

					return parseLanguageToString( languageCode, textDirection );
				}
			},
			view: {
				name: 'span',
				attributes: { lang: /[^]/ }
			}
		} );

		conversion.for( 'downcast' ).attributeToElement( {
			model: LANGUAGE,
			view: ( attributeValue, { writer } ) => {
				if ( !attributeValue ) {
					return;
				}

				const { languageCode, textDirection } = parseLanguageFromString( attributeValue );

				return writer.createAttributeElement( 'span', {
					lang: languageCode,
					dir: textDirection
				} );
			}
		} );
	}
}
