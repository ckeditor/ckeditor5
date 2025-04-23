/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module typing/showtags
 */

import { Plugin, type Editor } from '@ckeditor/ckeditor5-core';
import {
	type MapperModelToViewPositionEvent,
	type ViewElement,
	type ViewNode,
	type DowncastWriter,
	type ViewUIElement
	// type ViewDocumentSelectionChangeEvent,
	// _stringifyView
} from '@ckeditor/ckeditor5-engine';
import { priorities } from '@ckeditor/ckeditor5-utils';

/**
 * Elements that should not show tags in the editor.
 */
const EXCLUDED_ELEMENTS: { [key: string]: boolean } = {
	ol: true,
	ul: true,
	table: true,
	tr: true,
	thead: true,
	tbody: true,
	tfoot: true,
	li: true,
	blockquote: true,
	figure: true,
	img: true,
	figcaption: true,
	caption: true,
	col: true,
	colgroup: true,
	td: true,
	th: true,
	hr: true,
	br: true
};

/**
 * A plugin that shows HTML tags in the editor.
 */
export default class ShowTags extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ShowTags' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	private _renderedTags: WeakMap<object, any>;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this._renderedTags = new WeakMap();
	}

	public init(): void {
		const editor = this.editor;
		// let x = 0;

		editor.editing.view.document.registerPostFixer( writer => {
			// Theoretically, post-fixer should return info whether it made any changes.
			// However, for performance reasons, in this case where as an integrator you control the entire situation
			// (and can tweak the code to have this post-fixer as the last one) it may be worth saving one post-fixer loop
			// by always returning void.
			//
			// let hasInsertedTags = false;

			// TODO can be done via listening to change:children instead of accessing private API
			/* @ts-ignore */
			editor.editing.view._renderer.markedChildren.forEach( child => {
				let walker;

				if ( child.is( 'rootElement' ) ) {
					walker = writer.createRangeIn( child ).getWalker();
				} else {
					walker = writer.createRangeOn( child ).getWalker();
				}

				for ( const value of walker ) {
					// Inf loop protection for testing purposes.
					// It was necessary when I was testing the `hasInsertedTags` return value because it was
					// too easy to trigger inf loops.
					// if ( x++ > 10000 ) {
					// 	throw new Error( 'inf loop protection' );
					// }

					if ( value.type === 'elementStart' ) {
						const currentItem = value.item;
						const shouldShowTags = ( currentItem.is( 'containerElement' ) || currentItem.is( 'attributeElement' ) ) &&
							!EXCLUDED_ELEMENTS[ currentItem.name ];

						if ( shouldShowTags ) {
							const { tagStart, tagEnd, areNew } = this._getTagElements( writer, currentItem );

							if ( areNew ) {
								const positionAtStart = writer.createPositionAt( currentItem, 0 );
								writer.insert( positionAtStart, tagStart );
								writer.insert( writer.createPositionAt( currentItem, 'end' ), tagEnd );

								// CASE 3:
								//
								// I'm naively fixing only collapsed selection but it'd be good to
								// check it in all the cases.
								const viewSelection = editor.editing.view.document.selection;

								if ( viewSelection.isCollapsed && viewSelection.isSimilar( writer.createSelection( positionAtStart ) ) ) {
									console.log( '[INFO] Fixed selection position (CASE 3).' );
									writer.setSelection( positionAtStart.getShiftedBy( 1 ) );
								}

								// hasInsertedTags = true;
							} else {
								if ( currentItem.getChildIndex( tagStart ) != 0 ) {
									writer.insert( writer.createPositionAt( currentItem, 0 ), tagStart );

									// hasInsertedTags = true;
								}

								if ( currentItem.getChildIndex( tagEnd ) != currentItem.childCount - 1 ) {
									writer.insert( writer.createPositionAt( currentItem, 'end' ), tagEnd );

									// hasInsertedTags = true;
								}
							}
						}
					}
				}
			} );

			// CASE 2:
			//
			// Fix selection converted to a position at the end of an attribute element:
			// <b><X/>foo<X/>[]</b>bar -> <b><X/>foo[]<X/></b>bar
			//
			// This cannot be done in modelToViewPosition listener, as at the point of position mapping
			// the selection is located here: <b><X/>foo<X/></b>[]bar
			// It's only moved to </b> after its attributes are converted, which is a later, separate step of
			// selection conversion.
			const viewSelection = editor.editing.view.document.selection;

			if ( viewSelection.isCollapsed ) {
				const selectionPosition = viewSelection.focus;
				const nodeBefore = selectionPosition?.nodeBefore;

				if ( nodeBefore && this._isEndTagElement( nodeBefore ) ) {
					console.log( '[INFO] Fixed selection position (CASE 2).' );

					writer.setSelection( writer.createPositionBefore( nodeBefore ) );
				}
			}

			// return hasInsertedTags;
			return false;
		} );

		// CASE 1:
		//
		// Listen after the default mapping proposed a view position and correct the position in the following cases:
		//
		// <p>[]<X/>foo<X/></p> -> <p><X/>[]foo<X/></p>
		editor.editing.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', ( event, data ) => {
			const viewPosition = data.viewPosition;

			if ( !viewPosition ) {
				console.log( '[WARN] Aborted because no viewPosition... should not happen.' );
				return;
			}
			if ( viewPosition.isAtStart ) {
				const parent = viewPosition.parent;

				if ( parent.is( 'element' ) ) {
					const firstChild = parent.getChild( 0 );

					if ( firstChild && this._isStartTagElement( firstChild ) ) {
						console.log( '[INFO] Fixed position in modelToViewPosition (CASE 1).' );

						data.viewPosition = viewPosition.getShiftedBy( 1 );
					}
				}
			}
		}, { priority: priorities.low - 1 } );

		// editor.editing.view.document.on<ViewDocumentSelectionChangeEvent>( 'selectionChange', ( evt, data ) => {
		// 	const viewPosition = data.newSelection.focus;
		// 	if ( viewPosition ) {
		// 		console.log( 'vDoc#selChange', _stringifyView( viewPosition.root, viewPosition ) );
		// 	}
		// }, { priority: 'lowest' } );

		// editor.editing.view.document.selection.on( 'change', ( evt, data ) => {
		// 	const viewPosition = editor.editing.view.document.selection.focus;
		// 	if ( viewPosition ) {
		// 		console.log( 'vDoc.sel#change', _stringifyView( viewPosition.root, viewPosition ) );
		// 	}
		// }, { priority: 'lowest' } );

		// setInterval( () => {
		// 	const viewPosition = editor.editing.view.document.selection.focus;
		// 	if ( viewPosition ) {
		// 		console.log( 'interval', _stringifyView( viewPosition.root, viewPosition ) );
		// 	}
		// }, 2000 );
	}

	private _getTagElements( writer: DowncastWriter, currentItem: ViewElement ): TagElements {
		if ( this._renderedTags.has( currentItem ) ) {
			return this._renderedTags.get( currentItem );
		}

		const tagStart = writer.createUIElement( 'span', { class: 'tag-start' }, function( domDocument ) {
			const domElement = this.toDomElement( domDocument );
			domElement.setAttribute( 'contenteditable', 'false' );
			domElement.append( currentItem.name );

			return domElement;
		} );

		const tagEnd = writer.createUIElement( 'span', { class: 'tag-end' }, function( domDocument ) {
			const domElement = this.toDomElement( domDocument );
			domElement.setAttribute( 'contenteditable', 'false' );
			domElement.append( '/' + currentItem.name );

			return domElement;
		} );

		this._renderedTags.set( currentItem, { tagStart, tagEnd } );

		return { tagStart, tagEnd, areNew: true };
	}

	private _isStartTagElement( element: ViewNode ): boolean {
		return element.is( 'uiElement' ) && element.hasClass( 'tag-start' );
	}

	private _isEndTagElement( element: ViewNode ): boolean {
		return element.is( 'uiElement' ) && element.hasClass( 'tag-end' );
	}
}

type TagElements = {
	tagStart: ViewUIElement;
	tagEnd: ViewUIElement;
	areNew: boolean;
};
