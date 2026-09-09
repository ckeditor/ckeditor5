/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Shared shadow DOM plumbing for the manual tests: the `<ck-manual-shadow-mode>` control, the mode it persists,
 * and the helpers building the DOM roots the editor and its overlay layer live in.
 *
 * Throughout this module a "DOM root" is what `getRootNode()` returns – the document or a shadow root – never one
 * of the editor's own editing roots, which live inside it.
 *
 * A page opts in by putting `<ck-manual-shadow-mode>` in its markup (add the `overlay-container` attribute for
 * the second control) and building its DOM root through `createEditorDomRoot()`:
 *
 * ```html
 * <ck-manual-shadow-mode overlay-container></ck-manual-shadow-mode>
 *
 * <div id="mount"></div>
 *
 * <template id="editor-template">
 * 	<div id="editor">...</div>
 * </template>
 * ```
 *
 * ```ts
 * const editorDomRoot = createEditorDomRoot( document.getElementById( 'mount' )!, {
 * 	template: document.getElementById( 'editor-template' ) as HTMLTemplateElement
 * } );
 *
 * ClassicEditor.create( {
 * 	attachTo: editorDomRoot.querySelector( '#editor' ) as HTMLElement,
 * 	...getOverlayConfig()
 * } );
 * ```
 *
 * Both controls are applied by reloading rather than by restarting the editor in place, so everything
 * shadow-related is a value read once at startup and the page is built one way per load. Switching a live editor
 * between the light DOM and a shadow root is not supported on purpose: forwarding the stylesheets disables the
 * document-level copies, and there is no way back to a styled light DOM without restoring them. It is also closer
 * to reality, as an integrator's page is built one way or the other rather than switching at runtime.
 */

export type ShadowMode = 'none' | 'open' | 'closed';

export interface ShadowRootOptions {

	/**
	 * Matches the document stylesheets to forward on top of the editor theme – for example the styles a package
	 * ships for the web components it mounts in the overlay layer, or the page's own rules for the markup that
	 * moves into the root (see {@link ~isPageStyleSheet}, which {@link ~wrapInShadowRoot} uses by default).
	 *
	 * These are *mirrored*: their document-level copies stay enabled, because whatever they style outside the root
	 * still needs them. The theme, by contrast, is always *redirected* – disabled in the document – so that UI
	 * ending up outside a root renders unstyled and the mistake is visible.
	 */
	extraSheets?: ( ownerNode: HTMLElement ) => boolean;
}

const ELEMENT_NAME = 'ck-manual-shadow-mode';

// Shared by every page that opts in, so the whole manual test suite can be swept in one mode without re-selecting
// it on each page.
const SHADOW_MODE_STORAGE_KEY = 'ck-manual-shadow-mode';
const OVERLAY_CONTAINER_STORAGE_KEY = 'ck-manual-shadow-overlay-container';

const SHADOW_MODE_LABELS: Record<ShadowMode, string> = {
	none: 'light DOM',
	open: 'open shadow DOM',
	closed: 'closed shadow DOM'
};

/* Public API ------------------------------------------------------------------------------------------- */

/**
 * The shadow mode persisted for the session, or `none` on a page that renders no control.
 *
 * With nothing stored – a fresh browser, and the state `check-manual-tests.mjs` crawls every page in – the mode
 * comes from the control's `default` attribute, so a page decides which mode it is *primarily* a test of:
 *
 * * A test written for the shadow DOM omits the attribute and gets `closed`, the strictest of the three:
 *   `host.shadowRoot` is `null`, so nothing can resolve the root from the outside.
 * * A general-purpose test passes `default="none"` and keeps being crawled in the light DOM, which is what it is
 *   a test of. The picker is then there for a developer who wants to check that page in a root.
 *
 * Picking a mode still overrides both, and does so suite-wide through the shared storage key, so the whole suite
 * can be swept in one mode regardless of what each page defaults to.
 */
