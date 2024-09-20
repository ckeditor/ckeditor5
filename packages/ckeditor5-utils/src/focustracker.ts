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
import { isElement as _isElement } from 'lodash-es';

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
		return Array.from( this._elements.values() );
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
	public add( elementOrView: Element | View ): void {
		if ( isElement( elementOrView ) ) {
			this._addElement( elementOrView );
		} else {
			if ( isViewWithFocusTracker( elementOrView ) ) {
				this._addFocusTracker( elementOrView.focusTracker );
			} else {
				if ( !elementOrView.element ) {
					/**
					 * The {@link module:ui/view~View} added to the {@link module:utils/focustracker~FocusTracker} does not have an
					 * {@link module:ui/view~View#element}. Make sure the view is {@link module:ui/view~View#render} before adding
					 * it to the focus tracker.
					 *
					 * @error focustracker-add-view-missing-element
					 */
					throw new CKEditorError( 'focustracker-add-view-missing-element', {
						focusTracker: this,
						view: elementOrView
					} );
				}

				this._addElement( elementOrView.element );
			}
		}
	}

	/**
	 * Stops tracking the specified element and stops listening on this element.
	 */
	public remove( elementOrView: Element | View ): void {
		if ( isElement( elementOrView ) ) {
			this._removeElement( elementOrView );
		} else {
			if ( isViewWithFocusTracker( elementOrView ) ) {
				this._removeFocusTracker( elementOrView.focusTracker );
			} else {
				if ( !elementOrView.element ) {
					/**
					 * The {@link module:ui/view~View} removed from the {@link module:utils/focustracker~FocusTracker} does not have an
					 * {@link module:ui/view~View#element}. Make sure the view is {@link module:ui/view~View#render} before removing
					 * it from the focus tracker.
					 *
					 * @error focustracker-remove-view-missing-element
					 */
					throw new CKEditorError( 'focustracker-remove-view-missing-element', {
						focusTracker: this,
						view: elementOrView
					} );
				}

				this._removeElement( elementOrView.element );
			}
		}
	}

	private _addElement( element: Element ): void {
		if ( this._elements.has( element ) ) {
			/**
			 * This element is already tracked by {@link module:utils/focustracker~FocusTracker}.
			 *
			 * @error focustracker-add-element-already-exist
			 */
			throw new CKEditorError( 'focustracker-add-element-already-exist', this );
		}

		this.listenTo( element, 'focus', () => this._focus( element ), { useCapture: true } );
		this.listenTo( element, 'blur', () => this._blur(), { useCapture: true } );
		this._elements.add( element );
	}

	private _removeElement( element: Element ): void {
		if ( element === this.focusedElement ) {
			this._blur();
		}

		if ( this._elements.has( element ) ) {
			this.stopListening( element );
			this._elements.delete( element );
		}
	}

	private _addFocusTracker( focusTracker: FocusTracker ): void {
		if ( DEBUG ) {
			console.log( `[FT] Add external ${ logFT( focusTracker ) } to ${ logFT( this ) }` );
		}

		this.listenTo( focusTracker, 'change:isFocused', () => {
			if ( DEBUG ) {
				console.group( `[FT] External ${ logFT( focusTracker ) } change:isFocused =`, focusTracker.isFocused );
			}

			if ( focusTracker.isFocused ) {
				this._focus( focusTracker.focusedElement! );
			} else {
				this._blur();
			}

			if ( DEBUG ) {
				console.groupEnd();
			}
		} );

		this._externalFocusTrackers.add( focusTracker );
	}

	private _removeFocusTracker( focusTracker: FocusTracker ): void {
		if ( DEBUG ) {
			console.log( `[FT] Remove external ${ logFT( focusTracker ) } from ${ logFT( this ) }` );
		}

		this.stopListening( focusTracker );
		this._externalFocusTrackers.delete( focusTracker );

		if ( focusTracker.isFocused ) {
			this._blur();
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

type ViewWithFocusTracker = View & { focusTracker: FocusTracker };

/**
 * Checks whether a view is an instance of {@link ~ViewWithFocusTracker}.
 *
 * @param view A view to be checked.
 */
function isViewWithFocusTracker( view: any ): view is ViewWithFocusTracker {
	return 'focusTracker' in view && view.focusTracker instanceof FocusTracker;
}

function logFT( ft: FocusTracker ) {
	return `[${ ft._getLabel() }]`;
}

function isElement( value: any ): value is Element {
	return _isElement( value );
}
