/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language/languageediting
 */

import { Plugin } from 'ckeditor5/src/core';
import LanguageCommand from './languagecommand';
import { stringifyLanguageAttribute, parseLanguageAttribute } from './utils';

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

		// Language options are only used to ensure that the feature works by default.
		// In the real usage it should be reconfigured by a developer. We are not providing
		// translations for `title` properties on purpose, as it's only an example configuration.
		editor.config.define( 'languageList', {
			options: [
				{ title: 'Arabic', languageCode: 'ar' },
				{ title: 'French', languageCode: 'fr' },
				{ title: 'Spanish', languageCode: 'es' }
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

		editor.commands.add( LANGUAGE, new LanguageCommand( editor ) );
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

					return stringifyLanguageAttribute( languageCode, textDirection );
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

				const { languageCode, textDirection } = parseLanguageAttribute( attributeValue );

				return writer.createAttributeElement( 'span', {
					lang: languageCode,
					dir: textDirection
				} );
			}
		} );
	}
}
