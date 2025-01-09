/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module language/textpartlanguageediting
 */

import type { ViewElement } from 'ckeditor5/src/engine.js';
import type { LanguageDirection } from 'ckeditor5/src/utils.js';
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import TextPartLanguageCommand from './textpartlanguagecommand.js';
import { stringifyLanguageAttribute, parseLanguageAttribute } from './utils.js';

/**
 * The text part language editing.
 *
 * Introduces the `'textPartLanguage'` command and the `'language'` model element attribute.
 */
export default class TextPartLanguageEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TextPartLanguageEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
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
	public init(): void {
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
	private _defineConverters(): void {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToAttribute( {
			model: {
				key: 'language',
				value: ( viewElement: ViewElement ) => {
					const languageCode = viewElement.getAttribute( 'lang' )!;
					const textDirection = viewElement.getAttribute( 'dir' )! as LanguageDirection;

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
