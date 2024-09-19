/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global setTimeout, clearTimeout */

/**
 * @module utils/focustracker
 */

import DomEmitterMixin from './dom/emittermixin.js';
import ObservableMixin from './observablemixin.js';
import CKEditorError from './ckeditorerror.js';
import { type View } from '@ckeditor/ckeditor5-ui';

// window.FOCUS_TRACKERS = [];

// window.logFocusTrackers = function() {
// 	Array.from( window.FOCUS_TRACKERS )
// 		.filter( a => a._getLabel() !== 'generic' )
// 		.forEach( tracker => {
// 			console.group( logFT( tracker ) );
// 			console.log( '  isFocused:', tracker.isFocused );
// 			console.log( '  focusedElement:', tracker.focusedElement );
// 			console.log( '  elements:', tracker.elements );
// 			console.log( '  chainedFocusTrackers:', tracker.chainedFocusTrackers );
// 			console.groupEnd();
// 		} );
// };

const DEBUG = false;

/**
 * Allows observing a group of `Element`s whether at least one of them is focused.
 *
 * Used by the {@link module:core/editor/editor~Editor} in order to track whether the focus is still within the application,
 * or were used outside of its UI.
 *
 * **Note** `focus` and `blur` listeners use event capturing, so it is only needed to register wrapper `Element`
 * which contain other `focusable` elements. But note that this wrapper element has to be focusable too
 * (have e.g. `tabindex="-1"`).
 *
 * Check out the {@glink framework/deep-dive/ui/focus-tracking "Deep dive into focus tracking"} guide to learn more.
 */
export default class FocusTracker extends /* #__PURE__ */ DomEmitterMixin( /* #__PURE__ */ ObservableMixin() ) {
	/**
	 * True when one of the registered elements is focused.
	 *
	 * @readonly
	 * @observable
	 */
	declare public isFocused: boolean;

	/**
	 * The currently focused element.
	 *
	 * While {@link #isFocused `isFocused`} remains `true`, the focus can
	 * move between different UI elements. This property tracks those
	 * elements and tells which one is currently focused.
	 *
	 * @readonly
	 * @observable
	 */
	declare public focusedElement: Element | null;

	/**
	 * List of registered elements.
	 *
	 * @internal
	 */
	public _elements: Set<Element> = new Set();

	/**
	 * TODO
	 */
	public _externalFocusTrackers: Set<FocusTracker> = new Set();

	/**
	 * Event loop timeout.
	 */
	private _nextEventLoopTimeout: ReturnType<typeof setTimeout> | null = null;

	/**
	 * TODO
	 */
	private _label: string | ( () => string ) | undefined;

	constructor( label?: string ) {
		super();

		this._label = label;

		// ( window.FOCUS_TRACKERS as any ).push( this );

		this.set( 'isFocused', false );
		this.set( 'focusedElement', null );
	}

	/**
	 * List of registered elements.
	 */
	public get elements(): Array<Element> {
		return Array.from( this._elements.values() )
			.concat( this.externalFocusTrackers.flatMap( otherFocusTracker => otherFocusTracker.elements ) );
	}

	/**
	 * TODO
	 */
	public get externalFocusTrackers(): Array<FocusTracker> {
		return Array.from( this._externalFocusTrackers.values() );
	}

