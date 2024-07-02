/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/mutationobserver
 */

/* globals window */

import Observer from './observer.js';
import { startsWithFiller } from '../filler.js';
import { isEqualWith } from 'lodash-es';

import type DomConverter from '../domconverter.js';
import type View from '../view.js';
import type ViewElement from '../element.js';
import type ViewNode from '../node.js';
import type ViewText from '../text.js';
import type { ChangeType } from '../document.js';

// @if CK_DEBUG_TYPING // const { _debouncedLine } = require( '../../dev-utils/utils.js' );

/**
 * Mutation observer's role is to watch for any DOM changes inside the editor that weren't
 * done by the editor's {@link module:engine/view/renderer~Renderer} itself and reverting these changes.
 *
 * It does this by observing all mutations in the DOM, marking related view elements as changed and calling
 * {@link module:engine/view/renderer~Renderer#render}. Because all mutated nodes are marked as
 * "to be rendered" and the {@link module:engine/view/renderer~Renderer#render `render()`} method is called,
 * all changes are reverted in the DOM (the DOM is synced with the editor's view structure).
 *
 * Note that this observer is attached by the {@link module:engine/view/view~View} and is available by default.
 */
export default class MutationObserver extends Observer {
	/**
	 * Reference to the {@link module:engine/view/view~View#domConverter}.
	 */
	public readonly domConverter: DomConverter;

	/**
	 * Native mutation observer config.
	 */
	private readonly _config: MutationObserverInit;

	/**
	 * Observed DOM elements.
	 */
	private readonly _domElements: Set<HTMLElement>;

	/**
	 * Native mutation observer.
	 */
	private _mutationObserver: InstanceType<typeof window.MutationObserver>;

	/**
	 * @inheritDoc
	 */
	constructor( view: View ) {
		super( view );

		this._config = {
			childList: true,
			characterData: true,
			subtree: true
		};

		this.domConverter = view.domConverter;

		this._domElements = new Set();
		this._mutationObserver = new window.MutationObserver( this._onMutations.bind( this ) );
	}

	/**
	 * Synchronously handles mutations and empties the queue.
	 */
	public flush(): void {
		this._onMutations( this._mutationObserver.takeRecords() );
	}

	/**
	 * @inheritDoc
	 */
	public observe( domElement: HTMLElement ): void {
		this._domElements.add( domElement );

		if ( this.isEnabled ) {
			this._mutationObserver.observe( domElement, this._config );
		}
	}

	/**
	 * @inheritDoc
	 */
	public override stopObserving( domElement: HTMLElement ): void {
		this._domElements.delete( domElement );

		if ( this.isEnabled ) {
			// Unfortunately, it is not possible to stop observing particular DOM element.
			// In order to stop observing one of multiple DOM elements, we need to re-connect the mutation observer.
			this._mutationObserver.disconnect();

			for ( const domElement of this._domElements ) {
				this._mutationObserver.observe( domElement, this._config );
			}
		}
	}

	/**
	 * @inheritDoc
	 */
	public override enable(): void {
		super.enable();

		for ( const domElement of this._domElements ) {
			this._mutationObserver.observe( domElement, this._config );
		}
	}

	/**
	 * @inheritDoc
	 */
	public override disable(): void {
		super.disable();

		this._mutationObserver.disconnect();
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this._mutationObserver.disconnect();
	}

