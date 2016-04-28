/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Observer from './observer.js';

/**
 * Mutation observer class observes changes in the DOM, fires {@link engine.treeView.TreeView#mutations} event, mark view elements
 * as changed and call {@link engine.treeView.render}. Because all mutated nodes are marked as "to be rendered" and the
 * {@link engine.treeView.render} is called, all changes will be reverted, unless the mutation will be handled by the
 * {@link engine.treeView.TreeView#mutations} event listener. It means user will see only handled changes, and the editor will
 * block all changes which are not handled.
 *
 * Mutation Observer also take care of reducing number of mutations which are fired. It removes duplicates and
 * mutations on elements which do not have corresponding view elements. Also
 * {@link engine.treeView.TreeView.MutatatedText text mutation} is fired only if parent element do not change child list.
 *
 * @memberOf engine.treeView.observer
 * @extends engine.treeView.observer.Observer
 */
export default class MutationObserver extends Observer {
	constructor( treeView ) {
		super( treeView );

		/**
		 * Native mutation observer config.
		 *
		 * @private
		 * @member {Object} engine.treeView.observer.MutationObserver#_config
		 */
		this._config = {
			childList: true,
			characterData: true,
			characterDataOldValue: true,
			subtree: true
		};

		/**
		 * Reference to the {@link engine.treeView.TreeView#domConverter}.
		 *
		 * @member {engine.treeView.DomConverter} engine.treeView.observer.MutationObserver#domConverter
		 */
		this.domConverter = treeView.domConverter;

		/**
		 * Reference to the {@link engine.treeView.TreeView#renderer}.
		 *
		 * @member {engine.treeView.Renderer} engine.treeView.observer.MutationObserver#renderer
		 */
		this.renderer = treeView.renderer;

		/**
		 * Observed DOM elements.
		 *
		 * @private
		 * @member {Array.<HTMLElement>} engine.treeView.observer.MutationObserver#_domElements
		 */
		this._domElements = [];

		/**
		 * Native mutation observer.
		 *
		 * @private
		 * @member {MutationObserver} engine.treeView.observer.MutationObserver#_mutationObserver
		 */
		this._mutationObserver = new window.MutationObserver( this._onMutations.bind( this ) );
	}

	flush() {
		this._onMutations( this._mutationObserver.takeRecords() );
	}

	/**
	 * @inheritDoc
	 */
	observe( domElement ) {
		this._domElements.push( domElement );

		if ( this.isEnabled ) {
			this._mutationObserver.observe( domElement, this._config );
		}
	}

	/**
	 * @inheritDoc
	 */
	enable() {
		super.enable();

		for ( let domElement of this._domElements ) {
			this._mutationObserver.observe( domElement, this._config );
		}
	}

	/**
	 * @inheritDoc
	 */
	disable() {
		super.disable();

		this._mutationObserver.disconnect();
	}

	/**
	 * Handles mutations. Deduplicates, mark view elements to sync, fire event and call render.
	 *
	 * @protected
	 * @method engine.treeView.observer.MutationObserver#_onMutations
	 * @param {Array.<Object>} domMutations Array of native mutations.
	 */
	_onMutations( domMutations ) {
		// As a result of this.flush() we can have an empty collection.
		if ( domMutations.length === 0 ) {
			return;
		}

		const domConverter = this.domConverter;

		// Use　map and set for deduplication.
		const mutatedTexts = new Map();
		const mutatedElements = new Set();

		// Assume that all elements are in the same document.
		const domSelection = domMutations[ 0 ].target.ownerDocument.defaultView.getSelection();
		const viewSelection = domConverter.domSelectionToView( domSelection );

		// Handle `childList` mutations first, so we will be able to check if the `characterData` mutation is in the
		// element with changed structure anyway.
		for ( let mutation of domMutations ) {
			if ( mutation.type === 'childList' ) {
				const element = domConverter.getCorrespondingViewElement( mutation.target );

				if ( element ) {
					mutatedElements.add( element );
				}
			}
		}

		// Handle `characterData` mutations later, when we have the full list of nodes which changed structure.
		for ( let mutation of domMutations ) {
			if ( mutation.type === 'characterData' ) {
				const text = domConverter.getCorrespondingViewText( mutation.target );

				if ( text && !mutatedElements.has( text.parent ) ) {
					// Use text as a key, for deduplication. If there will be another mutation on the same text element
					// we will have only one in the map.
					mutatedTexts.set( text, {
						type: 'text',
						oldText: text.data,
						newText: mutation.target.data,
						node: text,
						selection: viewSelection
					} );
				} else if ( !text && domConverter.startsWithFiller( mutation.target ) ) {
					mutatedElements.add( domConverter.getCorrespondingViewElement( mutation.target.parentNode ) );
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
			const domElement = domConverter.getCorrespondingDomElement( viewElement );
			const viewChildren = viewElement.getChildren();
			const newViewChildren = domConverter.domChildrenToView( domElement );

			this.renderer.markToSync( 'CHILDREN', viewElement );
			viewMutations.push( {
				type: 'children',
				oldChildren: Array.from( viewChildren ),
				newChildren: Array.from( newViewChildren ),
				node: viewElement,
				selection: viewSelection
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
 * @event engine.treeView.TreeView#mutations
 * @param {Array.<engine.treeView.TreeView~MutatatedText|engine.treeView.TreeView~MutatatedChildren>} viewMutations
 * Array of mutations.
 * For mutated texts it will be {@link engine.treeView.TreeView~MutatatedText} and for mutated elements it will be
 * {@link engine.treeView.TreeView~MutatatedElement}. You can recognize the type based on the `type` property.
 */

/**
 * Mutation item for text.
 *
 * @see engine.treeView.TreeView#mutations
 * @see engine.treeView.MutatatedChildren
 *
 * @typedef {Object} engine.treeView.MutatatedText
 *
 * @property {String} type For text mutations it is always 'text'.
 * @property {engine.treeView.Text} node Mutated text node.
 * @property {String} oldText Old text.
 * @property {String} newText New text.
 */

/**
 * Mutation item for child nodes.
 *
 * @see engine.treeView.TreeView#mutations
 * @see engine.treeView.MutatatedText
 *
 * @typedef {Object} engine.treeView.MutatatedChildren
 *
 * @property {String} type For child nodes mutations it is always 'children'.
 * @property {engine.treeView.Element} node Parent of the mutated children.
 * @property {Array.<engine.treeView.Node>} oldChildren Old child nodes.
 * @property {Array.<engine.treeView.Node>} newChildren New child nodes.
 */
