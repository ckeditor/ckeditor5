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
	type DowncastWriter,
	type ViewUIElement,
	type ViewPosition
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
		let x = 0;

		editor.editing.view.document.registerPostFixer( writer => {
			let hasInsertedTags = false;

			// TODO can be done via listening to change:children
			/* @ts-ignore */
			editor.editing.view._renderer.markedChildren.forEach( child => {
				// console.log( 'child', child );

				let walker;
				if ( child.is( 'rootElement' ) ) {
					walker = writer.createRangeIn( child ).getWalker();
				} else {
					walker = writer.createRangeOn( child ).getWalker();
				}

				for ( const value of walker ) {
					// console.log( 'value', value );

					// Inf loop protection for testing purposes.
					if ( x++ > 10000 ) {
						throw new Error( 'inf loop protection' );
					}

					if ( value.type === 'elementStart' ) {
						const currentItem = value.item;
						const shouldShowTags = ( currentItem.is( 'containerElement' ) || currentItem.is( 'attributeElement' ) ) &&
							!EXCLUDED_ELEMENTS[ currentItem.name ];

						if ( shouldShowTags ) {
							const { tagStart, tagEnd, areNew } = this._getTagElements( writer, currentItem );

							if ( areNew ) {
								// console.log( 'areNew', currentItem );
								const positionAtStart = writer.createPositionAt( currentItem, 0 );
								writer.insert( positionAtStart, tagStart );
								writer.insert( writer.createPositionAt( currentItem, 'end' ), tagEnd );

								// I'm naively fixing only collapsed selection but it'd be good to
								// check it in all the cases.
								const selection = editor.editing.view.document.selection;

								console.log(
									selection.focus?.parent,
									selection.focus?.offset,
									selection.isSimilar( writer.createSelection( positionAtStart ) )
								);
								if ( selection.isCollapsed && selection.isSimilar( writer.createSelection( positionAtStart ) ) ) {
									console.log( 'fixed position in postFixer' );
									writer.setSelection( positionAtStart.getShiftedBy( 1 ) );
								}

								hasInsertedTags = true;
							} else {
								if ( currentItem.getChildIndex( tagStart ) != 0 ) {
									// console.log( tagStart.index, currentItem );
									writer.insert( writer.createPositionAt( currentItem, 0 ), tagStart );

									hasInsertedTags = true;
								}

								if ( currentItem.getChildIndex( tagEnd ) != currentItem.childCount - 1 ) {
									// console.log( tagEnd.index, currentItem.childCount, currentItem );
									writer.insert( writer.createPositionAt( currentItem, 'end' ), tagEnd );

									hasInsertedTags = true;
								}
							}
						}
					}
				}
			} );

			// TODO I wonder if we could return false here all the time...
			// Otherwise, after adding the UI elements, we do another pass through the tree.
			return hasInsertedTags;
		} );

		editor.editing.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', ( event, data ) => {
			const viewPosition = data.viewPosition;

			if ( !viewPosition ) {
				console.log( 'aborted because no viewPosition... should not happen' );
				return;
			}

			if ( viewPosition.isAtStart ) {
				const parent = viewPosition.parent;
				if ( parent.is( 'element' ) ) {
					const firstChild = parent.getChild( 0 );
					if ( firstChild && firstChild.is( 'uiElement' ) && firstChild.hasClass( 'tag-start' ) ) {
						console.log( 'fixed position in modelToViewPosition' );
						data.viewPosition = viewPosition.getShiftedBy( 1 );
					}
				}
			}
		}, { priority: priorities.low - 1 } );
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
}

type TagElements = {
	tagStart: ViewUIElement;
	tagEnd: ViewUIElement;
	areNew: boolean;
};
