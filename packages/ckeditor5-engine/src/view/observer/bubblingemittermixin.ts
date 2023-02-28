/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/bubblingemittermixin
 */

import {
	CKEditorError,
	EmitterMixin,
	EventInfo,
	toArray,
	type ArrayOrItem,
	type Emitter,
	type GetEventInfo,
	type GetNameOrEventInfo,
	type BaseEvent,
	type CallbackOptions
} from '@ckeditor/ckeditor5-utils';

import BubblingEventInfo from './bubblingeventinfo';
import type Document from '../document';
import type Node from '../node';
import type Range from '../range';
import type Element from '../element';
import type DocumentSelection from '../documentselection';

const contextsSymbol = Symbol( 'bubbling contexts' );

/**
 * Bubbling emitter mixin for the view document as described in the
 * {@link ~BubblingEmitter} interface.
 *
 * @mixin BubblingEmitterMixin
 * @implements module:engine/view/observer/bubblingemittermixin~BubblingEmitter
 */
export default function BubblingEmitterMixin<Base extends abstract new( ...args: Array<any> ) => Emitter>(
	base: Base
): {
	new( ...args: ConstructorParameters<Base> ): InstanceType<Base> & BubblingEmitter;
	prototype: InstanceType<Base> & BubblingEmitter;
} {
	abstract class Mixin extends base implements BubblingEmitter {
		public abstract get selection(): DocumentSelection;

		public override fire<TEvent extends BaseEvent>(
			eventOrInfo: GetNameOrEventInfo<TEvent>,
			...eventArgs: TEvent[ 'args' ]
		): GetEventInfo<TEvent>[ 'return' ] {
			try {
				const eventInfo = eventOrInfo instanceof EventInfo ? eventOrInfo : new EventInfo( this, eventOrInfo );
				const eventContexts = getBubblingContexts( this );

				if ( !eventContexts.size ) {
					return;
				}

				updateEventInfo( eventInfo, 'capturing', this );

				// The capture phase of the event.
				if ( fireListenerFor( eventContexts, '$capture', eventInfo, ...eventArgs ) ) {
					return eventInfo.return;
				}

				const startRange = ( eventInfo as BubblingEventInfo ).startRange || this.selection.getFirstRange();
				const selectedElement = startRange ? startRange.getContainedElement() : null;
				const isCustomContext = selectedElement ? Boolean( getCustomContext( eventContexts, selectedElement ) ) : false;

				let node: Node | null = selectedElement || getDeeperRangeParent( startRange );

				updateEventInfo( eventInfo, 'atTarget', node );

				// For the not yet bubbling event trigger for $text node if selection can be there and it's not a custom context selected.
				if ( !isCustomContext ) {
					if ( fireListenerFor( eventContexts, '$text', eventInfo, ...eventArgs ) ) {
						return eventInfo.return;
					}

					updateEventInfo( eventInfo, 'bubbling', node );
				}

				while ( node ) {
					// Root node handling.
					if ( node.is( 'rootElement' ) ) {
						if ( fireListenerFor( eventContexts, '$root', eventInfo, ...eventArgs ) ) {
							return eventInfo.return;
						}
					}

					// Element node handling.
					else if ( node.is( 'element' ) ) {
						if ( fireListenerFor( eventContexts, node.name, eventInfo, ...eventArgs ) ) {
							return eventInfo.return;
						}
					}

					// Check custom contexts (i.e., a widget).
					if ( fireListenerFor( eventContexts, node, eventInfo, ...eventArgs ) ) {
						return eventInfo.return;
					}

					node = node.parent as Node;

					updateEventInfo( eventInfo, 'bubbling', node );
				}

				updateEventInfo( eventInfo, 'bubbling', this );

				// Document context.
				fireListenerFor( eventContexts, '$document', eventInfo, ...eventArgs );

				return eventInfo.return;
			} catch ( err: any ) {
				// @if CK_DEBUG // throw err;
				/* istanbul ignore next */
				CKEditorError.rethrowUnexpectedError( err, this );
			}
		}

		public _addEventListener(
			this: Document,
			event: string,
			callback: ( ev: EventInfo, ...args: Array<any> ) => void,
			options: BubblingCallbackOptions
		) {
			const contexts = toArray( options.context || '$document' );
			const eventContexts = getBubblingContexts( this );

			for ( const context of contexts ) {
				let emitter = eventContexts.get( context );

				if ( !emitter ) {
					emitter = new ( EmitterMixin() )();
					eventContexts.set( context, emitter! );
				}

				this.listenTo( emitter!, event, callback, options );
			}
		}

		public _removeEventListener( this: Document, event: string, callback: Function ): void {
			const eventContexts = getBubblingContexts( this );

			for ( const emitter of eventContexts.values() ) {
				this.stopListening( emitter, event, callback );
			}
		}
	}

	return Mixin as any;
}

