/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/standardeditingmodeediting
 */

import { Plugin } from 'ckeditor5/src/core';

import RestrictedEditingExceptionCommand from './restrictededitingexceptioncommand';

/**
 * The standard editing mode editing feature.
 *
 * * It introduces the `restrictedEditingException` text attribute that is rendered as
 * a `<span>` element with the `restricted-editing-exception` CSS class.
 * * It registers the `'restrictedEditingException'` command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class StandardEditingModeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'StandardEditingModeEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.model.schema.extend( '$text', { allowAttributes: [ 'restrictedEditingException' ] } );

		editor.conversion.for( 'upcast' ).elementToAttribute( {
			model: 'restrictedEditingException',
			view: {
				name: 'span',
				classes: 'restricted-editing-exception'
			}
		} );

		editor.conversion.for( 'downcast' ).attributeToElement( {
			model: 'restrictedEditingException',
			view: ( modelAttributeValue, { writer } ) => {
				if ( modelAttributeValue ) {
					// Make the restricted editing <span> outer-most in the view.
					return writer.createAttributeElement( 'span', { class: 'restricted-editing-exception' }, { priority: -10 } );
				}
			}
		} );

		editor.commands.add( 'restrictedEditingException', new RestrictedEditingExceptionCommand( editor ) );

		editor.editing.view.change( writer => {
			for ( const root of editor.editing.view.document.roots ) {
				writer.addClass( 'ck-restricted-editing_mode_standard', root );
			}
		} );
	}
}
