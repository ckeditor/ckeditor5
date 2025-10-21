/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module restricted-editing/standardeditingmodeediting
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { Matcher, type ModelElement, type UpcastElementEvent } from 'ckeditor5/src/engine.js';

import { RestrictedEditingExceptionCommand } from './restrictededitingexceptioncommand.js';
import { RestrictedEditingExceptionBlockCommand } from './restrictededitingexceptionblockcommand.js';

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
		const schema = editor.model.schema;

		schema.extend( '$text', { allowAttributes: [ 'restrictedEditingException' ] } );

		schema.register( 'restrictedEditingException', {
			allowWhere: '$container',
			allowContentOf: '$container'
		} );

		// Don't allow nesting of block exceptions.
		schema.addChildCheck( context => {
			for ( const item of context ) {
				if ( item.name == 'restrictedEditingException' ) {
					return false;
				}
			}
		}, 'restrictedEditingException' );

		// Don't allow nesting inline exceptions inside block exceptions.
		schema.addAttributeCheck( context => {
			for ( const item of context ) {
				if ( item.name == 'restrictedEditingException' ) {
					return false;
				}
			}
		}, 'restrictedEditingException' );

		// Post-fixer to ensure proper structure.
		editor.model.document.registerPostFixer( writer => {
			const changes = editor.model.document.differ.getChanges();
			const unwrap = new Set<ModelElement>();
			const remove = new Set<ModelElement>();

			for ( const entry of changes ) {
				if ( entry.type == 'insert' && entry.name != '$text' ) {
					for ( const child of writer.createRangeOn( entry.position.nodeAfter! ).getItems() ) {
						if ( !child.is( 'element', 'restrictedEditingException' ) ) {
							continue;
						}

						// Make sure that block exception is not nested or added in invalid place.
						if ( !schema.checkChild( writer.createPositionBefore( child ), child ) ) {
							unwrap.add( child );
						} else if ( child.isEmpty ) {
							remove.add( child );
						}
					}
				} else if ( entry.type == 'remove' ) {
					const parent = entry.position.parent;

					if ( parent.is( 'element', 'restrictedEditingException' ) && parent.isEmpty ) {
						remove.add( parent );
					}
				}
			}

			let changed = false;

			for ( const child of unwrap ) {
				writer.unwrap( child );
				changed = true;
			}

			for ( const child of remove ) {
				writer.remove( child );
				changed = true;
			}

			return changed;
		} );

		editor.conversion.for( 'upcast' )
			.elementToAttribute( {
				model: 'restrictedEditingException',
				view: {
					name: 'span',
					classes: 'restricted-editing-exception'
				}
			} )
			.elementToElement( {
				model: 'restrictedEditingException',
				view: {
					name: 'div',
					classes: 'restricted-editing-exception'
				}
			} );

		registerFallbackUpcastConverter( editor );

		editor.conversion.for( 'downcast' )
			.attributeToElement( {
				model: 'restrictedEditingException',
				view: ( modelAttributeValue, { writer } ) => {
					if ( modelAttributeValue ) {
						// Make the restricted editing <span> outer-most in the view.
						return writer.createAttributeElement( 'span', { class: 'restricted-editing-exception' }, { priority: -10 } );
					}
				}
			} )
			.elementToElement( {
				model: 'restrictedEditingException',
				view: {
					name: 'div',
					classes: 'restricted-editing-exception'
				}
			} );

		editor.commands.add( 'restrictedEditingException', new RestrictedEditingExceptionCommand( editor ) );
		editor.commands.add( 'restrictedEditingExceptionBlock', new RestrictedEditingExceptionBlockCommand( editor ) );

		editor.editing.view.change( writer => {
			for ( const root of editor.editing.view.document.roots ) {
				writer.addClass( 'ck-restricted-editing_mode_standard', root );
			}
		} );
	}
}

/**
 * Fallback upcast converter for empty exception span inside a table cell.
 */
function registerFallbackUpcastConverter( editor: Editor ) {
	const matcher = new Matcher( { name: 'span', classes: 'restricted-editing-exception' } );

	// See: https://github.com/ckeditor/ckeditor5/issues/16376.
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