	/**
	 * Starts tracking the specified element.
	 */
	public add( elementOrView: Element | ViewWithFocusTracker ): void {
		if ( isViewWithFocusTracker( elementOrView ) ) {
			const otherFocusTracker = elementOrView.focusTracker;

			if ( DEBUG ) {
				console.log( `[FT] Add external ${ logFT( otherFocusTracker ) } to ${ logFT( this ) }` );
			}

			this.listenTo( otherFocusTracker, 'change:isFocused', () => {
				if ( DEBUG ) {
					console.group( `[FT] External ${ logFT( otherFocusTracker ) } change:isFocused =`, otherFocusTracker.isFocused );
				}

				if ( otherFocusTracker.isFocused ) {
					this._focus( otherFocusTracker.focusedElement! );
				} else {
					this._blur();
				}

				if ( DEBUG ) {
					console.groupEnd();
				}
			} );

			this._externalFocusTrackers.add( otherFocusTracker );

			return;
		}

		if ( this._elements.has( elementOrView ) ) {
			/**
			 * This element is already tracked by {@link module:utils/focustracker~FocusTracker}.
			 *
			 * @error focustracker-add-element-already-exist
			 */
			throw new CKEditorError( 'focustracker-add-element-already-exist', this );
		}

		this.listenTo( elementOrView, 'focus', () => this._focus( elementOrView ), { useCapture: true } );
		this.listenTo( elementOrView, 'blur', () => this._blur(), { useCapture: true } );
		this._elements.add( elementOrView );
	}

	/**
	 * Stops tracking the specified element and stops listening on this element.
	 */
	public remove( elementOrView: Element | ViewWithFocusTracker ): void {
		if ( isViewWithFocusTracker( elementOrView ) ) {
			const otherFocusTracker = elementOrView.focusTracker;

			if ( DEBUG ) {
				console.log( `[FT] Remove external ${ logFT( otherFocusTracker ) } from ${ logFT( this ) }` );
			}

			this.stopListening( otherFocusTracker );
			this._externalFocusTrackers.delete( otherFocusTracker );

			if ( otherFocusTracker.isFocused ) {
				this._blur();
			}

			return;
		}

		if ( elementOrView === this.focusedElement ) {
			this._blur();
		}

		if ( this._elements.has( elementOrView ) ) {
			this.stopListening( elementOrView );
			this._elements.delete( elementOrView );
		}
	}

	/**
	 * Destroys the focus tracker by:
	 * - Disabling all event listeners attached to tracked elements.
	 * - Removing all tracked elements that were previously added.
	 */
	public destroy(): void {
		this.stopListening();
	}

	/**
	 * Stores currently focused element and set {@link #isFocused} as `true`.
	 */
	private _focus( element: Element ): void {
		if ( DEBUG ) {
			console.log( `[FT] ${ logFT( this ) }#focus()` );
		}

		clearTimeout( this._nextEventLoopTimeout! );

		this.focusedElement = element;
		this.isFocused = true;
	}

	/**
	 * Clears currently focused element and set {@link #isFocused} as `false`.
	 * This method uses `setTimeout` to change order of fires `blur` and `focus` events.
	 */
	private _blur(): void {
		// Filter out blurs that are unnecessary:
		// * Chained FT blurs (e.g. when the focus still remains in one of the "local" elements),
		// * DOM blurs (e.g. when the focus still remains in one of chained focus trackers).
		if (
			this.elements.find( element => element.contains( document.activeElement ) ) ||
			this.externalFocusTrackers.find( ( { isFocused } ) => isFocused )
		) {
			return;
		}

		clearTimeout( this._nextEventLoopTimeout! );

		this._nextEventLoopTimeout = setTimeout( () => {
			if ( DEBUG ) {
				console.log( `[FT] ${ logFT( this ) }#blur()` );
			}

			this.focusedElement = null;
			this.isFocused = false;
		}, 0 );
	}

	public _getLabel(): string | undefined {
		return ( typeof this._label == 'function' ? this._label() : this._label ) || 'generic';
	}
}

export type ViewWithFocusTracker = View & { focusTracker: FocusTracker };

/**
 * Checks whether a view is an instance of {@link ~ViewWithFocusTracker}.
 *
 * @param view A view to be checked.
 */
export function isViewWithFocusTracker( view: any ): view is ViewWithFocusTracker {
	return 'focusTracker' in view && view.focusTracker instanceof FocusTracker;
}

function logFT( ft: FocusTracker ) {
	return `[${ ft._getLabel() }]`;
}
