/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Observer from './observer.js';

/**
 * Mutation observer class observes changes in the DOM, fires {@link treeView.TreeView#mutations} event, mark view elements
 * as changed and call {@link treeView.render}. Because all mutated nodes are marked as "to be rendered" and the
 * {@link treeView.render} is called, all changes will be reverted, unless the mutation will be handled by the
 * {@link treeView.TreeView#mutations} event listener. It means user will see only handled changes, and the editor will
 * block all changes which are not handled.
 *
 * Mutation Observer also take care of reducing number of mutations which are fired. It removes duplicates and
 * mutations on elements which do not have corresponding view elements. Also
 * {@link treeView.TreeView.MutatatedText text mutation} is fired only if parent element do not change child list.
 *
 * @class treeView.observer.MutationObserver
 */
export default class MutationObserver extends Observer {
	/**
	 * Mutation observer constructor. Note that most of the initialization is done in
	 * {@link treeView.observer.MutationObserver#init} method.
	 *
	 * @constructor
	 */
	constructor() {
		super();

		/**
		 * Native mutation observer config.
		 *
		 * @private
		 * @type {Object}
		 */
		this._config = {
			childList: true,
			characterData: true,
			characterDataOldValue: true,
			subtree: true
		};
	}

	// Docs in the base class.
	init( treeView ) {
		/**
		 * Reference to the {@link treeView.TreeView} object.
		 *
		 * @type {treeView.TreeView}
		 */
		this.treeView = treeView;

		/**
		 * Reference to the {@link treeView.TreeView#domRoot}.
		 *
		 * @type {HTMLElement}
		 */
		this.domRoot = treeView.domRoot;

		/**
		 * Reference to the {@link treeView.TreeView#converter}.
		 *
		 * @type {treeView.Converter}
		 */
		this.converter = treeView.converter;

		/**
		 * Reference to the {@link treeView.TreeView#renderer}.
		 *
		 * @type {treeView.Renderer}
		 */
		this.renderer = treeView.renderer;

		/**
		 * Native mutation observer.
		 *
		 * @private
		 * @type {window.MutationObserver}
		 */
		this._mutationObserver = new window.MutationObserver( this._onMutations.bind( this ) );
	}

	// Docs in the base class.
	attach() {
		this._mutationObserver.observe( this.domRoot, this._config );
	}

	// Docs in the base class.
	detach() {
		this._mutationObserver.disconnect();
	}

	/**
	 * Handles mutations. Deduplicates, mark view elements to sync, fire event and call render.
	 *
	 * @protected
	 * @param {Array.<Object>} domMutations Array of native mutations.
	 */
	_onMutations( domMutations ) {
		// Use　map and set for deduplication.
		const mutatedTexts = new Map();
		const mutatedElements = new Set();

		// Handle `childList` mutations first, so we will be able to check if the `characterData` mutation is in the
		// element with changed structure anyway.
		for ( let mutation of domMutations ) {
			if ( mutation.type === 'childList' ) {
				const element = this.converter.getCorrespondingViewElement( mutation.target );

				if ( element ) {
					mutatedElements.add( element );
				}
			}
		}

		// Handle `characterData` mutations later, when we have the full list of nodes which changed structure.
		for ( let mutation of domMutations ) {
			if ( mutation.type === 'characterData' ) {
				const text = this.converter.getCorrespondingViewText( mutation.target );

				if ( text && !mutatedElements.has( text.parent ) ) {
					// Use text as a key, for deduplication. If there will be another mutation on the same text element
					// we will have only one in the map.
					mutatedTexts.set( text, {
						type: 'text',
						oldText: text.data,
						newText: mutation.target.data,
						node: text
					} );
				}
			}
		}

		// Now we build the list of mutations to fire and mark elements. We did not do it earlier to avoid marking the
		// same node multiple times in case of duplication.

		// List of mutations we will fire.
		const viewMutations = [];

		for ( let mutatedText of mutatedTexts.values() ) {
			this.renderer.markToSync( 'TEXT', mutatedText.node );

			viewMutations.push( mutatedText );
		}

		for ( let viewElement of mutatedElements ) {
			const domElement = this.converter.getCorrespondingDomElement( viewElement );
			const domChildren = domElement.childNodes;
			const viewChildren = viewElement.getChildren();
			const newViewChildren = [];

			// We want to have a list of View elements, not DOM elements.
			for ( let i = 0; i < domChildren.length; i++ ) {
				newViewChildren.push( this.converter.domToView( domChildren[ i ] ) );
			}

			this.renderer.markToSync( 'CHILDREN', viewElement );

			viewMutations.push( {
				type: 'children',
				oldChildren: Array.from( viewChildren ),
				newChildren: newViewChildren,
				node: viewElement
			} );
		}

		this.treeView.fire( 'mutations', viewMutations );

		this.treeView.render();
	}
}

/**
 * Fired when mutation occurred. If tree view is not changed on this event, DOM will be reverter to the state before
 * mutation, so all changes which should be applied, should be handled on this event.
 *
 * @event mutations
 * @memberOf treeView.TreeView
 *
 * @param {Array.<treeView.MutatatedText|treeView.MutatatedChildren>} viewMutations
 * Array of mutations.
 * For mutated texts it will be {@link treeView.MutatatedText} and for mutated elements it will be
 * {@link treeView.MutatatedElement}. You can recognize the type based on the `type` property.
 */

/**
 * Mutation item for text.
 *
 * @see treeView.TreeView#mutations
 * @see treeView.MutatatedChildren
 *
 * @typedef {Object} treeView.MutatatedText
 *
 * @property {String} type For text mutations it is always 'text'.
 * @property {treeView.Text} node Mutated text node.
 * @property {String} oldText Old text.
 * @property {String} newText New text.
 */

/**
 * Mutation item for child nodes.
 *
 * @see treeView.TreeView#mutations
 * @see treeView.MutatatedText
 *
 * @typedef {Object} treeView.MutatatedChildren
 *
 * @property {String} type For child nodes mutations it is always 'children'.
 * @property {treeView.Element} node Parent of the mutated children.
 * @property {Array.<treeView.Node>} oldChildren Old child nodes.
 * @property {Array.<treeView.Node>} newChildren New child nodes.
 */
