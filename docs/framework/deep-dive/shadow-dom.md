---
category: framework-deep-dive
menu-title: Shadow DOM
meta-title: Deep dive into shadow DOM support | CKEditor 5 Framework Documentation
meta-description: Learn which DOM APIs break when CKEditor 5 runs inside a shadow root, which helpers to use instead, and how to port an existing feature.
modified_at: 2026-09-16
---

# Deep dive into shadow DOM support

CKEditor 5 works inside open shadow roots and inside a `<slot>` of someone else’s component. That support is not automatic; it depends on how the feature code is written.

The editor leans on some DOM APIs that resolve against the document, such as `document.activeElement`, `window.getSelection()`, `Node#contains()`, or `Node#parentNode`. Inside a shadow root, the document is the wrong tree, so they return the host element instead of the node or nothing at all. Nothing throws. The feature just stops reacting, and the symptom surfaces far from the call that caused it.

This guide covers helpers that replace those APIs, the problems you are most likely to hit, and the order to work through when porting a preexisting feature. It is intended for people writing editor features.

<info-box>
	Integrating CKEditor&nbsp;5 into a page that already uses a shadow root is a different job. The {@link getting-started/setup/css#styles-inside-a-shadow-dom Styles inside a shadow DOM} section of the CSS guide covers it.
</info-box>

## Start from a node, not from the document

**Derive the tree from a node you already hold. Never discover it from the outside.** [`Node#getRootNode()`](https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode) returns the tree a node lives in: the `Document` in the light DOM, the `ShadowRoot` inside one. It behaves identically for open and closed roots, which is what makes it the only reliable answer to "Where am I?"

```js
// ❌ Anti-pattern: works in an open root and returns null in a closed one.
const root = host.shadowRoot;

// ✅ Correct: works in both shadow modes and in the light DOM.
const root = editingRoot.getRootNode();
```

Anti-patterns like this do not survive closed mode. `Element#shadowRoot` is `null` for a closed root, and `Event#composedPath()` is truncated at a closed boundary, so the real target is not in it. Both work for as long as everything is open, which is why they are easy to write and difficult to notice.

So write against the strictest case: **code that works in a closed root works everywhere.** The helpers below all follow this rule, so most of the time you inherit it by using them.

All of that applies to the tree your feature is in. It does not apply when someone *slots* an editor into a component of their own. A closed root breaks layout there: `Element#assignedSlot` is `null` when the slot lives in a closed root, and there is no other way to find the slot, so every geometry question is answered against the wrong tree. **A component that slots an editor has to attach an open root.** See [Known limitations](#known-limitations).

<info-box warning>
	Resolve the root only when the node is attached, and never cache one resolved in a constructor. A detached node is not in its final tree yet, and most helpers return `null` rather than guessing. {@link module:utils/dom/getshadowroots~getShadowRoots `getShadowRoots()`} is the exception: a shadow tree is real from `attachShadow()`, so it reports roots for a detached node as well &ndash; check `Node#isConnected` yourself where that matters.
</info-box>

## The shadow-aware helpers

These are exported from `ckeditor5-utils` and re-exported from the `ckeditor5` package. Most replace a native API that answers the document's question instead of the tree's. All of them take a node and work it out from there, so there is nothing to register and nothing to keep in sync.

| Helper                                                                                            | Replaces                      | Reach for it when                                                                         |
|---------------------------------------------------------------------------------------------------|-------------------------------|-------------------------------------------------------------------------------------------|
| {@link module:utils/dom/getactiveelement~getActiveElement `getActiveElement()`}                   | `document.activeElement`      | Checking what is focused, from a node in the tree you care about.                         |
| {@link module:utils/dom/getselection~getSelection `getSelection()`}                               | `window.getSelection()`       | Reading or changing the DOM selection.                                                    |
| {@link module:utils/dom/getparentnode~getParentNode `getParentNode()`}                            | `Node#parentNode`             | Walking outward over any node, visiting shadow roots on the way.                          |
| {@link module:utils/dom/getparentelement~getParentElement `getParentElement()`}                   | `Node#parentElement`          | Walking outward over elements only.                                                       |
| {@link module:utils/dom/getlayoutparentnode~getLayoutParentNode `getLayoutParentNode()`}          | `Node#parentNode`             | Walking outward for a question about **geometry**, where slots matter.                    |
| {@link module:utils/dom/getlayoutparentelement~getLayoutParentElement `getLayoutParentElement()`} | `Node#parentElement`          | The element-only form of the same walk.                                                   |
| {@link module:utils/dom/containsnode~containsNode `containsNode()`}                               | `Node#contains()`             | Asking whether a node sits inside a container, a document, or a root.                     |
| {@link module:utils/dom/getshadowroots~getShadowRoots `getShadowRoots()`}                         | &mdash;                       | Collecting every shadow root a node renders in, innermost first.                          |
| {@link module:utils/dom/isshadowroot~isShadowRoot `isShadowRoot()`}                               | `obj instanceof ShadowRoot`   | Type-guarding a value that may be a root, including one from an iframe.                   |
| {@link module:utils/dom/isshadowhostof~isShadowHostOf `isShadowHostOf()`}                         | &mdash;                       | Checking whether an event target is a shadow host rather than the real element inside it. |
| {@link module:utils/dom/getelementfrompoint~getElementFromPoint `getElementFromPoint()`}          | `document.elementFromPoint()` | Hit-testing a viewport point that may land inside a root.                                 |
| {@link module:utils/dom/getoverlaymountroot~getOverlayMountRoot `getOverlayMountRoot()`}          | `document.body`               | Deciding which tree a feature's floating UI belongs in.                                   |
| {@link module:utils/dom/adoptglobalstylesheet~adoptGlobalStyleSheet `adoptGlobalStyleSheet()`}    | Injecting a `<style>` element | Shipping the few rules that must reach the light DOM.                                     |

Each swap replaces the native API with the helper that mirrors its name. The helper takes a node from the tree you are asking about, usually the element already in hand:

```js
import { getActiveElement } from 'ckeditor5';

// 🔄 Instead of: document.activeElement === element
if ( getActiveElement( element ) === element ) {
	// ...
}
```

The four parent walks do not work that way: they need a decision before they need a helper &ndash; see [Structure or geometry](#structure-or-geometry-which-walk-to-use). Nor do {@link module:utils/dom/getoverlaymountroot~getOverlayMountRoot `getOverlayMountRoot()`} and {@link module:utils/dom/adoptglobalstylesheet~adoptGlobalStyleSheet `adoptGlobalStyleSheet()`}, which are about where UI mounts and which tree a style sheet reaches rather than about replacing a call.

### Structure or geometry: Which walk to use?

Four of the helpers above come in two pairs. The halves look interchangeable and almost always are, which is what makes a wrong choice difficult to catch.

A `<slot>` does not move the node assigned to it &ndash; the node stays exactly where you put it, a child of the component's host element. That arrangement is the **node tree**, and it is what the browser's element inspector shows. What the browser renders is arranged differently: the node is displayed inside the slot, wherever the component placed it. That rendered arrangement is the **flattened tree**, and it is the one the browser lays out, scrolls and clips against. The two agree everywhere except slotted content. An editor slotted into a component is where they part:

```html
<my-wrapper>
	#shadow-root (open)
		<div class="frame">     <!-- This is what scrolls and clips. -->
			<slot></slot>
		</div>

	<div id="editor"></div>     <!-- The editing root, assigned to the slot above. -->
</my-wrapper>
```

```js
// Structure: where the editing root lives.
getParentElement( editingRoot );       // <my-wrapper>, the host out in the light DOM.

// Geometry: where it renders.
getLayoutParentElement( editingRoot ); // <slot>, with .frame one step above it.
```

* Ask {@link module:utils/dom/getparentnode~getParentNode `getParentNode()`} / {@link module:utils/dom/getparentelement~getParentElement `getParentElement()`} about **structure**: what a node is a descendant of in the document itself, such as whether it sits inside a container you own, or where an event came from.
* Ask {@link module:utils/dom/getlayoutparentnode~getLayoutParentNode `getLayoutParentNode()`} / {@link module:utils/dom/getlayoutparentelement~getLayoutParentElement `getLayoutParentElement()`} about **geometry**: what scrolls a node, what clips it, and which element its position is measured from &ndash; in practice, any walk that feeds a `Rect`, a scroll handler, or a positioning decision. These step through `Element#assignedSlot` before falling back to the node tree.

### When there is no node to ask

A helper answers for the tree of the node you hand it. Some code has no such node, because it must act on *every* boundary a feature spans at once &ndash; which is what it takes to listen for the few events that do not cross a shadow boundary.

That is what {@link module:utils/dom/shadowrootregistry~ShadowRootRegistry `ShadowRootRegistry`} is for. An editor exposes its own as {@link module:ui/editorui/editorui~EditorUI#shadowRootRegistry `editor.ui.shadowRootRegistry`}, and {@link module:utils/dom/shadowrootregistry~listenToShadowRoots `listenToShadowRoots()`} keeps a listener attached to every root in it as roots come and go. The editor registers its editing roots, its toolbars, its menu bar and every view in its body collection, so the set covers the whole editor UI wherever it is mounted, and changes as those elements are attached, detached or moved.

<info-box important>
Treat the registry as a last resort: if you have a node, a helper will do.
</info-box>

## Troubleshooting

The entries below are organized by what you observe, because the cause is rarely near the symptom it produces. Jump to the one that matches; they do not build on each other.

### A focus or containment check gets it wrong

A panel checks whether its own input has focus and gets `false` while the user is typing in it. A dialog treats a click on one of its own buttons as a click from outside and dismisses itself. A panel anchored to content does not reposition when the container it sits in scrolls, because the handler concludes the scroll came from an unrelated part of the page. A `mouseleave` handler cannot tell "the pointer moved to another part of this widget" from "the pointer left it", so a hover-triggered panel closes while the pointer is still inside it.

**Cause:** Retargeting. An API asked from outside a shadow tree answers with the host element, not the node inside. `document.activeElement` reports the host. A listener on `document` sees `Event#target` set to the host. `MouseEvent#relatedTarget` is retargeted into the tree of the listener's `currentTarget`, so a pointer crossing into a tree that listener does not live in is reported as that tree's host.

```js
// The user is typing in a field inside a shadow root.
document.activeElement;                   // <div id="host">, not the field.
getActiveElement( field );                // the field.

// A `scroll` handler attached to `document` and to every shadow root above the target runs for
// scrolls anywhere on the page, so it has to tell its own from an unrelated one.
const scrolled = domEvent.target;

scrolled.contains( target );              // false once a boundary sits between them.
containsNode( scrolled, target );         // true when that scroll really did move `target`.
```

**Fix:** Swap `document.activeElement` for {@link module:utils/dom/getactiveelement~getActiveElement `getActiveElement()`} and `Node#contains()` for {@link module:utils/dom/containsnode~containsNode `containsNode()`}, passing a node from the tree you are asking about.

`MouseEvent#relatedTarget` needs more than a swap, because the real destination cannot be recovered once it has been retargeted. Use {@link module:utils/dom/isshadowhostof~isShadowHostOf `isShadowHostOf()`} to recognize that the value is a shadow host rather than the real element inside it, then answer the question from the event's coordinates instead, which survive untouched: {@link module:utils/dom/getelementfrompoint~getElementFromPoint `getElementFromPoint()`} hit-tests them against the roots you name.

### A selector finds nothing

A feature looks up one of its own elements by class to position a balloon against it or to measure it and gets `null`. Positioning falls back to the viewport, or the behavior that depended on the element is quietly skipped.

**Cause:** A shadow tree is not reachable from the document. `document.querySelector()` and `document.querySelectorAll()` search the document's own tree only, so anything inside a shadow root is invisible to them. Nothing throws &ndash; you get `null`, or an empty list.

**Fix:** Query from a node the feature already holds, never from the document.

```js
// Blind to anything inside a shadow root.
document.querySelector( '.ck-my-container' );

// Scoped to your own subtree. Correct wherever the feature ends up, and the cheapest.
this.element.querySelector( '.ck-my-container' );

// The whole tree the node lives in, whichever tree that is.
editingRoot.getRootNode().querySelector( '.ck-my-container' );
```

`Node#getRootNode()` returns a `Document` in the light DOM and a `ShadowRoot` inside one, and both answer `querySelector()`, so a single call covers every case.

### Geometry is measured against the wrong element

Resolving the scrollable ancestor of the editing root gives `null`, or an element far above the one that really scrolls. "Scroll this into view" scrolls the window instead of the container the item is in. A balloon is positioned as if nothing could clip it, and floats over content it should have been pushed away from or hidden behind.

**Cause:** An outward walk that answers a geometric question reaches the wrong element, in one of two ways. `Node#parentElement` is `null` at a `ShadowRoot`, because a `ShadowRoot` is not an element, so a raw walk **stops** at the boundary and never reaches the scrollable ancestor above it. And where the node is slotted, a walk over the node tree **leaves** through the host into the light DOM, skipping the elements of the shadow tree that actually lay the node out. Either way the container that really scrolls and clips is never found.

**Fix:** Walk with {@link module:utils/dom/getlayoutparentelement~getLayoutParentElement `getLayoutParentElement()`}, which crosses boundaries and follows slots &ndash; see [Structure or geometry](#structure-or-geometry-which-walk-to-use).

Most features need no change at all, because the shared machinery already walks this way: {@link module:utils/dom/findclosestscrollableancestor~findClosestScrollableAncestor `findClosestScrollableAncestor()`}, `Rect#getVisible()`, {@link module:utils/dom/containsnode~containsNode `containsNode()`}, {@link module:utils/dom/getshadowroots~getShadowRoots `getShadowRoots()`} and the `scroll` utilities. What needs your attention is a hand-rolled `Node#parentNode` walk that feeds a measurement.

<info-box warning>
	Slots are followed through `Element#assignedSlot`, which is `null` when the slot lives in a **closed** shadow root. Slotted content inside a closed root therefore keeps the wrong-tree behavior, and no helper can recover it &ndash; see [Known limitations](#known-limitations).
</info-box>

### Scroll and pointer listeners never fire

Something that has to react to scrolling stops reacting once the editor is inside a shadow root. A document outline no longer highlights the heading the user scrolled to. Page break lines stay where they were while the user scrolls the content past them. Hover-triggered UI never appears, or never goes away.

**Cause:** Two things stop the event, and fixing one does not fix the other.

1. It never leaves the shadow root. `scroll`, `mouseenter`, `mouseleave`, `pointerenter` and `pointerleave` are not composed, so the event's path ends at the root it fired in. No listener outside that root can hear it, whatever options you pass &ndash; which is why each root needs one of its own.

2. It never travels upwards. None of these bubble when fired on an element, so they pass an ancestor only on the way down. That makes `useCapture` mandatory, even on the right root.

**Fix:** Pick the listener by what has to react: one container, or anywhere on the page.

* Something must follow the container the editor scrolls in. You do not need to know which element that is: {@link module:utils/dom/findclosestscrollableancestor~findClosestScrollableAncestor `findClosestScrollableAncestor()`} resolves it, crossing boundaries and following slots, so it finds a wrapper the integrator supplied to a decoupled editor just as well as the scrollable frame of a component the editor is slotted into. Then listen on the root that container lives in:

	```js
	const scrollable = findClosestScrollableAncestor( editingRoot );

	view.listenTo( scrollable.getRootNode(), 'scroll', ( evt, domEvent ) => {
		if ( !containsNode( domEvent.target, editingRoot ) ) {
			return;
		}

		// ...
	}, { useCapture: true, usePassive: true } );
	```

* Anything on the page may scroll, and UI positioned against the viewport must react. There is no single container to watch, so keep the `document` listener and add one per shadow root:

	```js
	view.listenTo( global.document, 'scroll', onScroll, { useCapture: true } );

	// One listener per root, kept in step as roots come and go.
	const stopListening = listenToShadowRoots( editor.ui.shadowRootRegistry, {
		emitter: view,
		event: 'scroll',
		callback: onScroll,
		listenerOptions: { useCapture: true }
	} );
	```

Both shapes filter the same way, with {@link module:utils/dom/containsnode~containsNode `containsNode()`}: the element that scrolled is the container, the node you care about is the second argument. A raw `Node#contains()` here answers `false` across a boundary and discards the very events you attached these listeners for.

Call the function that {@link module:utils/dom/shadowrootregistry~listenToShadowRoots `listenToShadowRoots()`} returns to detach early, when the UI it serves is hidden for instance. A listener that lives as long as its emitter needs nothing: destroying the emitter takes it down.

### Floating UI renders unstyled, or is clipped by its own container

A balloon appears with no styling at all, or is styled correctly but cut off by an `overflow` somewhere above it.

**Cause:** Floating UI has two requirements.

* It has to render in a tree that has the editor's style sheets, because style sheets are scoped to the tree they are loaded into.
* It has to sit at the end of `document.body`, where no ancestor `overflow` can clip it and where it paints above the rest of the UI.

In the light DOM one element satisfies both: `document.body` is in the document, and the document is where the style sheets are. Inside a shadow root nothing does. The feature's own root has the styles but may clip; `document.body` cannot clip but has none of the styles. What satisfies both there is a dedicated shadow root at the end of `document.body` with the same style sheets adopted into it, which is what {@link module:core/editor/editorconfig~UiConfig#overlayContainer `config.ui.overlayContainer`} is.

**Fix:** Take the first of these that applies to your feature.

1. The editor's own floating UI needs nothing from you. {@link module:ui/editorui/editorui~EditorUI} resolves the target itself: the configured {@link module:core/editor/editorconfig~UiConfig#overlayContainer `config.ui.overlayContainer`} if the integrator set one, otherwise the tree its first connected editing root lives in. Until a root is connected there is nothing to resolve, so the body collection stays unmounted.

2. UI that belongs to one editor can reuse the target that editor already resolved:

	```js
	const bodyCollection = new BodyCollection( editor.locale );

	bodyCollection.attachToDom( editor.ui.view.body.mountTarget );
	```

3. UI that lives outside an editor, in a container the integrator may put anywhere, has to resolve its own target and re-resolve it whenever the feature moves. {@link module:ui/overlayhost~OverlayHost `OverlayHost`} does that, and registers the feature's inline UI so the shared tooltip manager can reach it inside a root:

	```js
	this._overlayHost = new OverlayHost( editor.locale, {
		resolveMountTarget: () =>
			editor.config.get( 'ui.overlayContainer' ) || getOverlayMountRoot( this.container ),
		resolveInlineContainer: () => this.container
	} );

	this._overlayHost.sync();

	this.bodyCollection = this._overlayHost.bodyCollection;
	```

	{@link module:utils/dom/getoverlaymountroot~getOverlayMountRoot `getOverlayMountRoot()`} returns the container's shadow root when it is in one, the `<body>` of its document otherwise, and `null` while it is detached &ndash; which keeps the collection unmounted until there is a tree to mount it in.

<info-box warning>
	{@link module:ui/editorui/bodycollection~BodyCollection#attachToDom `attachToDom()`} with no argument mounts into `document.body`, not the feature's own root. The balloons render unstyled there, so always pass a resolved target.
</info-box>

### CSS custom properties have no effect inside a shadow root

Inside a shadow root your feature renders with none of its colors, spacing or borders: every `var( --ck-* )` resolves to its fallback, or to nothing at all. The same style sheet is correct in the light DOM.

**Cause:** `:root` matches nothing inside a shadow tree and `:host` matches nothing outside one, so a style sheet that has to work in both declares its custom properties on both. But declaring a variable on `:host` sets it *on the host element*, and a value set on an element always beats one inherited from an ancestor.

**Fix:** Pair the selectors in the style sheet:

```css
:root,
:host {
	--ck-drop-shadow: 0 1px 2px 1px var(--ck-color-shadow-drop);
}
```

The override itself has to target the host element or something inside the root &ndash; the {@link getting-started/setup/css#styles-inside-a-shadow-dom CSS guide} explains that to integrators.

### A style sheet rule for `<html>` or `<body>` never applies

A rule your feature needs on `<html>` or `<body>` does nothing once the editor is inside a shadow root. A modal opens and the page behind it still scrolls. The same goes for a rule aimed at third-party UI that mounts directly in `document.body`.

**Cause:** The style sheet is loaded into the shadow root the editor lives in, and its rules only match nodes in that tree. `<html>` and `<body>` are not in it and never can be, so the rule is live and matches nothing.

**Fix:** Adopt that one rule into the document with {@link module:utils/dom/adoptglobalstylesheet~adoptGlobalStyleSheet `adoptGlobalStyleSheet()`}, which adopts the same style sheet text once per document however many editors ask for it:

```js
const SCROLL_LOCK_STYLES = '.ck-dialog-scroll-locked{overflow:hidden}';

adoptGlobalStyleSheet( document, SCROLL_LOCK_STYLES );
document.documentElement.classList.add( 'ck-dialog-scroll-locked' );
```

Use it only for rules that target nodes no shadow root can contain. Anything that styles the editor UI belongs in a theme style sheet instead, where an integrator can see it and override it.

<info-box warning>
	An adopted style sheet lives in the document, so `--ck-*` properties declared in the shadow root are undefined for it. Give every custom property it reads an inline fallback.
</info-box>

## Porting an existing feature

Work through the steps in order. The mechanical changes come first, so each pass shrinks what the next one has to look at. The manual tests come last.

Steps 1 and 2 lean on two ESLint rules from the [`eslint-plugin-ckeditor5-rules`](https://www.npmjs.com/package/eslint-plugin-ckeditor5-rules) package. The CKEditor&nbsp;5 repository enables them for every package already, so `pnpm run lint` reports them there. In a project of your own, install the plugin and enable the two rules yourself. Both are documented in the {@link framework/contributing/code-style code style guide}.

1. **Fix the CSS selectors.** Run the autofix for {@link framework/contributing/code-style#root-selectors-require-host-ckeditor5-rulesrequire-host-with-root-selector `require-host-with-root-selector`}. It is mechanical, and it clears a whole class of "the feature renders unstyled" reports before you start debugging behavior. See [CSS custom properties have no effect inside a shadow root](#css-custom-properties-have-no-effect-inside-a-shadow-root).
2. **Run {@link framework/contributing/code-style#disallow-shadow-unsafe-dom-apis-ckeditor5-rulesno-shadow-unsafe-dom-apis `no-shadow-unsafe-dom-apis`} and triage.** Sort the reports into real problems and false positives. Then disable the false positives with a reason. Resist fixing anything yet &ndash; the list is the map.
3. **Swap the node-anchored reads.** `document.activeElement`, `window.getSelection()`, `Node#parentNode`, `Node#contains()`. These are one-line changes to a helper from [the table above](#the-shadow-aware-helpers).
4. **Decide, for every outward walk, whether it asks about structure or geometry.** A walk that feeds a `Rect`, a scroll handler or a positioning decision is asking about geometry and uses {@link module:utils/dom/getlayoutparentelement~getLayoutParentElement `getLayoutParentElement()`}. A walk that checks what contains a node is asking about structure and uses {@link module:utils/dom/getparentelement~getParentElement `getParentElement()`}. The linter cannot tell them apart, so this one is on you. See [Structure or geometry](#structure-or-geometry-which-walk-to-use).
5. **Audit `relatedTarget` by hand.** The rule reports property access, so it finds `domEvent.relatedTarget` and misses `const { relatedTarget } = domEvent`. Grep for the destructured form yourself. The pointer's destination cannot be recovered at all &ndash; see [A focus or containment check gets it wrong](#a-focus-or-containment-check-gets-it-wrong).
6. **Give the events that do not compose a listener per root.** A `document` listener for `scroll`, `mouseenter`, `mouseleave`, `pointerenter` or `pointerleave` never hears an event fired inside a shadow root, and needs a per-root listener beside it. See [Scroll and pointer listeners never fire](#scroll-and-pointer-listeners-never-fire).
7. **Mount the floating UI in the right tree.** Any `BodyCollection#attachToDom()` with no argument puts the feature's balloons in the light DOM. UI that belongs to one editor takes that editor's `mountTarget`; UI that lives outside an editor, for example, in a container the integrator places, needs {@link module:ui/overlayhost~OverlayHost `OverlayHost`}. This is the step with real design decisions, so give it a thought &ndash; see [Floating UI renders unstyled](#floating-ui-renders-unstyled-or-is-clipped-by-its-own-container).
8. **Re-scope the element lookups.** `document.querySelector()` searches the document only, so it cannot find the feature's own elements once they are inside a shadow root. Query from a node the feature already holds instead. See [A selector finds nothing](#a-selector-finds-nothing).
9. **Add a closed-root manual test** and work through it by hand. See [Testing in a shadow root](#testing-in-a-shadow-root).

<info-box>
	The `no-shadow-unsafe-dom-apis` rule matches syntax, not meaning. It reports raw APIs that are correct where they stand: a `Node#parentNode` walk over a parsed, detached fragment never meets a shadow root. It also misses what steps 4, 5, and 7 are for: a walk that should have been a layout walk, a destructured `relatedTarget`, and a body collection mounted in the wrong tree. A clean run is the start of the work, not the end.
</info-box>

## Testing in a shadow root

The {@link framework/contributing/testing-environment#running-manual-tests testing environment guide} covers running the manual test server with `pnpm run manual`, {@link framework/contributing/testing-environment#creating-a-manual-test what a manual test consists of}, and {@link framework/contributing/testing-environment#running-automated-tests running the automated ones}. This section is about shadow DOM part only.

The suite has shared shadow DOM plumbing in `packages/ckeditor5-ui/manual/_utils/shadow.ts`. A page opts in by putting a `<ck-manual-shadow-mode>` element in its markup and building its DOM root through one of two helpers. That element renders a mode picker (open or closed) whose choice persists across the whole suite, so you can sweep every opted-in page in one mode.

To give an existing test a shadow mode, the `wrapInShadowRoot( element )` function wraps that element where it stands, so the page needs no restructuring. It returns the root, or `null` in the light DOM:

```js
import { getOverlayConfig, wrapInShadowRoot } from '@ckeditor/ckeditor5-ui/manual/_utils/shadow.js';

const editorElement = document.querySelector( '#editor' );

wrapInShadowRoot( editorElement );

ClassicEditor
	.create( {
		attachTo: editorElement,
		...getOverlayConfig()
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Take the references you need before the call, as above: what moves into a root is out of reach of `document.querySelector()` afterwards, though an element keeps its identity as it moves, so a reference taken beforehand stays valid. Call it once, at module scope, before the editor is created. The root has to outlive the editor's init and destroy cycles, and wrapping the same element twice nests a second root around it.

When the whole editor markup should move into the root, keep it in a `<template>` and build the root with `createEditorDomRoot()`:

```html
<ck-manual-shadow-mode overlay-container></ck-manual-shadow-mode>

<div id="mount"></div>

<template id="editor-template">
	<div id="editor">…</div>
</template>
```

```js
import { createEditorDomRoot, getOverlayConfig } from '@ckeditor/ckeditor5-ui/manual/_utils/shadow.js';

const editorDomRoot = createEditorDomRoot( document.getElementById( 'mount' ), {
	template: document.getElementById( 'editor-template' )
} );

ClassicEditor
	.create( {
		attachTo: editorDomRoot.querySelector( '#editor' ),
		...getOverlayConfig()
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

The `overlay-container` attribute adds a second toggle, and `getOverlayConfig()` reads it. When the toggle is on, it returns a container of its own for the overlay layer; when it is off, it returns nothing, leaving `config.ui.overlayContainer` unset so the editor resolves the root it lives in by itself. Both paths are worth exercising, which is why it is a toggle rather than a decision the page takes.

A page written specifically to test shadow behavior omits the `default` attribute and gets `closed`, the strictest mode. A general-purpose page passes `default="none"`, keeps being crawled in the light DOM, and offers the picker to anyone who wants to check it in a root. For the slotted composition, `packages/ckeditor5-ui/manual/shadow-slotted.manual.html` puts an editor in a scrollable container component and offers both root modes, so the [closed-root limitation](#known-limitations) is visible side by side.

Automated tests are worth running in both modes rather than one. An open-root test passes for code that discovers the root through `Element#shadowRoot`, which is precisely the bug you are trying to prevent. A closed-root test alone does not prove the feature works where most integrations put it. Loop the test over `[ 'open', 'closed' ]` and put the mode in its title.

## Known limitations

These are constraints no helper can remove. The DOM standard or the browser does not expose what a fix would need, so a feature can only account for them.

* **Selection direction.** A selection made with the mouse inside a shadow root reports no direction in Safari and Chromium. Chromium can be accessed through its own non-standard API in some cases; Safari offers nothing, so a backward selection may look forward. A feature that branches on selection direction has an unreliable branch inside a shadow root.

* **Slotted content in a closed root.** `Element#assignedSlot` is `null` when the slot lives in a closed shadow root, and the DOM standard exposes no alternative. Every layout walk falls back to the node tree there. In such a case [geometry is measured against the wrong element](#geometry-is-measured-against-the-wrong-element), and no helper can recover it. A component that slots an editor has to attach an open root, which is what component frameworks attach by default.

* **`Element#closest()`.** It diverges for slotted content in the same way the parent walks do. Being a native method, it is not covered by a helper or reported by the linter. Every current call site is a within-tree lookup, so nothing is broken today. A lint rule guarding it is worth adding before a call site crosses a slot.