// Backward compatibility with `mix`.
{
	const mixin = ( BubblingEmitterMixin as any )( Object );

	[ 'fire', '_addEventListener', '_removeEventListener' ].forEach( key => {
		( BubblingEmitterMixin as any )[ key ] = mixin.prototype[ key ];
	} );
}

// Update the event info bubbling fields.
//
// @param {module:utils/eventinfo~EventInfo} eventInfo The event info object to update.
// @param {'none'|'capturing'|'atTarget'|'bubbling'} eventPhase The current event phase.
// @param {module:engine/view/document~Document|module:engine/view/node~Node} currentTarget The current bubbling target.
function updateEventInfo(
	eventInfo: EventInfo,
	eventPhase: BubblingEventInfo[ '_eventPhase' ],
	currentTarget: unknown
) {
	if ( eventInfo instanceof BubblingEventInfo ) {
		( eventInfo as any )._eventPhase = eventPhase;
		( eventInfo as any )._currentTarget = currentTarget;
	}
}

// Fires the listener for the specified context. Returns `true` if event was stopped.
//
// @private
// @param {Map.<String|Function, module:utils/emittermixin~Emitter>} eventContexts
// @param {String|module:engine/view/node~Node} context
// @param {module:utils/eventinfo~EventInfo} eventInfo The `EventInfo` object.
// @param {...*} [eventArgs] Additional arguments to be passed to the callbacks.
// @returns {Boolean} True if event stop was called.
function fireListenerFor(
	eventContexts: BubblingEventContexts,
	context: string | Node,
	eventInfo: EventInfo,
	...eventArgs: Array<unknown>
) {
	const emitter = typeof context == 'string' ? eventContexts.get( context ) : getCustomContext( eventContexts, context );

	if ( !emitter ) {
		return false;
	}

	emitter.fire( eventInfo, ...eventArgs );

	return eventInfo.stop.called;
}

// Returns an emitter for a specified view node.
//
// @private
// @param {Map.<String|Function, module:utils/emittermixin~Emitter>} eventContexts
// @param {module:engine/view/node~Node} node
// @returns {module:utils/emittermixin~Emitter|null}
function getCustomContext( eventContexts: BubblingEventContexts, node: Node ): Emitter | null {
	for ( const [ context, emitter ] of eventContexts ) {
		if ( typeof context == 'function' && context( node ) ) {
			return emitter;
		}
	}

	return null;
}

// Returns bubbling contexts map for the source (emitter).
function getBubblingContexts( source: { [ x: string ]: any; [ contextsSymbol ]?: BubblingEventContexts } ) {
	if ( !source[ contextsSymbol ] ) {
		source[ contextsSymbol ] = new Map();
	}

	return source[ contextsSymbol ];
}

// Returns the deeper parent element for the range.
function getDeeperRangeParent( range: Range ): Node | null {
	if ( !range ) {
		return null;
	}

	const startParent = range.start.parent as Element;
	const endParent = range.end.parent as Element;

	const startPath = startParent.getPath();
	const endPath = endParent.getPath();

	return startPath.length > endPath.length ? startParent : endParent;
}