export function getShadowMode(): ShadowMode {
	const control = getControl();

	if ( !control ) {
		return 'none';
	}

	const stored = localStorage.getItem( SHADOW_MODE_STORAGE_KEY );

	// Only a known mode is honored on either path, so a corrupted value never reaches `attachShadow()`.
	if ( isShadowMode( stored ) ) {
		return stored;
	}

	const pageDefault = control.getAttribute( 'default' );

	return isShadowMode( pageDefault ) ? pageDefault : 'closed';
}

export interface EditorDomRootOptions extends ShadowRootOptions {

	/**
	 * Cloned into the DOM root once it is built. Keeping the editor markup in a `<template>` is what lets the same
	 * page build it in the light DOM and inside a shadow root: a `<style>` placed in the template travels with the
	 * clone, while the page's own stylesheets do not reach a shadow root.
	 */
	template?: HTMLTemplateElement;
}

/**
 * Builds the DOM root the editor will live in inside `mount`, and returns it: `mount` itself in the light DOM, or
 * a styled shadow root attached to a fresh host inside it.
 *
 * "DOM root" as in `getRootNode()` – the document or shadow root a node belongs to. Nothing to do with the
 * editor's own {@link module:engine/model/document~ModelDocument#roots editing roots}, which live inside this one.
 *
 * Call it again to rebuild: the mount is emptied and a fresh host attached, so everything the previous editor put
 * in the root – the editable, the toolbar, the menu bar – is dropped along with it, and a restart leaves nothing
 * behind that has to be cleaned up separately.
 */
export function createEditorDomRoot(
	mount: HTMLElement,
	options: EditorDomRootOptions = {}
): HTMLElement | ShadowRoot {
	// A brand new host every time: `attachShadow()` can be called only once per element, so a rebuild needs one.
	mount.textContent = '';

	const mode = getShadowMode();

	const root = mode === 'none' ?
		mount :
		attachStyledShadow( mount.appendChild( document.createElement( 'div' ) ), mode, options );

	if ( options.template ) {
		root.appendChild( options.template.content.cloneNode( true ) );
	}

	return root;
}

/**
 * Moves `element` into a styled shadow root of the current mode, in place: a fresh host takes the element's
 * position in the DOM and the element becomes that host's only child. Returns the root, or `null` in the light
 * DOM, where there is nothing to wrap and `element` is left where it is.
 *
 * Use it where the thing to put in a root already exists – markup the page ships, or a level of nesting on top of
 * a root built earlier – rather than a mount point to build into, which is {@link ~createEditorDomRoot}. The host is
 * reachable as `root.host`, which is what has to be removed to take the whole tree out again.
 *
 * Because what moves in is markup the page already ships, the page's own stylesheets are mirrored in by default –
 * they were written for that markup and have to follow it. Pass `extraSheets` to match a different set.
 *
 * Call it once, at module scope, before the editor is created: the root has to outlive the editor's init/destroy
 * cycles, and wrapping the same element twice would nest a second root around it. Afterwards what moved in is out
 * of reach of `document.querySelector()`, so a test either takes the references it needs before the call – an
 * element keeps its identity as it moves, so a reference taken beforehand stays valid – or queries the returned
 * root, which is `null` in the light DOM where the document already reaches everything:
 *
 * ```ts
 * const editorElement = document.querySelector( '#editor' ) as HTMLElement;
 *
 * wrapInShadowRoot( editorElement );
 *
 * // …or, where more than a handful of elements have to be reached afterwards:
 * const uiRoot: Document | ShadowRoot = wrapInShadowRoot( document.getElementById( 'editor-ui' )! ) ?? document;
 * ```
 */
export function wrapInShadowRoot( element: HTMLElement, options: ShadowRootOptions = {} ): ShadowRoot | null {
	const mode = getShadowMode();

	if ( mode === 'none' ) {
		return null;
	}

	const host = document.createElement( 'div' );

	// Only meaningful once `element` is already in the DOM; for a detached one this is a no-op and the caller
	// inserts the returned root's host itself.
	element.replaceWith( host );

	const shadowRoot = attachStyledShadow( host, mode, { extraSheets: isPageStyleSheet, ...options } );

	shadowRoot.appendChild( element );

	return shadowRoot;
}

