/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/trustedtypes
 */

import { logWarning } from '../ckeditorerror.js';
import { global } from './global.js';

// The TypeScript DOM library does not describe Trusted Types at all, so the three interfaces below declare the parts of them
// that the editor uses.

/**
 * A [Trusted Types policy](https://w3c.github.io/trusted-types/dist/spec/), as returned by `createPolicy()`.
 */
interface TrustedTypePolicy {
	// Returns the `TrustedHTML` object that a DOM injection sink accepts.
	createHTML( input: string ): {
		toString(): string;
	};
}

/**
 * The options given to `createPolicy()`.
 */
interface TrustedTypePolicyOptions {
	// Returns a plain string. The browser wraps it in the `TrustedHTML` object that
	// `TrustedTypePolicy#createHTML()` returns.
	createHTML: ( input: string ) => string;
}

/**
 * The `window.trustedTypes` object, which is the only way to create a policy.
 */
interface TrustedTypePolicyFactory {
	createPolicy( policyName: string, policyOptions: TrustedTypePolicyOptions ): TrustedTypePolicy;
}

/**
 * The name of the editor's policy. An application that enforces Trusted Types must list it in the `trusted-types` CSP
 * directive, or the browser refuses to create the policy.
 */
const POLICY_NAME = 'ckeditor5';

/**
 * An object with a `createHTML()` that returns the string it was given. The browser builds the editor's policy from it,
 * because the editor writes markup that it created itself. It also takes the place of that policy when the editor cannot
 * have one, so that both cases behave the same way.
 */
const PASS_THROUGH: TrustedTypePolicyOptions = { createHTML: input => input };

/**
 * The editor's policy, created on first use. The browser allows each policy name only once per document, so a single
 * policy is shared by every editor in the document, by all roots of a multi-root editor and across watchdog restarts.
 */
let policy: TrustedTypePolicy | undefined;

/**
 * Whether the application enforces Trusted Types, or `undefined` before the first check. The answer cannot change while
 * the document lives, and finding it out makes the browser report a policy violation, so it is checked only once.
 */
let isEnforced: boolean | undefined;

/**
 * Prepares an HTML string for a DOM injection sink, which means any place that turns a string into HTML, for example
 * `innerHTML` or `DOMParser#parseFromString()`:
 *
 * ```ts
 * element.innerHTML = trustedHtml( '<p>Hello world!</p>' );
 * ```
 *
 * An application can tell the browser to reject plain strings in those places, using the `require-trusted-types-for 'script'`
 * CSP directive. A sink then accepts only a `TrustedHTML` object. This function returns such an object when the browser
 * supports Trusted Types, and the string it was given when it does not. TypeScript types every sink as taking a
 * `string`, so the result is typed that way too, whichever it is. That keeps type casts out of the call sites, but it
 * also means the result is not always a real string: pass it to a sink, and do not call string methods on it.
 *
 * An application that enforces Trusted Types must also allow the name of the editor's policy, plus `lit-html` when it
 * loads the premium features, whichever of them it uses:
 *
 * ```
 * Content-Security-Policy: require-trusted-types-for 'script'; trusted-types ckeditor5 lit-html;
 * ```
 *
 * The policy returns the string unchanged, because the editor writes markup that it created itself. This makes the browser
 * accept the assignment, but it does not clean the markup in any way. Making sure that the data loaded into the editor is
 * safe stays the job of the application, exactly as before.
 *
 * @param html The HTML string to prepare.
 * @returns A value that can be assigned to a DOM injection sink.
 */
export function trustedHtml( html: string ): string {
	if ( !policy ) {
		policy = createPolicy();
	}

	// A sink accepts the `TrustedHTML` object returned here, but TypeScript describes sinks as accepting strings only.
	return policy.createHTML( html ) as string;
}

/**
 * Returns `true` if the application enforces Trusted Types with the `require-trusted-types-for 'script'` CSP directive.
 * That is the only case where a DOM injection sink rejects a plain string, so it is also the only case where a feature
 * that writes HTML in code the editor cannot reach, for example inside a third-party library, stops working.
 */
export function isTrustedTypesEnforced(): boolean {
	if ( isEnforced === undefined ) {
		try {
			// Checking `window.trustedTypes` would not answer this, because every Chromium browser has it whether the
			// application enforces anything or not. The refusal below is caught, but the browser still logs an error of
			// its own and reports a CSP violation, both of which are expected and break nothing.
			global.document.createElement( 'div' ).innerHTML = '';

			isEnforced = false;
		} catch {
			// Normally the sink refused the string, which is what enforcement is. The other way in is a missing
			// `createElement()`: outside a browser `global.document` is an empty object, and there is no CSP to
			// enforce anything there.
			isEnforced = typeof global.document.createElement === 'function';
		}
	}

	return isEnforced;
}

/**
 * Creates the editor's policy, or returns `PASS_THROUGH` when the browser does not support Trusted Types or the application
 * does not allow the policy.
 */
function createPolicy(): TrustedTypePolicy {
	const trustedTypes = ( global.window as { trustedTypes?: TrustedTypePolicyFactory } ).trustedTypes;

	if ( trustedTypes ) {
		try {
			return trustedTypes.createPolicy( POLICY_NAME, PASS_THROUGH );
		} catch {
			// An application can limit policy names without enforcing Trusted Types. Plain strings still work there, so the
			// editor does too, and this warning would appear on its own the day the application starts enforcing them.
			if ( !isTrustedTypesEnforced() ) {
				return PASS_THROUGH;
			}

			/**
			 * The editor could not create the Trusted Types policy that it needs to write HTML into the DOM. Without the
			 * policy it can only write plain strings, which the `require-trusted-types-for 'script'` CSP directive rejects,
			 * so the editor cannot start.
			 *
			 * The browser refuses to create the policy for two reasons:
			 *
			 * * The `trusted-types` CSP directive does not list the `ckeditor5` policy name. Add it to that directive, next to
			 *   any names that are already there:
			 *
			 *   ```
			 *   Content-Security-Policy: require-trusted-types-for 'script'; trusted-types ckeditor5 lit-html;
			 *   ```
			 *
			 * * Something else in the same document already created a policy with that name. Let that code use a different
			 *   name, or allow the name to be taken twice:
			 *
			 *   ```
			 *   Content-Security-Policy: require-trusted-types-for 'script'; trusted-types ckeditor5 lit-html 'allow-duplicates';
			 *   ```
			 *
			 * @error trusted-types-policy-creation-failed
			 */
			logWarning( 'trusted-types-policy-creation-failed' );
		}
	}

	return PASS_THROUGH;
}

/**
 * Forgets the policy that was created and whether the application enforces Trusted Types, so that both are worked out
 * again. Only tests need it, because a document never changes either answer.
 *
 * @internal
 */
export function _clearTrustedTypesCache(): void {
	policy = undefined;
	isEnforced = undefined;
}
