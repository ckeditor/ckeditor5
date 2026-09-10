/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/errorreporter
 */

import { global, type CKEditorError } from '@ckeditor/ckeditor5-utils';

import { resolveErrorSource } from './resolveerrorsource.js';
import { Editor } from './editor/editor.js';
import { Context } from './context.js';

/**
 * What a callback registered with {@link module:core/errorreporter~onEditorError} receives.
 */
export interface EditorErrorData {

	/**
	 * The error that escaped.
	 */
	error: CKEditorError;

	/**
	 * The editor or context the error came from — the editor as a whole, not the object that threw. That
	 * one is in {@link module:utils/ckeditorerror~CKEditorError#context `error.context`}, and it is
	 * whatever the throwing code happened to have at hand: a plugin, a command, the model, a writer.
	 *
	 * Compare this with your own instance to tell whether the error came from an editor you manage.
	 *
	 * `null` is reserved for errors that could not be attributed. Under the current filter such an error
	 * is not reported at all, but the type does not promise that, so that the filter stays a policy rather
	 * than part of the contract.
	 */
	source: Editor | Context | null;
}

export type EditorErrorCallback = ( data: EditorErrorData ) => void;

/**
 * Watches `window` for errors that escaped an editor and hands them to registered callbacks.
 *
 * There is one instance per page, kept below as module state. It is a class rather than a set of closures
 * so that tests can build a fresh one instead of fighting leftover module state.
 */
class EditorErrorReporter {
	/**
	 * Holders rather than the callbacks themselves, so that registering the same function twice produces
	 * two independent registrations and one unsubscribe call removes only its own.
	 */
	private readonly _registrations = new Set<{ callback: EditorErrorCallback }>();

	/**
	 * Errors already handed out. An error can reach both listeners, and a rejected promise carrying an
	 * error that also fired `error` would otherwise be reported twice.
	 */
	private readonly _reported = new WeakSet<object>();

	/**
	 * Declared here rather than created in `_attach()`, so that the reference handed to
	 * `removeEventListener()` is provably the one `addEventListener()` was given.
	 */
	private readonly _onError = ( event: ErrorEvent ): void => {
		this._handle( event.error );
	};

	private readonly _onRejection = ( event: PromiseRejectionEvent ): void => {
		this._handle( event.reason );
	};

	private _isAttached = false;

	public add( callback: EditorErrorCallback ): () => void {
		const registration = { callback };

		this._registrations.add( registration );
		this._attach();

		return () => {
			if ( this._registrations.delete( registration ) ) {
				this._detach();
			}
		};
	}

	/**
	 * Listeners go up with the first registration rather than on import, so a bundle that only imports this
	 * module never touches `window`. Registering does, in line with the rest of the editor — this is browser
	 * code.
	 */
	private _attach(): void {
		if ( this._isAttached || this._registrations.size === 0 ) {
			return;
		}

		this._isAttached = true;

		global.window.addEventListener( 'error', this._onError );
		global.window.addEventListener( 'unhandledrejection', this._onRejection );
	}

	private _detach(): void {
		if ( !this._isAttached || this._registrations.size > 0 ) {
			return;
		}

		this._isAttached = false;

		global.window.removeEventListener( 'error', this._onError );
		global.window.removeEventListener( 'unhandledrejection', this._onRejection );
	}

	private _handle( error: unknown ): void {
		if ( !isCKEditorError( error ) || this._reported.has( error ) ) {
			return;
		}

		const source = resolveErrorSource( error.context );

		// An error nobody can be told about is not reported at all.
		if ( !source ) {
			return;
		}

		// Reporting is limited to a running editor. Beyond that there is nothing useful an integrator can
		// do with a half-built or already-destroyed editor, and its internals are in no defined state.
		//
		// Editors only. A context has no lifecycle state, and it does not need one here: attribution never
		// names a context it has stopped knowing about.
		if ( source instanceof Editor && source.state !== 'ready' ) {
			return;
		}

		this._reported.add( error );

		for ( const { callback } of Array.from( this._registrations ) ) {
			try {
				callback( { error, source } );
			} catch ( callbackError ) {
				// A broken callback must not take down the others, nor the page. We are inside a `window`
				// error handler, so letting this escape would break error handling for everything else on
				// the page as well.
				console.error( 'An error happened in an editor error callback.', callbackError );
			}
		}
	}
}

function isCKEditorError( error: unknown ): error is CKEditorError {
	if ( !( error instanceof Error ) ) {
		return false;
	}

	const candidate = error as Partial<CKEditorError>;

	return typeof candidate.is == 'function' && candidate.is( 'CKEditorError' );
}

const reporter = /* #__PURE__ -- @preserve */ new EditorErrorReporter();

/**
 * Registers a callback for errors that escape an editor, and returns a function that unregisters it.
 *
 * ```ts
 * const off = onEditorError( ( { error, source } ) => {
 * 	if ( source !== myEditor ) {
 * 		return;
 * 	}
 *
 * 	reportToMyErrorTracker( error );
 * } );
 * ```
 *
 * There is one registration surface for the whole page rather than one per editor, so an integrator running
 * several editors compares `source` with their own instance, as above. Registering the same callback twice
 * gives two independent registrations, and each unregisters on its own.
 *
 * Reporting only. Nothing is restarted and nothing is swallowed — the error still reaches the console.
 */
export function onEditorError( callback: EditorErrorCallback ): () => void {
	return reporter.add( callback );
}

// Filled in here rather than in the classes themselves. `Editor` and this module already refer to each
// other — the filter below needs the class — so reading this function while defining the class would read
// it before it exists. Assigning from this side runs after both are defined.
//
// See the docblocks on those fields for why they exist at all: an integration handed an editor class
// cannot import from CKEditor without loading the npm build and locking the application out of the CDN.
Editor.onEditorError = onEditorError;
Context.onEditorError = onEditorError;