/**
 * The `ui` part of the editor configuration, ready to be spread into it:
 *
 * ```ts
 * ClassicEditor.create( { ...getOverlayConfig(), attachTo: editorElement } );
 * ```
 *
 * Gives the overlay layer a container of its own when the page's control offers the toggle and it is on, and is
 * empty otherwise – leaving `config.ui.overlayContainer` unset, so the editor resolves the root it lives in by
 * itself. Both paths are worth exercising, which is why this is a toggle rather than a decision taken here.
 */
export function getOverlayConfig( options: ShadowRootOptions = {} ): { ui?: { overlayContainer: HTMLElement | ShadowRoot } } {
	if ( !hasOwnOverlayContainer() ) {
		return {};
	}

	return { ui: { overlayContainer: createOverlayRoot( options ) } };
}

/**
 * The page's own stylesheets: everything the manual test server did not inject as the editor theme (marked with
 * `data-vite-dev-id`) and that the CKEditor inspector did not add (marked with `data-cke-inspector`).
 *
 * Pass it as `extraSheets` on a page whose own rules style the markup that moves into the root – the geometry of
 * an editable, say – so those rules follow it in while staying enabled for the chrome left outside.
 */
export function isPageStyleSheet( ownerNode: HTMLElement ): boolean {
	return !ownerNode.dataset.viteDevId && !( 'ckeInspector' in ownerNode.dataset );
}

/* Internals -------------------------------------------------------------------------------------------- */

function isShadowMode( value: string | null ): value is ShadowMode {
	return value === 'none' || value === 'open' || value === 'closed';
}

/**
 * The `<ck-manual-shadow-mode>` the page opted in with, optionally required to carry the given attribute, or
 * `null`. Both settings are gated on this: a page that renders no control must not be pushed into a mode nobody on
 * that page can see or change – which is what would otherwise happen through the shared storage keys, after
 * picking a mode anywhere else in the suite.
 *
 * Queried from the DOM rather than tracked by the element itself, so it answers correctly before the element is
 * upgraded – the settings are read at module scope by tests whose script runs before that.
 */
function getControl( attribute?: string ): Element | null {
	const selector = attribute ? `${ ELEMENT_NAME }[${ attribute }]` : ELEMENT_NAME;

	return document.querySelector( selector );
}

/**
 * Whether the test should give the overlay layer a container of its own instead of letting the editor resolve one.
 * False on a page whose control does not offer the toggle, so a test that never opted into the second container is
 * not handed one.
 *
 * On by default where the toggle is offered, because that is what an integrator embedding the editor in a shadow
 * root is meant to do: the root the editor lives in may clip the overlay layer, so `config.ui.overlayContainer` is
 * the supported way in, and the editor resolving a root on its own is only a fallback.
 */
function hasOwnOverlayContainer(): boolean {
	return Boolean( getControl( 'overlay-container' ) ) &&
		localStorage.getItem( OVERLAY_CONTAINER_STORAGE_KEY ) !== 'false';
}

let overlayRoot: HTMLElement | ShadowRoot | null = null;

/**
 * The container for the overlay layer (the body collection, so the balloons, dialogs and tooltips): a styled
 * shadow root in the shadow modes, and a plain element in the light DOM, so the "own container" path is exercised
 * in every mode.
 */
function createOverlayRoot( options: ShadowRootOptions ): HTMLElement | ShadowRoot {
	// One container per page load, reused by every editor built during it: the mode is applied by reloading, so
	// there is never a second one to build, and re-creating it on each editor restart would pile up dead hosts.
	if ( overlayRoot ) {
		return overlayRoot;
	}

	const mode = getShadowMode();

	// At the end of `<body>`, so the overlay layer has no scrollable or `overflow: hidden` ancestor to clip it.
	const host = document.body.appendChild( document.createElement( 'div' ) );

	overlayRoot = mode === 'none' ? host : attachStyledShadow( host, mode, options );

	return overlayRoot;
}

