/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import diff from '../../utils-diff.js';
import Observer from './observer.js';
import ViewElement from '../element.js';
import ViewText from '../text.js';
import objectUtils from '../../lib/lodash/object.js';
import EmitterMixin from '../../emittermixin.js';

export default class MutationObserver extends Observer {
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
		this.treeView = treeView;
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

	_onMutations( domMutations ) {
		// Use set for deduplication.
		const mutatedTexts = new Set();
		const mutatedElements = new Set();

		for ( let mutation of domMutations ) {
			if ( mutation.type === 'childList' ) {
				const element = ViewElement.getCorespondingElement( mutation.target );

				if ( element ) {
					mutatedElements.add( element );
				}
			}
		}

		for ( let mutation of domMutations ) {
			if ( mutation.type === 'characterData' ) {
				const text = ViewText.getCorespondingText( mutation.target );

				if ( text && !mutatedElements.has( text.parent ) ) {
					mutatedTexts.add( {
						type: 'text',
						oldText: text.getText(),
						newText: mutation.target.data,
						node: text
					} );
				}
			}
		}

		const viewMutations = [];

		for ( let mutatedText of mutatedTexts ) {
			mutatedText.node.markToSync( 'TEXT_NEEDS_UPDATE' );

			viewMutations.push( mutatedText );
		}

		for ( let viewElement of mutatedElements ) {
			const domElement = viewElement.domElement;
			const domChildren = domElement.childNodes;
			const viewChildren = viewElement.getChildren();
			const newViewChildren = [];

			for ( let domChild of domChildren ) {
				newViewChildren.push( ViewElement.createFromDom( domChild ) );
			}

			viewElement.markToSync( 'CHILDREN_NEED_UPDATE' );

			viewMutations.push( {
				type: 'childNodes',
				oldChildren: viewElement.getChildren(),
				newChildren: newViewChildren,
				diff: diff( viewChildren, newViewChildren, compareNodes ),
				node: viewElement
			} );
		}

		this.fire( 'mutations', viewMutations );

		this.treeView.render();

		function compareNodes( oldNode, newNode ) {
			// Elements.
			if ( oldNode instanceof ViewElement && newNode instanceof ViewElement ) {
				return oldNode === newNode;
			}
			// Texts.
			else if ( oldNode instanceof ViewText && newNode instanceof ViewText ) {
				return oldNode.getText() === newNode.getText();
			}

			// Not matching types.
			return false;
		}
	}
}

objectUtils.extend( MutationObserver.prototype, EmitterMixin );
