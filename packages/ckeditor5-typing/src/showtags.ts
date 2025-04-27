/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module typing/showtags
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import {
	type DowncastWriter,
	type MapperModelToViewPositionEvent,
	type ViewElement,
	type ViewNode,
	type ViewUIElement,
	type ViewAttributeElement,
	type ViewContainerElement,
	type ViewRenderEvent,
	_stringifyView
	// _stringifyView
	// type ViewDocumentSelectionChangeEvent,
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

		let blockPostFixerUntilRendered = false;
		let loop = 0;

		// This post-fixer is used to add missing and remove extra tag elements.
		// I went for a sweep and fix approach, because it's easier to reason about.
		// It may be optimized in the future:
		// * by listening to change:children instead of accessing private API and collecting precise information
		// about modified children,
		// * mapping UI elements to their corresponding container elements (can't be done for attribute elements because
		// they change too frequently) if that may help saving some cycles,
		// * replacing the use of tree walker with a lighter tree-traversal mechanism.
		editor.editing.view.document.registerPostFixer( writer => {
			if ( loop++ > 1000 ) {
				throw new Error( 'inf loop' );
			}

			if ( blockPostFixerUntilRendered ) {
				return false;
			}

			blockPostFixerUntilRendered = true;

			let changed = false;

			const elementsToRefresh: Set<ViewContainerElement | ViewAttributeElement> = new Set();
			const startTagElementsToRefresh: Set<ViewUIElement> = new Set();
			const endTagElementsToRefresh: Set<ViewUIElement> = new Set();

			//
			// STEP 1. Collect all the elements that need to be refreshed.
			//

			// TODO no public API for this for now.
			// Theoretically, we could listen to ViewNodeChangeEvent on the root element, but that ain't easy
			// because from what I can see it accumulates more noise. To be investigated...
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

			console.log( 'BEFORE', _stringifyView( editor.editing.view.document.getRoot()!, editor.editing.view.document.selection ) );

			//
			// STEP 2. Refresh the elements that need to be refreshed.
			//

			// console.log( 'ELEMENTS TO REFRESH', elementsToRefresh );
			// console.log( 'TAG ELEMENTS TO REFRESH', startTagElementsToRefresh );

			for ( const elementToRefresh of elementsToRefresh ) {
				let addStart = false;
				let addEnd = false;
				const firstChild = elementToRefresh.getChild( 0 );

				if ( this._isLeftoverAttributeElement( elementToRefresh ) && !this._isSelectionInside( elementToRefresh ) ) {
					this._cleanUpLeftoverAttributeElement( elementToRefresh, writer );
					changed = true;
				}
				// TODO The logic in this if-else block should be reviewed and ideally, unit tested (which should be
				// easy to do in an elegant way).
				// The idea here is to handle all the permutations of missing/misplaced tag elements. I'm quite sure there are
				// holes in this logic now.
				else if ( firstChild ) {
					// Can cast to ViewNode because if firstChild exists, last one must exist too (can't be undefined).
					const lastChild = elementToRefresh.getChild( elementToRefresh.childCount - 1 ) as ViewNode;

					if ( this._isStartTagElement( firstChild ) ) {
						startTagElementsToRefresh.delete( firstChild as ViewUIElement );

						// In some "wrap" cases like applying bold to `<a><X/>[foo]<X/></a>` tag elements may
						// get disconnected with their original element.
						this._updateStartTagName( firstChild as ViewUIElement, elementToRefresh.name );
					} else {
						addStart = true;
					}

					if ( firstChild != lastChild ) {
						if ( this._isEndTagElement( lastChild ) ) {
							endTagElementsToRefresh.delete( lastChild as ViewUIElement );

							this._updateEndTagName( lastChild as ViewUIElement, elementToRefresh.name );
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

					changed = true;
				}

				if ( addEnd ) {
					const tagElement = this._createEndTagElement( writer, elementToRefresh.name );
					writer.insert( writer.createPositionAt( elementToRefresh, 'end' ), tagElement );

					changed = true;
				}
			}

			for ( const tagElementToRefresh of startTagElementsToRefresh ) {
				if ( tagElementToRefresh.index != 0 ) {
					writer.remove( tagElementToRefresh );

					changed = true;
				}
			}

			for ( const tagElementToRefresh of endTagElementsToRefresh ) {
				if ( tagElementToRefresh.parent && tagElementToRefresh.index != ( tagElementToRefresh.parent.childCount - 1 ) ) {
					writer.remove( tagElementToRefresh );

					changed = true;
				}
			}

			console.log( 'AFTER', _stringifyView( editor.editing.view.document.getRoot()!, editor.editing.view.document.selection ) );

			return changed;
		} );

		// This post-fixer is used to fix the selection after the tag-element-related post-fixer has run.
		// It could be merged, but then this bit of logic must be excluded from the the early-abort on "blockPostFixerUntilRendered".
		editor.editing.view.document.registerPostFixer( writer => {
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

			return false;
		} );

		// Listen after the default mapping proposed a view position and correct the position in the following case:
		//
		// CASE 1:
		// <p>[]<X/>foo<X/></p> -> <p><X/>[]foo<X/></p>
		editor.editing.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', ( event, data ) => {
			const viewPosition = data.viewPosition;

			if ( !viewPosition ) {
				console.log( '[WARN] Aborted because no viewPosition... should not happen.' );
				return;
			}

			// console.log( '[INFO] viewPosition', _stringifyView( viewPosition.root, viewPosition ) );

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

		// This is a safety net to ensure that the selection is always in a valid state.
		//
		// Scenario that may trigger it:
		//
		// 1. If, by an unfortunate turn of events, we reached this state: <p><b>foo<UI/>x{}</b></p>.
		// 2. The post-fixer will want to remove the <UI/> element.
		// 3. Once the element is remove, the "x" text node is merged into "foo".
		// 4. The selection is now in a detached "x" text node.
		//
		// The issue stems from the fact that downcast writer does not fix the selection when performing certain operations.
		// In a normal flow, the selection is set as the last step of conversion process, once the tree is fully set up.
		// In this case, we alter the tree, so the selection needs refreshing. Unfortunately, there's no dedicated event for this.
		//
		// For production implementation, we'd suggest handling the most popular scenario (typing at the end of an attribute element)
		// right inside the post-fixer by calculating the expected selection position manually
		// (without triggering the entire conversion process, which cannot be done inside the post-fixer). This will reduce the
		// following listener to a rarely used fallback.
		editor.editing.view.on<ViewRenderEvent>( 'render', () => {
			// NOTE: when blocking the post-fixer, we need to make sure that the selection is still post-fixed
			// so we, we're blocking only the tag-element-related post-fixer.
			// blockPostFixerUntilRendered = true;

			const viewSelection = editor.editing.view.document.selection;

			// TODO anchor should be checked too. Either side of the selection might've gone missing.
			if ( viewSelection.focus?.parent && !( viewSelection.focus?.parent as ViewNode ).isAttached() ) {
				console.log( '[WARN] Fixing selection pre-render.' );

				editor.editing.view.change( writer => {
					editor.editing.downcastDispatcher.convertSelection(
						editor.editing.model.document.selection, editor.editing.model.markers, writer
					);
				} );
			}

			blockPostFixerUntilRendered = false;
		}, { priority: priorities.highest + 99999 } );

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

	private _createStartTagElement( writer: DowncastWriter, tagName: string ): ViewUIElement {
		return writer.createUIElement( 'span', { class: 'tag-start' }, function( domDocument ) {
			const domElement = this.toDomElement( domDocument );
			domElement.setAttribute( 'contenteditable', 'false' );
			domElement.append( tagName );

			return domElement;
		} );
	}

	private _createEndTagElement( writer: DowncastWriter, tagName: string ): ViewUIElement {
		return writer.createUIElement( 'span', { class: 'tag-end' }, function( domDocument ) {
			const domElement = this.toDomElement( domDocument );
			domElement.setAttribute( 'contenteditable', 'false' );
			domElement.append( '/' + tagName );

			return domElement;
		} );
	}

	private _isTagElement( element: ViewNode ): boolean {
		return element.is( 'uiElement' ) && ( element.hasClass( 'tag-start' ) || element.hasClass( 'tag-end' ) );
	}

	private _isStartTagElement( element: ViewNode ): boolean {
		return element.is( 'uiElement' ) && element.hasClass( 'tag-start' );
	}

	private _isEndTagElement( element: ViewNode ): boolean {
		return element.is( 'uiElement' ) && element.hasClass( 'tag-end' );
	}

	private _updateStartTagName( element: ViewUIElement, tagName: string ): void {
		this.editor.editing.view.domConverter.viewToDom( element ).textContent = tagName;
	}

	private _updateEndTagName( element: ViewUIElement, tagName: string ): void {
		this.editor.editing.view.domConverter.viewToDom( element ).textContent = '/' + tagName;
	}

	private _isLeftoverAttributeElement( element: ViewElement ): boolean {
		if ( !element.is( 'attributeElement' ) ) {
			return false;
		}

		const walker = this.editor.editing.view.createRangeIn( element ).getWalker();

		for ( const value of walker ) {
			if ( value.type === 'text' ) {
				return false;
			}
			else if ( value.type === 'elementStart' && !this._isTagElement( value.item as ViewElement ) ) {
				return false;
			}
		}

		return true;
	}

	private _isSelectionInside( element: ViewElement ): boolean {
		const selection = this.editor.editing.view.document.selection;

		return selection.isCollapsed && selection.focus?.parent === element;
	}

	private _cleanUpLeftoverAttributeElement( element: ViewElement, writer: DowncastWriter ): void {
		console.log( 'cleanUpLeftoverAttributeElement', element );

		const walker = this.editor.editing.view.createRangeIn( element ).getWalker();
		const toBeRemoved: Set<ViewUIElement> = new Set();

		for ( const value of walker ) {
			if ( value.type === 'elementStart' && value.item.is( 'uiElement' ) ) {
				toBeRemoved.add( value.item );
			}
		}

		for ( const element of toBeRemoved ) {
			console.log( '- removed', element );
			writer.remove( element );
		}
	}
}