const CONTROL_STYLES = /* css */ `
	:host {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.2em 1.2em;
		margin: 1em 0;
		font: 0.85em/1.5 system-ui, sans-serif;
	}

	label {
		white-space: nowrap;
	}
`;

const controlStyleSheet = new CSSStyleSheet();

controlStyleSheet.replaceSync( CONTROL_STYLES );

/**
 * `<ck-manual-shadow-mode>` renders the light DOM / open / closed picker, and – with the `overlay-container`
 * attribute – the toggle putting the overlay layer in a container of its own. Picking either persists it and
 * reloads, so the editor is rebuilt inside the chosen root.
 *
 * Its own UI lives in a shadow root with an adopted stylesheet, the way `<ck-manual-header>` does, so it keeps its
 * styling after `forwardStyles()` disables the document-level theme sheets.
 */
class ManualShadowModeElement extends HTMLElement {
	private _rendered = false;

	public connectedCallback(): void {
		// `connectedCallback()` may fire more than once (for example if the element is moved); render only once.
		if ( this._rendered ) {
			return;
		}

		this._rendered = true;

		const shadow = this.attachShadow( { mode: 'open' } );

		shadow.adoptedStyleSheets = [ controlStyleSheet ];

		shadow.appendChild( this._createModeControl() );

		if ( this.hasAttribute( 'overlay-container' ) ) {
			shadow.appendChild( this._createOverlayControl() );
		}
	}

	private _createModeControl(): HTMLLabelElement {
		const select = document.createElement( 'select' );
		const currentMode = getShadowMode();

		for ( const mode of Object.keys( SHADOW_MODE_LABELS ) as Array<ShadowMode> ) {
			const option = document.createElement( 'option' );

			option.value = mode;
			option.textContent = SHADOW_MODE_LABELS[ mode ];
			option.selected = mode === currentMode;

			select.appendChild( option );
		}

		select.addEventListener( 'change', () => {
			localStorage.setItem( SHADOW_MODE_STORAGE_KEY, select.value );
			window.location.reload();
		} );

		return createLabel( 'Attached to ', select );
	}

	private _createOverlayControl(): HTMLLabelElement {
		const input = document.createElement( 'input' );

		input.type = 'checkbox';
		input.checked = hasOwnOverlayContainer();

		input.addEventListener( 'change', () => {
			localStorage.setItem( OVERLAY_CONTAINER_STORAGE_KEY, String( input.checked ) );
			window.location.reload();
		} );

		const label = createLabel( '', input );

		label.append( ' Overlay layer in its own container' );
		label.title =
			'Sets ui.overlayContainer to a separate container at the end of <body> – a shadow root of the ' +
			'selected mode, or a plain element in the light DOM';

		return label;
	}
}

function createLabel( text: string, control: HTMLElement ): HTMLLabelElement {
	const label = document.createElement( 'label' );

	label.append( text, control );

	return label;
}

// Guarded, so that a page still importing this module does not throw once the manual test server defines the
// element itself the way it already defines `<ck-manual-header>`.
if ( !customElements.get( ELEMENT_NAME ) ) {
	customElements.define( ELEMENT_NAME, ManualShadowModeElement );
}

// Shadow roots currently mirroring the document stylesheets, each with the options it was forwarded with, so a
// single `document.head` observer can re-sync every one of them whenever Vite hot-swaps a stylesheet.
const styledShadowRoots = new Map<ShadowRoot, ShadowRootOptions>();

let headStyleObserver: MutationObserver | null = null;

/**
 * The editor theme, which the Vite manual test server injects as one
 * `<style data-vite-dev-id=".../theme/index.css">` per package.
 */
