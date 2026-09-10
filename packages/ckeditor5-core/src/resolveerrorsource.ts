/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/resolveerrorsource
 */

import { areConnectedThroughProperties } from './errorattribution/areconnectedthroughproperties.js';
import { _getLiveContexts, _getLiveEditors, _isLiveContext } from './errorattribution/liveeditors.js';
import { Editor } from './editor/editor.js';
import { Context } from './context.js';

/**
 * Answers what an error came from, given the context it was thrown with.
 *
 * Returns `null` when no answer can be given. That is not necessarily a bug: it also happens for a context
 * that is `null`, omitted, or an object that shares nothing with any editor currently running.
 *
 * @internal
 */
export function resolveErrorSource( context: unknown ): Editor | Context | null {
	// A context may be the answer itself — a number of call sites pass an editor or a context directly.
	if ( context instanceof Editor ) {
		return context;
	}

	// A context answers for itself only when it is one attribution knows about. Anything else falls through
	// to the search below: a context an editor made for itself belongs to that editor, which the search finds
	// because an editor is connected to its own context. A context already destroyed belongs to nobody, and
	// the search says so.
	if ( context instanceof Context && _isLiveContext( context ) ) {
		return context;
	}

	if ( !context || typeof context != 'object' ) {
		return null;
	}

	// Whether an object belongs to something is decided by walking both object graphs and looking for
	// anything they have in common. That is a test between two objects, so turning it into an answer to
	// "which one" means asking it once per candidate — there is no index to consult.
	//
	// The first match wins, which is how this behaved before this API existed. Two editors that share an
	// object can therefore both look like a match, and only one of them is named.
	for ( const editor of _getLiveEditors() ) {
		if ( areConnectedThroughProperties( editor, context, editor._errorExclusions ) ) {
			return editor;
		}
	}

	// Editors first, contexts second, so that an error belonging to one editor in a context is named as
	// that editor rather than as the whole context. Only what no editor claimed reaches this point — which
	// is what a context plugin, shared by all of them, produces.
	//
	// No exclusions here. They exist to keep editors in a context apart, and a context has nothing to be
	// kept apart from.
	for ( const liveContext of _getLiveContexts() ) {
		if ( areConnectedThroughProperties( liveContext, context ) && !belongsToAnyEditorIn( liveContext, context ) ) {
			return liveContext;
		}
	}

	return null;
}

/**
 * Whether an editor in the context owns the error, whether or not that editor is ready.
 *
 * Everything in a context is reachable from it through {@link module:core/context~Context#editors}, so a
 * context matches an error from any editor inside it. The loop above only asks ready editors, which leaves
 * a window on either side of an editor's life — still starting up, or already tearing down — where the
 * editor cannot answer for itself and the context would answer instead. A context has no ready state to
 * filter on, so such an error would be reported when it should not be.
 *
 * Asking the editors first closes that window: an editor claims its own errors regardless of readiness,
 * which keeps the context from claiming them, and the readiness check then drops them.
 */
function belongsToAnyEditorIn( liveContext: Context, context: object ): boolean {
	return Array.from( liveContext.editors ).some(
		editor => areConnectedThroughProperties( editor, context, editor._errorExclusions )
	);
}
