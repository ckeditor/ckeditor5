/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Observer from './observer.js';
import EmitterMixin from '../../emittermixin.js';
import objectUtils from '../../lib/lodash/object.js';

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

		this.converter = treeView.converter;

		this.renderer = treeView.renderer;

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
		// Use　map and set for deduplication.
		const mutatedTexts = new Map();
		const mutatedElements = new Set();

		for ( let mutation of domMutations ) {
			if ( mutation.type === 'childList' ) {
				const element = this.converter.getCorespondingViewElement( mutation.target );

				if ( element ) {
					mutatedElements.add( element );
				}
			}
		}

		for ( let mutation of domMutations ) {
			if ( mutation.type === 'characterData' ) {
				const text = this.converter.getCorespondingViewText( mutation.target );

				if ( text && !mutatedElements.has( text.parent ) ) {
					mutatedTexts.set( text, {
						type: 'text',
						oldText: text.getText(),
						newText: mutation.target.data,
						node: text
					} );
				}
			}
		}

		const viewMutations = [];

		for ( let mutatedText of mutatedTexts.values() ) {
			this.renderer.markToSync( 'TEXT', mutatedText.node );

			viewMutations.push( mutatedText );
		}

		for ( let viewElement of mutatedElements ) {
			const domElement = this.converter.getCorespondingDomElement( viewElement );
			const domChildren = domElement.childNodes;
			const viewChildren = viewElement.getChildren();
			const newViewChildren = [];

			for ( let i = 0; i < domChildren.length; i++ ) {
				newViewChildren.push( this.converter.domToView( domChildren[ i ] ) );
			}

			this.renderer.markToSync( 'CHILDREN', viewElement );

			viewMutations.push( {
				type: 'childNodes',
				oldChildren: viewChildren,
				newChildren: newViewChildren,
				node: viewElement
			} );
		}

		this.fire( 'mutations', viewMutations );

		this.treeView.render();
	}
}

objectUtils.extend( MutationObserver.prototype, EmitterMixin );