function isThemeSheet( ownerNode: HTMLElement ): boolean {
	const viteDevId = ownerNode.dataset && ownerNode.dataset.viteDevId;

	return Boolean( viteDevId && /ckeditor5[^/]*\/theme\//.test( viteDevId ) );
}

function syncStyles( shadowRoot: ShadowRoot, options: ShadowRootOptions ): void {
	const shadowSheets: Array<CSSStyleSheet> = [];
	const matchesExtraSheet = options.extraSheets || ( () => false );

	for ( const sheet of Array.from( document.styleSheets ) ) {
		const ownerNode = sheet.ownerNode as HTMLElement | null;

		if ( !ownerNode ) {
			continue;
		}

		const isTheme = isThemeSheet( ownerNode );

		if ( !isTheme && !matchesExtraSheet( ownerNode ) ) {
			continue;
		}

		const shadowSheet = new CSSStyleSheet();

		try {
			// A `<style>` carries its source as text. A `<link>` does not, so its sheet is serialized back from the
			// rules the browser parsed out of it – which throws for a cross-origin sheet, the one case where there
			// is nothing to forward and the light-DOM copy has to stay enabled.
			shadowSheet.replaceSync(
				ownerNode.textContent || Array.from( sheet.cssRules ).map( rule => rule.cssText ).join( '\n' )
			);
		} catch {
			continue;
		}

		shadowSheets.push( shadowSheet );

		// The theme's original is disabled rather than left alone, because the `--ck-*` custom properties it declares
		// on `:root` would otherwise inherit into the shadow tree and style the editor there even without the adopted
		// copy – hiding exactly the kind of bug these tests look for. The sheets themselves are adopted verbatim:
		// the theme declares its custom properties on `:root, :host`, so the same stylesheet resolves them in the
		// light DOM and inside a shadow root alike, with no rewrite here.
		//
		// Extra sheets are only mirrored, never disabled: they were opted into because something inside the root
		// needs them, but whatever they style outside it still needs them too.
		if ( isTheme ) {
			sheet.disabled = true;
		}
	}

	shadowRoot.adoptedStyleSheets = shadowSheets;
}

/**
 * Forwards the editor theme – and anything `options.extraSheets` accepts on top of it – into `shadowRoot`, and
 * disables the document-level copies, so whatever is mounted there is styled only through the adopted sheets.
 * That is what makes these tests prove the theme works with no light-DOM copy to fall back on.
 *
 * Safe to call for every shadow root that should be styled, including more than once for the same one.
 */
function forwardStyles( shadowRoot: ShadowRoot, options: ShadowRootOptions ): void {
	styledShadowRoots.set( shadowRoot, options );

	syncStyles( shadowRoot, options );

	if ( headStyleObserver ) {
		return;
	}

	// Vite hot-swaps CSS by injecting or rewriting the `<style>` elements in `document.head`. A hot update would
	// otherwise land only in the light DOM – its fresh `<style>` is neither disabled nor mirrored – making it look
	// as if the styles stopped being redirected into the shadow root. Watch the head and re-forward every tracked
	// root on each change. `subtree`/`characterData` also catch Vite rewriting a `<style>`'s text in place, not
	// only adding or removing one.
	headStyleObserver = new MutationObserver( () => {
		for ( const [ root, rootOptions ] of styledShadowRoots ) {
			// A root whose host has left the DOM belongs to a superseded run and is not worth re-syncing.
			if ( root.host.isConnected ) {
				syncStyles( root, rootOptions );
			} else {
				styledShadowRoots.delete( root );
			}
		}
	} );

	headStyleObserver.observe( document.head, { childList: true, subtree: true, characterData: true } );
}

/**
 * Attaches a shadow root of the current mode to `host` and forwards the stylesheets into it. Returns the root.
 */
function attachStyledShadow( host: HTMLElement, mode: ShadowRootMode, options: ShadowRootOptions ): ShadowRoot {
	const shadowRoot = host.attachShadow( { mode } );

	forwardStyles( shadowRoot, options );

	return shadowRoot;
}
