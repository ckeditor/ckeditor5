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

window.FOCUS_TRACKERS = [];

window.logFocusTrackers = function() {
	Array.from( window.FOCUS_TRACKERS )
		.filter( a => a._getLabel() !== 'generic' )
		.forEach( tracker => {
			console.group( logFT( tracker ) );
			console.log( '  isFocused:', tracker.isFocused );
			console.log( '  focusedElement:', tracker.focusedElement );
			console.log( '  elements:', tracker.elements );
			console.log( '  chainedFocusTrackers:', tracker.chainedFocusTrackers );
			console.groupEnd();
		} );
};

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
	 * List of registered elements.
	 *
	 * @internal
	 */
	public _elements: Set<Element> = new Set();

	public _chainedFocusTrackers: Set<FocusTracker> = new Set();

	/**
	 * Event loop timeout.
	 */
	private _nextEventLoopTimeout: ReturnType<typeof setTimeout> | null = null;

	private _label: string | ( () => string ) | undefined;

	private _previousIsFocused: boolean | undefined;

	private _previousFocusedElement: Element | null | undefined;

	constructor( label?: string ) {
		super();

		this._label = label;

		window.FOCUS_TRACKERS.push( this );

		this._emitEventsOnFocusChange( {
			isFocused: false,
			focusedElement: null
		} );
	}

	/**
	 * True when one of the registered elements is focused.
	 *
	 * @readonly
	 * @observable
	 */
	public get isFocused(): boolean {
		return !!this._focusedElement || !!this._focusedChainedFocusTracker;
	}

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
	public get focusedElement(): Element | null {
		if ( !this.isFocused ) {
			return null;
		}

		return this._focusedElement || this._focusedChainedFocusTracker!.focusedElement;
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
	public get chainedFocusTrackers(): Array<FocusTracker> {
		return Array.from( this._chainedFocusTrackers.values() );
	}

	/**
	 * Starts tracking the specified element.
	 */
	public add( element: Element ): void {
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

	/**
	 * Stops tracking the specified element and stops listening on this element.
	 */
	public remove( element: Element ): void {
		if ( element === this.focusedElement ) {
			this._blur();
		}

		if ( this._elements.has( element ) ) {
			this.stopListening( element );
			this._elements.delete( element );
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

	public chain( otherFocusTracker: FocusTracker ): void {
		console.log( `chain ${ logFT( otherFocusTracker ) } as an extension of ${ logFT( this ) }` );

		this.listenTo( otherFocusTracker, 'change:isFocused', () => {
			console.group( `${ logFT( otherFocusTracker ) } change:isFocused =`, otherFocusTracker.isFocused );

			if ( otherFocusTracker.isFocused ) {
				this._focus( otherFocusTracker.focusedElement! );
			} else {
				this._blur();
			}

			console.groupEnd();
		} );

		this._chainedFocusTrackers.add( otherFocusTracker );
	}

	public unchain( otherFocusTracker: FocusTracker ): void {
		console.log( 'TODO' );
	}

	/**
	 * Stores currently focused element and set {@link #isFocused} as `true`.
	 */
	private _focus( element: Element ): void {
		console.log( `${ logFT( this ) }#focus()` );

		clearTimeout( this._nextEventLoopTimeout! );

		this._emitEventsOnFocusChange( {
			focusedElement: element,
			isFocused: true
		} );
	}

	/**
	 * Clears currently focused element and set {@link #isFocused} as `false`.
	 * This method uses `setTimeout` to change order of fires `blur` and `focus` events.
	 */
	private _blur(): void {
		clearTimeout( this._nextEventLoopTimeout! );

		// Could be still focused via chained FTs.
		if ( this.isFocused ) {
			console.log( 'Blur aborted. Still focused.' );
			return;
		}

		console.log( `${ logFT( this ) }#blur()` );

		this._nextEventLoopTimeout = setTimeout( () => {
			this._emitEventsOnFocusChange( {
				focusedElement: null,
				isFocused: false
			} );
		}, 0 );
	}

	private get _focusedElement(): Element | undefined {
		return this.elements.find( element => element.contains( document.activeElement ) );
	}

	private get _focusedChainedFocusTracker(): FocusTracker | undefined {
		return this.chainedFocusTrackers.find( ( { isFocused } ) => isFocused );
	}

	private _emitEventsOnFocusChange( newState: {
		isFocused: boolean;
		focusedElement: Element | null;
	} ): void {
		if ( this._previousIsFocused !== newState.isFocused ) {
			this.fire( 'change:isFocused', 'isFocused', newState.isFocused, this._previousIsFocused );
			this._previousIsFocused = newState.isFocused;
		}

		if ( this._previousFocusedElement !== newState.focusedElement ) {
			this.fire( 'change:focusedElement', 'focusedElement', newState.focusedElement, this._previousFocusedElement );
			this._previousFocusedElement = newState.focusedElement;
		}
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
export function isViewWithFocusTracker( view: View ): view is ViewWithFocusTracker {
	return 'focusTracker' in view && view.focusTracker instanceof FocusTracker;
}

function logFT( ft: FocusTracker ) {
	return `[FT:${ ft._getLabel() }]`;
}
