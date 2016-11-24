/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/observer/mutationobserver
 */

/* globals window */

import Observer from './observer.js';
import ViewSelection from '../selection.js';
import { startsWithFiller, getDataWithoutFiller } from '../filler.js';

/**
 * Mutation observer class observes changes in the DOM, fires {@link module:engine/view/document~Document#event:mutations} event, mark view
 * elements as changed and call {@link module:engine/view/view~render}. Because all mutated nodes are marked as "to be rendered" and the
 * {@link module:engine/view/view.render} is called, all changes will be reverted, unless the mutation will be handled by the
 * {@link module:engine/view/document~Document#event:mutations} event listener. It means user will see only handled changes, and the editor
 * will block all changes which are not handled.
 *
 * Mutation Observer also take care of reducing number of mutations which are fired. It removes duplicates and
 * mutations on elements which do not have corresponding view elements. Also
 * {@link module:engine/view/observer/mutationobserver~MutatedText text mutation} is fired only if parent element do not change child list.
 *
 * Note that this observer is attached by the {@link module:engine/view/document~Document} and is available by default.
 * @extends module:engine/view/observer/observer~Observer.Observer
 */
export default class MutationObserver extends Observer {
	constructor( document ) {
		super( document );

		/**
		 * Native mutation observer config.
		 *
		 * @private
		 * @member {Object}
		 */
		this._config = {
			childList: true,
			characterData: true,
			characterDataOldValue: true,
			subtree: true
		};

		/**
		 * Reference to the {@link module:engine/view/document~Document#domConverter}.
		 *
		 * @member {module:engine/view/domconverter~DomConverter}
		 */
		this.domConverter = document.domConverter;

		/**
		 * Reference to the {@link module:engine/view/document~Document#renderer}.
		 *
		 * @member {module:engine/view/renderer~Renderer}
		 */
		this.renderer = document.renderer;

		/**
		 * Observed DOM elements.
		 *
		 * @private
		 * @member {Array.<HTMLElement>}
		 */
		this._domElements = [];

		/**
		 * Native mutation observer.
		 *
		 * @private
		 * @member {MutationObserver}
		 */
		this._mutationObserver = new window.MutationObserver( this._onMutations.bind( this ) );
	}

	/**
	 * Synchronously fires {@link module:engine/view/document~Document#event:mutations} event with all mutations in record queue.
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
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this._mutationObserver.disconnect();
	}

	/**
	 * Handles mutations. Deduplicates, mark view elements to sync, fire event and call render.
	 *
	 * @private
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

		// Retrieve `domSelection` using `ownerDocument` of one of mutated nodes.
		// There should not be simultaneous mutation in multiple documents, so it's fine.
		const domSelection = domMutations[ 0 ].target.ownerDocument.getSelection();

		let viewSelection = null;

		if ( domSelection && domSelection.anchorNode ) {
			// If `domSelection` is inside a dom node that is already bound to a view node from view tree, get
			// corresponding selection in the view and pass it together with `viewMutations`. The `viewSelection` may
			// be used by features handling mutations.
			// Only one range is supported.

			const viewSelectionAnchor = domConverter.domPositionToView( domSelection.anchorNode, domSelection.anchorOffset );
			const viewSelectionFocus = domConverter.domPositionToView( domSelection.focusNode, domSelection.focusOffset );

			// Anchor and focus has to be properly mapped to view.
			if ( viewSelectionAnchor && viewSelectionFocus ) {
				viewSelection = new ViewSelection();
				viewSelection.collapse( viewSelectionAnchor );
				viewSelection.setFocus( viewSelectionFocus );
			}
		}

		this.document.fire( 'mutations', viewMutations, viewSelection );

		// If nothing changes on `mutations` event, at this point we have "dirty DOM" (changed) and de-synched
		// view (which has not been changed). In order to "reset DOM" we render the view again.
		this.document.render();
	}
}

/**
 * Fired when mutation occurred. If tree view is not changed on this event, DOM will be reverter to the state before
 * mutation, so all changes which should be applied, should be handled on this event.
 *
 * Introduced by {@link module:engine/view/observer/mutationobserver~MutationObserver}.
 *
 * Note that because {@link module:engine/view/observer/mutationobserver~MutationObserver} is attached by the
 * {@link module:engine/view/document~Document}
 * this event is available by default.
 *
 * @see module:engine/view/observer/mutationobserver~MutationObserver
 * @event module:engine/view/document~Document#event:mutations
 * @param {Array.<module:engine/view/observer/mutationobserver~MutatedText|module:engine/view/observer/mutationobserver~MutatatedChildren>}
 * viewMutations Array of mutations.
 * For mutated texts it will be {@link module:engine/view/observer/mutationobserver~MutatedText} and for mutated elements it will be
 * {@link module:engine/view/observer/mutationobserver~MutatatedChildren}. You can recognize the type based on the `type` property.
 * @param {module:engine/view/selection~Selection|null} viewSelection View selection that is a result of converting DOM selection to view.
 * Keep in
 * mind that the DOM selection is already "updated", meaning that it already acknowledges changes done in mutation.
 */

/**
 * Mutation item for text.
 *
 * @see module:engine/view/document~Document#event:mutations
 * @see module:engine/view/observer/mutationobserver~MutatatedChildren
 *
 * @typedef {Object} module:engine/view/observer/mutationobserver~MutatedText
 *
 * @property {String} type For text mutations it is always 'text'.
 * @property {module:engine/view/text~Text} node Mutated text node.
 * @property {String} oldText Old text.
 * @property {String} newText New text.
 */

/**
 * Mutation item for child nodes.
 *
 * @see module:engine/view/document~Document#event:mutations
 * @see module:engine/view/observer/mutationobserver~MutatedText
 *
 * @typedef {Object} module:engine/view/observer/mutationobserver~MutatatedChildren
 *
 * @property {String} type For child nodes mutations it is always 'children'.
 * @property {module:engine/view/element~Element} node Parent of the mutated children.
 * @property {Array.<module:engine/view/node~Node>} oldChildren Old child nodes.
 * @property {Array.<module:engine/view/node~Node>} newChildren New child nodes.
 */
