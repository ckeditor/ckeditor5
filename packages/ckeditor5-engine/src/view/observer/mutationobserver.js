/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Observer from './observer.js';
import { startsWithFiller, getDataWithoutFiller } from '../filler.js';

/**
 * Mutation observer class observes changes in the DOM, fires {@link engine.view.Document#mutations} event, mark view elements
 * as changed and call {@link engine.view.render}. Because all mutated nodes are marked as "to be rendered" and the
 * {@link engine.view.render} is called, all changes will be reverted, unless the mutation will be handled by the
 * {@link engine.view.Document#mutations} event listener. It means user will see only handled changes, and the editor will
 * block all changes which are not handled.
 *
 * Mutation Observer also take care of reducing number of mutations which are fired. It removes duplicates and
 * mutations on elements which do not have corresponding view elements. Also
 * {@link engine.view.Document.MutatatedText text mutation} is fired only if parent element do not change child list.
 *
 * Note that this observer is attached by the {@link engine.EditingController} and is available by default.
 *
 * @memberOf engine.view.observer
 * @extends engine.view.observer.Observer
 */
export default class MutationObserver extends Observer {
	constructor( document ) {
		super( document );

		/**
		 * Native mutation observer config.
		 *
		 * @private
		 * @member {Object} engine.view.observer.MutationObserver#_config
		 */
		this._config = {
			childList: true,
			characterData: true,
			characterDataOldValue: true,
			subtree: true
		};

		/**
		 * Reference to the {@link engine.view.Document#domConverter}.
		 *
		 * @member {engine.view.DomConverter} engine.view.observer.MutationObserver#domConverter
		 */
		this.domConverter = document.domConverter;

		/**
		 * Reference to the {@link engine.view.Document#renderer}.
		 *
		 * @member {engine.view.Renderer} engine.view.observer.MutationObserver#renderer
		 */
		this.renderer = document.renderer;

		/**
		 * Observed DOM elements.
		 *
		 * @private
		 * @member {Array.<HTMLElement>} engine.view.observer.MutationObserver#_domElements
		 */
		this._domElements = [];

		/**
		 * Native mutation observer.
		 *
		 * @private
		 * @member {MutationObserver} engine.view.observer.MutationObserver#_mutationObserver
		 */
		this._mutationObserver = new window.MutationObserver( this._onMutations.bind( this ) );
	}

	/**
	 * Synchronously fires {@link engine.view.Document#mutations} event with all mutations in record queue.
	 * At the same time empties the queue so mutations will not be fired twice.
	 */
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
	 * @private
	 * @method engine.view.observer.MutationObserver#_onMutations
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
						newText: getDataWithoutFiller( mutation.target ),
						node: text
					} );
				}
				// When we added first letter to the text node which had only inline filler, for the DOM it is mutation
				// on text, but for the view, where filler text node did not existed, new text node was created, so we
				// need to fire 'children' mutation instead of 'text'.
				else if ( !text && startsWithFiller( mutation.target ) ) {
					mutatedElements.add( domConverter.getCorrespondingViewElement( mutation.target.parentNode ) );
				}
			}
		}

		// Now we build the list of mutations to fire and mark elements. We did not do it earlier to avoid marking the
		// same node multiple times in case of duplication.

		// List of mutations we will fire.
		const viewMutations = [];

		for ( let mutatedText of mutatedTexts.values() ) {
			this.renderer.markToSync( 'text', mutatedText.node );
			viewMutations.push( mutatedText );
		}

		for ( let viewElement of mutatedElements ) {
			const domElement = domConverter.getCorrespondingDomElement( viewElement );
			const viewChildren = viewElement.getChildren();
			const newViewChildren = domConverter.domChildrenToView( domElement );

			this.renderer.markToSync( 'children', viewElement );
			viewMutations.push( {
				type: 'children',
				oldChildren: Array.from( viewChildren ),
				newChildren: Array.from( newViewChildren ),
				node: viewElement
			} );
		}

		this.document.fire( 'mutations', viewMutations );

		this.document.render();
	}
}

/**
 * Fired when mutation occurred. If tree view is not changed on this event, DOM will be reverter to the state before
 * mutation, so all changes which should be applied, should be handled on this event.
 *
 * Introduced by {@link engine.view.observer.MutationObserver}.
 *
 * Note that because {@link engine.view.observer.MutationObserver} is attached by the {@link engine.EditingController}
 * this event is available by default.
 *
 * @see engine.view.observer.MutationObserver
 * @event engine.view.Document#mutations
 * @param {Array.<engine.view.Document~MutatatedText|engine.view.Document~MutatatedChildren>} viewMutations
 * Array of mutations.
 * For mutated texts it will be {@link engine.view.Document~MutatatedText} and for mutated elements it will be
 * {@link engine.view.Document~MutatatedElement}. You can recognize the type based on the `type` property.
 */

/**
 * Mutation item for text.
 *
 * @see engine.view.Document#mutations
 * @see engine.view.MutatatedChildren
 *
 * @typedef {Object} engine.view.MutatatedText
 *
 * @property {String} type For text mutations it is always 'text'.
 * @property {engine.view.Text} node Mutated text node.
 * @property {String} oldText Old text.
 * @property {String} newText New text.
 */

/**
 * Mutation item for child nodes.
 *
 * @see engine.view.Document#mutations
 * @see engine.view.MutatatedText
 *
 * @typedef {Object} engine.view.MutatatedChildren
 *
 * @property {String} type For child nodes mutations it is always 'children'.
 * @property {engine.view.Element} node Parent of the mutated children.
 * @property {Array.<engine.view.Node>} oldChildren Old child nodes.
 * @property {Array.<engine.view.Node>} newChildren New child nodes.
 */
