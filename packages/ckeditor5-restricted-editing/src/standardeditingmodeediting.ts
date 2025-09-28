/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module restricted-editing/standardeditingmodeediting
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { Matcher, type UpcastElementEvent } from 'ckeditor5/src/engine.js';

import { RestrictedEditingExceptionCommand } from './restrictededitingexceptioncommand.js';

/**
 * The standard editing mode editing feature.
 *
 * * It introduces the `restrictedEditingException` text attribute that is rendered as
 * a `<span>` element with the `restricted-editing-exception` CSS class.
 * * It registers the `'restrictedEditingException'` command.
 */
export class StandardEditingModeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'StandardEditingModeEditing' as const;
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
	public init(): void {
		const editor = this.editor;

		editor.model.schema.extend( '$text', { allowAttributes: [ 'restrictedEditingException' ] } );

		editor.conversion.for( 'upcast' ).elementToAttribute( {
			model: 'restrictedEditingException',
			view: {
				name: 'span',
				classes: 'restricted-editing-exception'
			}
		} );

		registerFallbackUpcastConverter( editor );

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

function registerFallbackUpcastConverter( editor: Editor ) {
	// Fallback converter for empty exception span.
	const matcher = new Matcher( { name: 'span', classes: 'restricted-editing-exception' } );

	editor.conversion.for( 'upcast' ).add(
		dispatcher => dispatcher.on<UpcastElementEvent>( 'element:span', ( evt, data, conversionApi ) => {
			const matcherResult = matcher.match( data.viewItem );

			if ( !matcherResult ) {
				return;
			}

			const match = matcherResult.match;

			if ( !conversionApi.consumable.test( data.viewItem, match ) ) {
				return;
			}

			const modelText = conversionApi.writer.createText( ' ', { restrictedEditingException: true } );

			if ( !conversionApi.safeInsert( modelText, data.modelCursor ) ) {
				return;
			}

			conversionApi.consumable.consume( data.viewItem, match );

			data.modelRange = conversionApi.writer.createRange(
				data.modelCursor,
				data.modelCursor.getShiftedBy( modelText.offsetSize )
			);
			data.modelCursor = data.modelRange.end;
		}, { priority: 'low' } )
	);
}