/**
 * Bubbling emitter for the view document.
 *
 * Bubbling emitter is triggering events in the context of specified {@link module:engine/view/element~Element view element} name,
 * predefined `'$text'`, `'$root'`, `'$document'` and `'$capture'` contexts, and context matchers provided as a function.
 *
 * Before bubbling starts, listeners for `'$capture'` context are triggered. Then the bubbling starts from the deeper selection
 * position (by firing event on the `'$text'` context) and propagates the view document tree up to the `'$root'` and finally
 * the listeners at `'$document'` context are fired (this is the default context).
 *
 * Examples:
 *
 *		// Listeners registered in the context of the view element names:
 *		this.listenTo( viewDocument, 'enter', ( evt, data ) => {
 *			// ...
 *		}, { context: 'blockquote' } );
 *
 *		this.listenTo( viewDocument, 'enter', ( evt, data ) => {
 *			// ...
 *		}, { context: 'li' } );
 *
 *		// Listeners registered in the context of the '$text' and '$root' nodes.
 *		this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
 *			// ...
 *		}, { context: '$text', priority: 'high' } );
 *
 *		this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
 *			// ...
 *		}, { context: '$root' } );
 *
 *		// Listeners registered in the context of custom callback function.
 *		this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
 *			// ...
 *		}, { context: isWidget } );
 *
 *		this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
 *			// ...
 *		}, { context: isWidget, priority: 'high' } );
 *
 * Example flow for selection in text:
 *
 *		<blockquote><p>Foo[]bar</p></blockquote>
 *
 * Fired events on contexts:
 * 1. `'$capture'`
 * 2. `'$text'`
 * 3. `'p'`
 * 4. `'blockquote'`
 * 5. `'$root'`
 * 6. `'$document'`
 *
 * Example flow for selection on element (i.e., Widget):
 *
 *		<blockquote><p>Foo[<widget/>]bar</p></blockquote>
 *
 * Fired events on contexts:
 * 1. `'$capture'`
 * 2. *widget* (custom matcher)
 * 3. `'p'`
 * 4. `'blockquote'`
 * 5. `'$root'`
 * 6. `'$document'`
 *
 * There could be multiple listeners registered for the same context and at different priority levels:
 *
 *		<p>Foo[]bar</p>
 *
 * 1. `'$capture'` at priorities:
 *    1. `'highest'`
 *    2. `'high'`
 *    3. `'normal'`
 *    4. `'low'`
 *    5. `'lowest'`
 * 2. `'$text'` at priorities:
 *    1. `'highest'`
 *    2. `'high'`
 *    3. `'normal'`
 *    4. `'low'`
 *    5. `'lowest'`
 * 3. `'p'` at priorities:
 *    1. `'highest'`
 *    2. `'high'`
 *    3. `'normal'`
 *    4. `'low'`
 *    5. `'lowest'`
 * 4. `'$root'` at priorities:
 *    1. `'highest'`
 *    2. `'high'`
 *    3. `'normal'`
 *    4. `'low'`
 *    5. `'lowest'`
 * 5. `'$document'` at priorities:
 *    1. `'highest'`
 *    2. `'high'`
 *    3. `'normal'`
 *    4. `'low'`
 *    5. `'lowest'`
 *
 * @interface BubblingEmitter
 * @extends module:utils/emittermixin~Emitter
 */

type BubblingEventContexts = Map<string | BubblingEventContextFunction, Emitter>;

export type BubblingEventContextFunction = ( node: Node ) => boolean;

export type BubblingEvent<TEvent extends BaseEvent> = TEvent & {
	eventInfo: BubblingEventInfo<TEvent[ 'name' ], ( TEvent extends { return: infer TReturn } ? TReturn : unknown )>;
	callbackOptions: BubblingCallbackOptions;
};

export type BubblingCallbackOptions = CallbackOptions & {
	context?: ArrayOrItem<string | BubblingEventContextFunction>;
};

export type BubblingEmitter = Emitter;
