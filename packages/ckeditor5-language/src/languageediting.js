/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module block-quote/languageediting
 */

import { Plugin } from 'ckeditor5/src/core';
import LanguageCommand from './languagecommand';

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
	init() {
		const editor = this.editor;

		editor.model.schema.extend( '$text', { allowAttributes: LANGUAGE } );
		editor.model.schema.setAttributeProperties( LANGUAGE, {
			copyOnEnter: true
		} );

		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			model: LANGUAGE,
			view: 'lang'
		} );

		editor.conversion.for( 'downcast' ).attributeToElement( {
			model: LANGUAGE,
			view: ( attributeValue, { writer } ) => {
				if ( !attributeValue ) {
					return;
				}

				return writer.createAttributeElement( 'span', { 'lang': attributeValue } );
			}
		} );

		editor.commands.add( LANGUAGE, new LanguageCommand( editor, LANGUAGE ) );
	}
}