	/**
	 * Handles mutations. Mark view elements to sync and call render.
	 *
	 * @param domMutations Array of native mutations.
	 */
	private _onMutations( domMutations: Array<MutationRecord> ) {
		// As a result of this.flush() we can have an empty collection.
		if ( domMutations.length === 0 ) {
			return;
		}

		const domConverter = this.domConverter;

		// Use map and set for deduplication.
		const mutatedTextNodes = new Set<ViewText>();
		const elementsWithMutatedChildren = new Set<ViewElement>();

		// Handle `childList` mutations first, so we will be able to check if the `characterData` mutation is in the
		// element with changed structure anyway.
		for ( const mutation of domMutations ) {
			const element = domConverter.mapDomToView( mutation.target as HTMLElement );

			if ( !element ) {
				continue;
			}

			// Do not collect mutations from UIElements and RawElements.
			if ( element.is( 'uiElement' ) || element.is( 'rawElement' ) ) {
				continue;
			}

			if ( mutation.type === 'childList' && !this._isBogusBrMutation( mutation ) ) {
				elementsWithMutatedChildren.add( element as ViewElement );
			}
		}

		// Handle `characterData` mutations later, when we have the full list of nodes which changed structure.
		for ( const mutation of domMutations ) {
			const element = domConverter.mapDomToView( mutation.target as HTMLElement );

			// Do not collect mutations from UIElements and RawElements.
			if ( element && ( element.is( 'uiElement' ) || element.is( 'rawElement' ) ) ) {
				continue;
			}

			if ( mutation.type === 'characterData' ) {
				const text = domConverter.findCorrespondingViewText( mutation.target as Text ) as ViewText;

				if ( text && !elementsWithMutatedChildren.has( text.parent as ViewElement ) ) {
					mutatedTextNodes.add( text );
				}
				// When we added first letter to the text node which had only inline filler, for the DOM it is mutation
				// on text, but for the view, where filler text node did not exist, new text node was created, so we
				// need to handle it as a 'children' mutation instead of 'text'.
				else if ( !text && startsWithFiller( mutation.target ) ) {
					elementsWithMutatedChildren.add(
						domConverter.mapDomToView( mutation.target.parentNode as HTMLElement ) as ViewElement
					);
				}
			}
		}

		// Now we build the list of mutations to mark elements. We did not do it earlier to avoid marking the
		// same node multiple times in case of duplication.

		const mutations: Array<MutationData> = [];

		for ( const textNode of mutatedTextNodes ) {
			mutations.push( { type: 'text', node: textNode } );
		}

		for ( const viewElement of elementsWithMutatedChildren ) {
			const domElement = domConverter.mapViewToDom( viewElement )!;
			const viewChildren = Array.from( viewElement.getChildren() );
			const newViewChildren = Array.from( domConverter.domChildrenToView( domElement, { withChildren: false } ) );

			// It may happen that as a result of many changes (sth was inserted and then removed),
			// both elements haven't really changed. #1031
			if ( !isEqualWith( viewChildren, newViewChildren, sameNodes ) ) {
				mutations.push( { type: 'children', node: viewElement } );
			}
		}

		// In case only non-relevant mutations were recorded it skips the event and force render (#5600).
		if ( mutations.length ) {
			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	_debouncedLine();
			// @if CK_DEBUG_TYPING // 	console.group( '%c[MutationObserver]%c Mutations detected',
			// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green', 'font-weight: bold'
			// @if CK_DEBUG_TYPING // 	);
			// @if CK_DEBUG_TYPING // }

			this.document.fire<ViewDocumentMutationsEvent>( 'mutations', { mutations } );

			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.groupEnd();
			// @if CK_DEBUG_TYPING // }
		}
	}

	/**
	 * Checks if mutation was generated by the browser inserting bogus br on the end of the block element.
	 * Such mutations are generated while pressing space or performing native spellchecker correction
	 * on the end of the block element in Firefox browser.
	 *
	 * @param mutation Native mutation object.
	 */
	private _isBogusBrMutation( mutation: MutationRecord ) {
		let addedNode = null;

		// Check if mutation added only one node on the end of its parent.
		if ( mutation.nextSibling === null && mutation.removedNodes.length === 0 && mutation.addedNodes.length == 1 ) {
			addedNode = this.domConverter.domToView( mutation.addedNodes[ 0 ], {
				withChildren: false
			} );
		}

		return addedNode && addedNode.is( 'element', 'br' );
	}
}

function sameNodes( child1: ViewNode, child2: ViewNode ) {
	// First level of comparison (array of children vs array of children) – use the Lodash's default behavior.
	if ( Array.isArray( child1 ) ) {
		return;
	}

	// Elements.
	if ( child1 === child2 ) {
		return true;
	}
	// Texts.
	else if ( child1.is( '$text' ) && child2.is( '$text' ) ) {
		return child1.data === child2.data;
	}

	// Not matching types.
	return false;
}

/**
 * Event fired on DOM mutations detected.
 *
 * This event is introduced by {@link module:engine/view/observer/mutationobserver~MutationObserver} and available
 * by default in all editor instances (attached by {@link module:engine/view/view~View}).
 *
 * @eventName module:engine/view/document~Document#mutations
 * @param data Event data containing detailed information about the event.
 */
export type ViewDocumentMutationsEvent = {
	name: 'mutations';
	args: [ data: MutationsEventData ];
};

/**
 * The value of {@link ~ViewDocumentMutationsEvent}.
 */
export type MutationsEventData = {
	mutations: Array<MutationData>;
};

/**
 * A single entry in {@link ~MutationsEventData} mutations array.
 */
export type MutationData = {

	/**
	 * Type of mutation detected.
	 */
	type: ChangeType;

	/**
	 * The view node related to the detected mutation.
	 */
	node: ViewNode;
};
