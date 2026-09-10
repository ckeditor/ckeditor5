/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/errorattribution/liveeditors
 */

import type { Editor } from '../editor/editor.js';
import type { Context } from '../context.js';

/**
 * Editors that are currently ready.
 *
 * Error attribution walks object graphs, and that walk answers "is this reachable from that" — a test
 * between two objects rather than a lookup. Naming what an error belongs to therefore means running the
 * test once per live editor, and this is the list to run it against.
 *
 * Held weakly. An editor is removed when it is destroyed, but an integrator may simply drop one instead —
 * a single-page application changing route, for example. Holding those strongly would keep an editor alive
 * that nothing else refers to, turning a leak that garbage collection would have cleaned up into one that
 * it cannot.
 *
 * Temporary. It exists only for as long as attribution walks graphs; once every object that may be passed
 * as an error context can name its editor directly, the answer is a single property read and this module
 * goes away. It is kept behind functions rather than exposed as the set itself, and it is deliberately not
 * exported from the package index, so that removal is not a breaking change.
 */
const editors = new Set<WeakRef<Editor>>();

/**
 * Adds an editor to the list of the ones error attribution may be asked about.
 *
 * @internal
 */
export function _addLiveEditor( editor: Editor ): void {
	editors.add( new WeakRef( editor ) );
}

/**
 * Removes an editor from the list of the ones error attribution may be asked about.
 *
 * @internal
 */
export function _removeLiveEditor( editor: Editor ): void {
	for ( const reference of editors ) {
		if ( reference.deref() === editor ) {
			editors.delete( reference );

			return;
		}
	}
}

/**
 * The editors error attribution may be asked about, in the order they became ready.
 *
 * References whose editor has been collected are dropped on the way through. That is the only cleanup
 * there is, and it is enough: the list is read whenever an error is reported, and an entry left behind
 * until then costs one dead reference.
 *
 * @internal
 */
export function* _getLiveEditors(): Iterable<Editor> {
	yield* read( editors );
}

/**
 * Contexts an integrator created, held the same way and for the same reason as the editors above.
 *
 * A context created by an editor for itself is not here. It holds that editor alone, so asking it would
 * only repeat what asking the editor already answered.
 */
const contexts = new Set<WeakRef<Context>>();

/**
 * Adds a context to the list of the ones error attribution may be asked about.
 *
 * Adding one twice registers it once, the way adding to a set does. Removal takes one entry, so a second
 * registration would outlive the removal on destroy and a destroyed context would keep being named.
 *
 * @internal
 */
export function _addLiveContext( context: Context ): void {
	if ( _isLiveContext( context ) ) {
		return;
	}

	contexts.add( new WeakRef( context ) );
}

/**
 * Removes a context from the list of the ones error attribution may be asked about.
 *
 * @internal
 */
export function _removeLiveContext( context: Context ): void {
	for ( const reference of contexts ) {
		if ( reference.deref() === context ) {
			contexts.delete( reference );

			return;
		}
	}
}

/**
 * The contexts error attribution may be asked about, in the order they were created.
 *
 * @internal
 */
export function* _getLiveContexts(): Iterable<Context> {
	yield* read( contexts );
}

/**
 * Whether the context is one of those attribution may name.
 *
 * @internal
 */
export function _isLiveContext( context: unknown ): boolean {
	for ( const liveContext of _getLiveContexts() ) {
		if ( liveContext === context ) {
			return true;
		}
	}

	return false;
}

/**
 * Yields what is still alive, dropping the references whose object has been collected on the way through.
 */
function* read<T extends object>( references: Set<WeakRef<T>> ): Iterable<T> {
	for ( const reference of references ) {
		const value = reference.deref();

		if ( value ) {
			yield value;
		} else {
			references.delete( reference );
		}
	}
}
