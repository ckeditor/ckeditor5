---
category: setup
menu-title: Shadow DOM
meta-title: Running CKEditor 5 inside a shadow DOM | CKEditor 5 Documentation
meta-description: Load the editor styles into a shadow root, choose where the floating user interface mounts, and override CSS variables on the shadow host.
order: 100
modified_at: 2026-09-18
---

# Running CKEditor&nbsp;5 inside a shadow DOM

CKEditor&nbsp;5 runs inside an open shadow root. Selection, focus, positioning, scrolling, drag and drop, and the floating user interface all work there, and so do the premium features.

Two things do not happen by themselves, because a shadow root is a separate DOM tree with a styling boundary of its own. The editor style sheets have to reach every tree that holds the editor user interface, and CSS variables have to be overridden on the shadow host rather than on `:root`.

The integration guides show how to do both in each framework:

* From npm: {@link getting-started/integrations/react-default-npm#using-inside-a-shadow-root React}, {@link getting-started/integrations/vue-default-npm#using-inside-a-shadow-root Vue}, and {@link getting-started/integrations/angular#using-inside-a-shadow-root Angular}.
* From CDN: {@link getting-started/integrations-cdn/react-default-cdn#using-inside-a-shadow-root React}, {@link getting-started/integrations-cdn/vue-default-cdn#using-inside-a-shadow-root Vue}, and {@link getting-started/integrations-cdn/angular#using-inside-a-shadow-root Angular}.

<info-box>
	Writing an editor feature that has to keep working inside a shadow root is a different job. The {@link framework/deep-dive/shadow-dom Deep dive into shadow DOM support} guide covers it.
</info-box>

## Loading the editor styles

Attaching a shadow root creates a separate DOM tree, and style sheets are scoped to the tree they belong to. The isolation works both ways: selectors in a page style sheet do not match elements inside a shadow tree, and styles defined inside a shadow tree do not affect the rest of the page.

Load the editor style sheets into the tree the editor is attached to:

* In the light DOM, load them in the main document, as the {@link getting-started/setup/css Editor and content styles} guide shows.
* Inside a shadow root, load them into that root, for example through [`ShadowRoot.adoptedStyleSheets`](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets).

The editor renders its floating user interface outside the editing area, so that tree needs the same style sheets. Which tree? That depends on where the overlay layer mounts, described in the next section.

## Where the floating user interface mounts

Balloons, dialogs, and tooltips are rendered outside the editor's own DOM structure, so they stack above the editor and are not clipped by a scrollable or `overflow: hidden` ancestor. That is the overlay layer.

When you do not configure anything, the editor mounts the overlay layer in the tree its editing root lives in. It is the shadow root when the editor is inside one. Treat that as a fallback rather than a plan: the root the editor lives in may itself clip the overlay layer.

Point {@link module:core/editor/editorconfig~UiConfig#overlayContainer `config.ui.overlayContainer`} at a shadow root of your own instead, attached to a host element at the end of `document.body`. As a direct child of the body, that host has no ancestor that can clip the overlay layer, and its own shadow root keeps it a self-contained styling boundary:

```js
const overlayHost = document.body.appendChild( document.createElement( 'div' ) );
const overlayContainer = overlayHost.attachShadow( { mode: 'open' } );

// A shadow root does not inherit the page styles. The same constructed style sheets
// can be adopted by any number of roots, so reuse the ones the editor root has.
overlayContainer.adoptedStyleSheets = editorShadowRoot.adoptedStyleSheets;

ClassicEditor
	.create( {
		attachTo: editorShadowRoot.querySelector( '#editor' ),
		ui: {
			overlayContainer
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Only constructed style sheets can be adopted this way, meaning ones created with the [`CSSStyleSheet`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet) constructor rather than the sheets a `<style>` or `<link>` element brings in. Because one constructed sheet can be adopted by any number of roots, the editor root and the overlay container share a single array.

<info-box warning>
	The overlay container is a separate tree, so it needs the editor style sheets of its own. Without them the balloons and dialogs render unstyled even though the editing area looks correct.
</info-box>

Each mount target gets an overlay layer of its own, wrapped in a `.ck-body-wrapper` element of its own, so an editor in a shadow root and an editor in the light DOM do not share one. A single `document.querySelector( '.ck-body-wrapper' )` therefore no longer finds every editor's layer, and finds none at all before the editor attaches. Read {@link module:ui/editorui/bodycollection~BodyCollection#bodyCollectionContainer `editor.ui.view.body.bodyCollectionContainer`} instead, which exists from the moment the editor is created.

The {@link features/fullscreen Fullscreen} feature follows the same chain. With no {@link module:fullscreen/fullscreenconfig~FullscreenConfig#container `config.fullscreen.container`} set, it mounts in the first of these that applies:

1. The {@link module:core/editor/editorconfig~UiConfig#overlayContainer `config.ui.overlayContainer`}, when you set one.
2. The shadow root the editor lives in.
3. The `<body>` element.

Setting the container yourself keeps the page scrollable, because the fullscreen mode then fills an element of your layout instead of covering the viewport.

## Overriding CSS variables

The editor declares its CSS variables on both `:root` and `:host`, so one style sheet resolves them in the main document and inside a shadow root alike. This is necessary because `:root` matches nothing inside a shadow tree, and `:host` matches nothing outside one.

<info-box warning>
	One consequence is that overriding a variable on `:root` has no effect on an editor inside a shadow root. Custom properties do inherit across the shadow boundary, so the value reaches the host. But the editor style sheet declares that variable on `:host`, which sets it on the host element itself, and a value set on an element always beats one inherited from an ancestor. Marking the override `!important` does not change this.
</info-box>

Override the variable on the shadow host element instead, or anywhere inside the shadow root. A rule in the main document that matches the host still wins, so the override does not have to live inside the root.

Put the same class on every shadow host that holds the editor user interface, the overlay container included. One rule then covers them all:

```css
/* A class you put on every shadow host that holds editor UI. */
.my-editor-shadow-host {
	--ck-radius-base: 16px;
}
```

## Rules that apply to the page

A few editor rules have to match `<html>` or `<body>`, which no shadow root can contain. The scroll lock that fullscreen mode and modal dialogs put on the page is one, through the `ck-fullscreen-scroll-locked` and `ck-dialog-scroll-locked` classes.

Those rules are no longer shipped in the theme style sheets, because a sheet adopted into a shadow root cannot reach the page. The editor adopts them into the document at runtime instead, once per document however many editors ask for them. They land later in the cascade than a theme sheet would, so overriding one of them may need higher specificity than before.

## Slotting the editor into your own component

You can place the editor in a `<slot>` of a component of your own. This is where the open-root requirement bites hardest: the editor finds the slot through `Element#assignedSlot`, which a closed root does not report and for which the DOM standard exposes no alternative. Without it, the editor cannot work out which element really scrolls and clips it. That is why balloons are positioned against the wrong ancestor and scrolling the selection into view scrolls the window rather than your container.

An open root is what component frameworks attach by default, so this usually needs nothing from you.

## Known limitations

* **Selection direction.** Safari and Chromium do not report the direction of a selection made with the mouse inside a shadow root, so a backward selection looks forward. User interface anchored to the selection, the balloon toolbar for one, then appears at the end of the selection rather than at its start. There is no workaround.
