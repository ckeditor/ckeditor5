/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'utils-diff',
	'treeview/observer/observer',
	'treeview/element',
	'treeview/text',
	'treeview/position'
], ( diff, Observer, ViewElement, ViewText, Position ) => {
	class MutationObserver extends Observer {
		constructor() {
			super();

			this.config = {
				childList: true,
				characterData: true,
				characterDataOldValue: true,
				subtree: true
			};
		}

		/**
		 * @method init
		 * @param {treeView.TreeView}
		 */
		init( treeView ) {
			this.domRoot = treeView.domRoot;

			this._mutationObserver = new window.MutationObserver( this._onMutations.bind( this ) );
		}

		/**
		 * @method attach
		 */
		attach() {
			this._mutationObserver.observe( this.domRoot, this.config );
		}

		/**
		 * @method detach
		 */
		detach() {
			this._mutationObserver.disconnect();
		}

		_onMutations( mutations ) {
			// Use set for deduplication.
			const mutatedTexts = new Set();
			const mutatedElements = new Set();

			for ( let mutation of mutations ) {
				if ( mutation.type === 'childList' ) {
					const element = ViewElement.getCorespondingElement( mutation.target );

					if ( element ) {
						mutatedElements.add( element );
					}
				}
			}

			for ( let mutation of mutations ) {
				if ( mutation.type === 'characterData' ) {
					const text = Text.getCorespondingText( mutation.target );

					if ( text && !mutatedElements.has( text.parent ) ) {
						mutatedTexts.add( text );
					}
				}
			}

			for ( let text of mutatedTexts ) {
				text.markToSync( ViewText.TEXT_NEEDS_UPDATE );

				this.fire( 'text', text ); // TODO: new text
			}

			for ( let viewElement of mutatedElements ) {
				const domElement = viewElement.domElement;
				const domChildren = domElement.childNodes;
				const viewChildren = viewElement.getChildren();

				viewElement.markToSync( ViewElement.CHILDREN_NEED_UPDATE );

				const actions = diff( viewChildren, domChildren, compareNodes );

				let domOffset = 0;
				let viewOffset = 0;

				for ( let action of actions ) {
					if ( action === diff.EQUAL ) {
						domOffset++;
						viewOffset++;
					} else if ( action === diff.INSERT ) {
						this.fire( 'insert', new Position( viewElement, viewOffset ), domToView( domChildren[ domOffset ] ) );

						domOffset++;
					} else if ( action === diff.DELETE ) {
						this.fire( 'delete', viewChildren[ viewOffset ] );

						viewOffset++;
					}
				}

				// TODO: fire order
				// TODO: update positions?
				// TODO: delete and insert -> move
				// 	     delete text and insert text -> 'text' event
			}

			this.treeView.render();

			function compareNodes( viewNode, domNode ) {
				// Elements.
				if ( domNode instanceof HTMLElement && viewNode instanceof ViewElement ) {
					return domNode === viewNode.DOMElement;
				}
				// Texts.
				else if ( domNode instanceof Text && viewNode instanceof ViewText ) {
					return domNode.data === viewNode.getText();
				}

				// Not matching types.
				return false;
			}

			function domToView( domElement ) {
				let viewElement = ViewElement.getCorespondingElement( domElement );
				if ( viewElement ) {
					return viewElement;
				}
				// TODO
			}
		}
	}

	return MutationObserver;
} );
