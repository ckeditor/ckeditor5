/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language/textfragmentlanguageediting
 */

import { Plugin } from 'ckeditor5/src/core';
import TextFragmentLanguageCommand from './textfragmentlanguagecommand';
import { stringifyLanguageAttribute, parseLanguageAttribute } from './utils';

const ATTRIBUTE_KEY = 'language';

/**
 * The text fragment language editing.
 *
 * Introduces the `'textFragmentLanguage'` command and the `'language'` model element attribute.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TextFragmentLanguageEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TextFragmentLanguageEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		// Text fragment language options are only used to ensure that the feature works by default.
		// In the real usage it should be reconfigured by a developer. We are not providing
		// translations for `title` properties on purpose, as it's only an example configuration.
		editor.config.define( 'language', {
			textFragmentLanguage: [
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

		editor.model.schema.extend( '$text', { allowAttributes: ATTRIBUTE_KEY } );
		editor.model.schema.setAttributeProperties( ATTRIBUTE_KEY, {
			copyOnEnter: true
		} );

		this._defineConverters();

		editor.commands.add( 'textFragmentLanguage', new TextFragmentLanguageCommand( editor ) );
	}

	/**
	 * @private
	 */
	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToAttribute( {
			model: {
				key: ATTRIBUTE_KEY,
				value: viewElement => {
					const languageCode = viewElement.getAttribute( 'lang' );
					const textDirection = viewElement.getAttribute( 'dir' );

					return stringifyLanguageAttribute( languageCode, textDirection );
				}
			},
			view: {
				name: 'span',
				attributes: { lang: /[\s\S]+/ }
			}
		} );

		conversion.for( 'downcast' ).attributeToElement( {
			model: ATTRIBUTE_KEY,
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
