/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language/textpartlanguageediting
 */

import { Plugin } from 'ckeditor5/src/core';
import TextPartLanguageCommand from './textpartlanguagecommand';
import { stringifyLanguageAttribute, parseLanguageAttribute } from './utils';

/**
 * The text part language editing.
 *
 * Introduces the `'textPartLanguage'` command and the `'language'` model element attribute.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TextPartLanguageEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TextPartLanguageEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		// Text part language options are only used to ensure that the feature works by default.
		// In the real usage it should be reconfigured by a developer. We are not providing
		// translations for `title` properties on purpose, as it's only an example configuration.
		editor.config.define( 'language', {
			textPartLanguage: [
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

		editor.model.schema.extend( '$text', { allowAttributes: 'language' } );
		editor.model.schema.setAttributeProperties( 'language', {
			copyOnEnter: true
		} );

		this._defineConverters();

		editor.commands.add( 'textPartLanguage', new TextPartLanguageCommand( editor ) );
	}

	/**
	 * @private
	 */
	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToAttribute( {
			model: {
				key: 'language',
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
			model: 'language',
			view: ( attributeValue, { writer }, data ) => {
				if ( !attributeValue ) {
					return;
				}

				if ( !data.item.is( '$textProxy' ) && !data.item.is( 'documentSelection' ) ) {
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
