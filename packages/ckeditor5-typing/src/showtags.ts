/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module typing/showtags
 */

import { Plugin, type Editor } from '@ckeditor/ckeditor5-core';
import {
	type DowncastWriter,
	type MapperModelToViewPositionEvent,
	type ViewElement,
	type ViewNode,
	type ViewUIElement,
	type ViewAttributeElement,
	type ViewContainerElement
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

	public init(): void {
		const editor = this.editor;

		editor.editing.view.document.registerPostFixer( writer => {
			// Theoretically, post-fixer should return info whether it made any changes.
			// However, for performance reasons, in this case where as an integrator you control the entire situation
			// (and can tweak the code to have this post-fixer as the last one) it may be worth saving one post-fixer loop
			// by always returning void.
			//
			// let hasInsertedTags = false;

			const elementsToRefresh: Set<ViewContainerElement | ViewAttributeElement> = new Set();
			const startTagElementsToRefresh: Set<ViewUIElement> = new Set();
			const endTagElementsToRefresh: Set<ViewUIElement> = new Set();

			// TODO can be done via listening to change:children instead of accessing private API
			/* @ts-ignore */
			editor.editing.view._renderer.markedChildren.forEach( child => {
				let walker;

				if ( child.is( 'rootElement' ) ) {
					walker = writer.createRangeIn( child ).getWalker();
				}
				// Odd case: when clicking on the marked position <p>[]<strong>x</strong></p>
				// we get an empty and detached <strong> element.
				else if ( child.parent ) {
					walker = writer.createRangeOn( child ).getWalker();
				} else {
					return;
				}

				for ( const value of walker ) {
					if ( value.type === 'elementStart' ) {
						const currentItem = value.item;
						const shouldShowTags = ( currentItem.is( 'containerElement' ) || currentItem.is( 'attributeElement' ) ) &&
							!EXCLUDED_ELEMENTS[ currentItem.name ];

						if ( shouldShowTags ) {
							elementsToRefresh.add( currentItem );
						} else if ( this._isStartTagElement( currentItem as ViewElement ) ) {
							startTagElementsToRefresh.add( currentItem as ViewUIElement );
						} else if ( this._isEndTagElement( currentItem as ViewElement ) ) {
							endTagElementsToRefresh.add( currentItem as ViewUIElement );
						}
					}
				}
			} );

			// console.log( 'ELEMENTS TO REFRESH', elementsToRefresh );
			// console.log( 'TAG ELEMENTS TO REFRESH', startTagElementsToRefresh );

			for ( const elementToRefresh of elementsToRefresh ) {
				let addStart = false;
				let addEnd = false;
				const firstChild = elementToRefresh.getChild( 0 );

				if ( firstChild ) {
					// Can cast to ViewNode because if firstChild exists, last one must exist too (can't be undefined).
					const lastChild = elementToRefresh.getChild( elementToRefresh.childCount - 1 ) as ViewNode;

					if ( this._isStartTagElement( firstChild ) ) {
						startTagElementsToRefresh.delete( firstChild as ViewUIElement );
					} else {
						addStart = true;
					}

					if ( firstChild != lastChild ) {
						if ( this._isEndTagElement( lastChild ) ) {
							endTagElementsToRefresh.delete( lastChild as ViewUIElement );
						} else {
							addEnd = true;
						}
					} else {
						addEnd = true;
					}
				} else {
					addStart = true;
					addEnd = true;
				}

				if ( addStart ) {
					const tagElement = this._createStartTagElement( writer, elementToRefresh.name );
					writer.insert( writer.createPositionAt( elementToRefresh, 0 ), tagElement );
				}

				if ( addEnd ) {
					const tagElement = this._createEndTagElement( writer, elementToRefresh.name );
					writer.insert( writer.createPositionAt( elementToRefresh, 'end' ), tagElement );
				}
			}

			for ( const tagElementToRefresh of startTagElementsToRefresh ) {
				if ( tagElementToRefresh.index != 0 ) {
					writer.remove( tagElementToRefresh );
				}
			}

			for ( const tagElementToRefresh of endTagElementsToRefresh ) {
				if ( tagElementToRefresh.parent && tagElementToRefresh.index != ( tagElementToRefresh.parent.childCount - 1 ) ) {
					writer.remove( tagElementToRefresh );
				}
			}

			const viewSelection = editor.editing.view.document.selection;

			if ( viewSelection.isCollapsed ) {
				const selectionPosition = viewSelection.focus;
				const nodeBefore = selectionPosition?.nodeBefore;
				const nodeAfter = selectionPosition?.nodeAfter;

				// CASE 2:
				//
				// Fix selection converted to a position at the end of an attribute element:
				// <b><X/>foo<X/>[]</b>bar -> <b><X/>foo[]<X/></b>bar
				//
				// This cannot be done in modelToViewPosition listener, as at the point of position mapping
				// the selection is located here: <b><X/>foo<X/></b>[]bar
				// It's only moved to </b> after its attributes are converted, which is a later, separate step of
				// selection conversion.
				if ( nodeBefore && this._isEndTagElement( nodeBefore ) ) {
					console.log( '[INFO] Fixed selection position (CASE 2).' );

					writer.setSelection( writer.createPositionBefore( nodeBefore ) );
				}
				// CASE 3:
				//
				// <p>[]<X/>foo<X/></p> -> <p><X/>[]foo<X/></p>
				else if ( !nodeBefore && nodeAfter && this._isStartTagElement( nodeAfter ) ) {
					console.log( '[INFO] Fixed selection position (CASE 3).' );

					writer.setSelection( writer.createPositionAfter( nodeAfter ) );
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

	private _createStartTagElement( writer: DowncastWriter, name: string ): ViewUIElement {
		return writer.createUIElement( 'span', { class: 'tag-start' }, function( domDocument ) {
			const domElement = this.toDomElement( domDocument );
			domElement.setAttribute( 'contenteditable', 'false' );
			domElement.append( name );

			return domElement;
		} );
	}

	private _createEndTagElement( writer: DowncastWriter, name: string ): ViewUIElement {
		return writer.createUIElement( 'span', { class: 'tag-end' }, function( domDocument ) {
			const domElement = this.toDomElement( domDocument );
			domElement.setAttribute( 'contenteditable', 'false' );
			domElement.append( '/' + name );

			return domElement;
		} );
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
