/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { vi } from 'vitest';

/**
 * Builds a stand-in for a *synthetic* shadow root – one produced by a polyfill emulating the boundary in the
 * light DOM – and replaces the global `ShadowRoot` the way such a polyfill does.
 *
 * A real polyfill cannot be used here, as one only patches the nodes its own renderer has claimed, so merely
 * loading it into a test page changes nothing. This reproduces the four traits the editor's helpers meet:
 *
 * * the root is an object over `DocumentFragment.prototype`, so it is not a platform object and every DOM API
 *   converting it as an argument rejects it;
 * * the global `ShadowRoot` is a constructor whose `Symbol.hasInstance` answers `true` for both real roots and
 *   these, which is what makes such a root pass `isShadowRoot()`;
 * * `getSelection()` is present and throws, being a member a polyfill cannot emulate;
 * * `appendChild()` puts the node in the host element, since there is no real tree to put it in.
 *
 * Call it from a test or a `beforeEach()`, never a `beforeAll()` – it stubs a global, and the shared Vitest
 * configuration restores those before every test.
 *
 * @param {HTMLElement} host The element the root pretends to be attached to.
 * @returns {Object} The synthetic shadow root.
 */
export function createSyntheticShadowRoot( host ) {
	const prototype = Object.create( DocumentFragment.prototype );

	const root = Object.create( prototype, {
		// A non-configurable marker the polyfill puts on its own prototype.
		synthetic: { value: true },
		host: { value: host },
		ownerDocument: { get: () => host.ownerDocument },
		isConnected: { get: () => host.isConnected },
		getRootNode: { value: () => root },
		getSelection: {
			value: () => {
				throw new Error( 'Disallowed method "getSelection" on ShadowRoot.' );
			}
		},
		appendChild: { value: node => host.appendChild( node ) },
		contains: { value: node => host.contains( node ) }
	} );

	const NativeShadowRoot = window.ShadowRoot;

	function SyntheticShadowRoot() {}

	Object.defineProperty( SyntheticShadowRoot, Symbol.hasInstance, {
		value: object => Boolean( object ) &&
			( object instanceof NativeShadowRoot || Object.getPrototypeOf( object ) === prototype )
	} );

	vi.stubGlobal( 'ShadowRoot', SyntheticShadowRoot );

	return root;
}

/**
 * Makes `node.getRootNode()` report the given root, the way the polyfill's patched `Node#getRootNode()` does
 * for a node it has assigned an owner key to.
 *
 * @param {Node} node The node to reroot.
 * @param {Object} root The root it should report.
 */
export function reportRootNode( node, root ) {
	vi.spyOn( node, 'getRootNode' ).mockReturnValue( root );
}
