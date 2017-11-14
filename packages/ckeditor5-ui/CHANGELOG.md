Changelog
=========

## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-ui/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Bug fixes

* `Template#getViews()` generator should not traverse native HTML elements. Closes [#337](https://github.com/ckeditor/ckeditor5-ui/issues/337). Closes [ckeditor/ckeditor5#657](https://github.com/ckeditor/ckeditor5/issues/657). ([894bad0](https://github.com/ckeditor/ckeditor5-ui/commit/894bad0))
* Improved binding of the `value` attribute in `InputTextView`. Closes [#335](https://github.com/ckeditor/ckeditor5-ui/issues/335). ([823120b](https://github.com/ckeditor/ckeditor5-ui/commit/823120b))

### Other changes

* Implemented `View#render()` method which replaces rendering the `#element` upon the first access and incorporates the `#init()` method functionality. Closes [#262](https://github.com/ckeditor/ckeditor5-ui/issues/262). Closes [#302](https://github.com/ckeditor/ckeditor5-ui/issues/302). ([bf90ad5](https://github.com/ckeditor/ckeditor5-ui/commit/bf90ad5))

   In other words – the `View#render()` method needs to be called to render a view and it sets the `View#element` itself. It can be called only once and it is done automatically if a view is added to some other view (as its child). If you need to add any additional logic to your component's initialization, then override the `render()` method (and remember to call `super.render()`).

   Additionally, from now on `View#setTemplate()` and `View#extendTemplate()` methods are recommended as a shorthand for `view.template = new Template( { ... } )` and `Template.extend( view.template )`.

    Please refer to the updated [documentation](https://docs.ckeditor.com/ckeditor5/latest/framework/guides/architecture/intro.html#UI-library) to learn more.
* Removed legacy `width` and `height` attributes from the `BoxedEditorUIView`. Closes [#25](https://github.com/ckeditor/ckeditor5-ui/issues/25). ([ffa419a](https://github.com/ckeditor/ckeditor5-ui/commit/ffa419a))
* The `ComponentFactory` should be case-insensitive. Closes [#324](https://github.com/ckeditor/ckeditor5-ui/issues/324). ([94417e9](https://github.com/ckeditor/ckeditor5-ui/commit/94417e9))
* Updated translations. ([186f365](https://github.com/ckeditor/ckeditor5-ui/commit/186f365))

### BREAKING CHANGES

* The `View#init()` method in UI components has been renamed to `render()`. Please refer to the [documentation](https://docs.ckeditor.com/ckeditor5/latest/framework/guides/architecture/intro.html#UI-library) to learn more.
* The `View#element` is no longer a getter which renders an element when first referenced. Use the `View#render()` method instead.
* `Template#children` property became an `Array` (previously `ViewCollection`).
* `View#addChildren()` and `View#removeChildren()` methods became `#registerChildren()` and `#deregisterChildren()`.
* The DOM structure of the `StickyPanelView` has changed along with the class names. Please refer to the component documentation to learn more.


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-ui/compare/v0.10.0...v1.0.0-alpha.1) (2017-10-03)

### Bug fixes

* `ContextualBalloon` should remember position passed to `#updatePosition()`. Closes [#305](https://github.com/ckeditor/ckeditor5-ui/issues/305). Closes [ckeditor/ckeditor5-image#141](https://github.com/ckeditor/ckeditor5-image/issues/141). ([c787c0d](https://github.com/ckeditor/ckeditor5-ui/commit/c787c0d))
* `ContextualToolbar` should not be positioned to a zero–width DOM rect when invoked for a multi-line forward selection. Closes [#308](https://github.com/ckeditor/ckeditor5-ui/issues/308). ([00b701b](https://github.com/ckeditor/ckeditor5-ui/commit/00b701b))
* `ContextualToolbar` will accept the object format of `config.contextualToolbar`. Closes [#316](https://github.com/ckeditor/ckeditor5-ui/issues/316). ([d71cad8](https://github.com/ckeditor/ckeditor5-ui/commit/d71cad8))
* Fixed sticky panel's `z-index` so it's correctly rendered above images (or other relatively positioned elements). Closes [#315](https://github.com/ckeditor/ckeditor5-ui/issues/315). ([00f2add](https://github.com/ckeditor/ckeditor5-ui/commit/00f2add))
* The content of the `BalloonPanelView` should be selectable. Closes [#294](https://github.com/ckeditor/ckeditor5-ui/issues/294). Closes https://github.com/ckeditor/ckeditor5/issues/498. ([e5315df](https://github.com/ckeditor/ckeditor5-ui/commit/e5315df))

### Features

* Implemented `View#removeChildren()`, the opposite of `View#addChildren()`. Closes [#303](https://github.com/ckeditor/ckeditor5-ui/issues/303). ([0f1ea5a](https://github.com/ckeditor/ckeditor5-ui/commit/0f1ea5a))
* Replaced `StickyToolbarView` with a generic `StickyPanelView`. Closes [#297](https://github.com/ckeditor/ckeditor5-ui/issues/297). ([b10b43c](https://github.com/ckeditor/ckeditor5-ui/commit/b10b43c))

### Other changes

* `ToolbarView#fillFromConfig()` will warn when the factory does not provide a component. Closes [#291](https://github.com/ckeditor/ckeditor5-ui/issues/291). Closes [ckeditor/ckeditor5#526](https://github.com/ckeditor/ckeditor5/issues/526). ([2e63e70](https://github.com/ckeditor/ckeditor5-ui/commit/2e63e70))
* The `escPressHandler` function should be replaced by the `KeystrokeHandler`. Closes [#150](https://github.com/ckeditor/ckeditor5-ui/issues/150). ([b322744](https://github.com/ckeditor/ckeditor5-ui/commit/b322744))

### BREAKING CHANGES

* `Toolbar#fillFromConfig()` cannot be now called with an `undefined`. Make sure to use `normalizeToolbarConfig()` to get a reliable object.
* The `escPressHandler` is no longer available. Please
refer to the `KeystrokeHandler` helper to learn more.
* The `StickyToolbarView` and corresponding CSS `.ck-sticky-panel` classes are no longer available. `StickyPanelView` + `ToolbarView` combo should be used instead.


## [0.10.0](https://github.com/ckeditor/ckeditor5-ui/compare/v0.9.0...v0.10.0) (2017-09-03)

### Bug fixes

* `ContextualToolbar` should have proper editor toolbar styling. Closes [#230](https://github.com/ckeditor/ckeditor5-ui/issues/230). ([4e2ee36](https://github.com/ckeditor/ckeditor5-ui/commit/4e2ee36))
* BalloonPanelView should prevent native #selectstart event. Closes [#243](https://github.com/ckeditor/ckeditor5-ui/issues/243). ([cba3fb1](https://github.com/ckeditor/ckeditor5-ui/commit/cba3fb1))
* Button tooltip should not look blurry on low-DPI screens. Closes [#142](https://github.com/ckeditor/ckeditor5-ui/issues/142). Closes [#133](https://github.com/ckeditor/ckeditor5-ui/issues/133). ([a497aff](https://github.com/ckeditor/ckeditor5-ui/commit/a497aff))
* Clicking and dragging in a drop-down panel should not break the selection. Closes [#228](https://github.com/ckeditor/ckeditor5-ui/issues/228). ([6066a09](https://github.com/ckeditor/ckeditor5-ui/commit/6066a09))
* Contextual toolbar should re–position correctly on window scroll. Closes [#227](https://github.com/ckeditor/ckeditor5-ui/issues/227). ([e5ea25f](https://github.com/ckeditor/ckeditor5-ui/commit/e5ea25f))
* `DropdownView` should open upon arrow down key press. Closes [#249](https://github.com/ckeditor/ckeditor5-ui/issues/249). ([c1e6afc](https://github.com/ckeditor/ckeditor5-ui/commit/c1e6afc))
* List items should handle Enter and Space key press when focused. Closes [#153](https://github.com/ckeditor/ckeditor5-ui/issues/153). ([403b64a](https://github.com/ckeditor/ckeditor5-ui/commit/403b64a))
* The `clickOutsideHandler` helper should use `mousedown` instead of `mouseup` event. Closes [#281](https://github.com/ckeditor/ckeditor5-ui/issues/281). ([6b980b6](https://github.com/ckeditor/ckeditor5-ui/commit/6b980b6))
* The `Template` class should not throw an error when a child view in the definition has an `id` attribute set without a value. Closes [#289](https://github.com/ckeditor/ckeditor5-ui/issues/289). ([d7072ba](https://github.com/ckeditor/ckeditor5-ui/commit/d7072ba))
* The `TooltipView` should hide when the `TooltipView#text` is empty. The `ButtonView's` ability to get a tooltip should not be restricted after `View` initialization. Closes [#283](https://github.com/ckeditor/ckeditor5-ui/issues/283). ([1588c82](https://github.com/ckeditor/ckeditor5-ui/commit/1588c82))
* The dropdown menu should not open using the keyboard when disabled. Closes [#238](https://github.com/ckeditor/ckeditor5-ui/issues/238). ([fc524b8](https://github.com/ckeditor/ckeditor5-ui/commit/fc524b8))

### Features

* `StickyToolbarView` now supports a configurable vertical offset from the top of the page. Closes [#277](https://github.com/ckeditor/ckeditor5-ui/issues/277). ([245f0fa](https://github.com/ckeditor/ckeditor5-ui/commit/245f0fa))

  Also implemented the `normalizeToolbarConfig()` utility.
* Added `TextInputView#isReadOnly` and `LabeledInputView#isReadOnly`  states. Closes [#266](https://github.com/ckeditor/ckeditor5-ui/issues/266). Closes [#268](https://github.com/ckeditor/ckeditor5-ui/issues/268). ([111a728](https://github.com/ckeditor/ckeditor5-ui/commit/111a728))
* Added optional notification title. Closes [#241](https://github.com/ckeditor/ckeditor5-ui/issues/241). ([abbb68f](https://github.com/ckeditor/ckeditor5-ui/commit/abbb68f))
* Allowed `BalloonPanelView` position limiter defined as a function. Made `ContextualBalloon` position limiter configurable via `#positionLimiter` property. Closes [#260](https://github.com/ckeditor/ckeditor5-ui/issues/260). ([322563e](https://github.com/ckeditor/ckeditor5-ui/commit/322563e))
* Implemented placeholder in `InputTextView`. Closes [#220](https://github.com/ckeditor/ckeditor5-ui/issues/220). ([5d91d18](https://github.com/ckeditor/ckeditor5-ui/commit/5d91d18))
* Introduced `CommandFactory#names()`. Closes [#287](https://github.com/ckeditor/ckeditor5-ui/issues/287). ([4038da2](https://github.com/ckeditor/ckeditor5-ui/commit/4038da2))

### Other changes

* Add support for multiple context elements in the `clickOutsideHandler` helper. Closes [#261](https://github.com/ckeditor/ckeditor5-ui/issues/261). ([9da5bf7](https://github.com/ckeditor/ckeditor5-ui/commit/9da5bf7))
* Added the `beforeShow` event to the `ContextualToolbar` plugin. Closes [#222](https://github.com/ckeditor/ckeditor5-ui/issues/222). ([835d0ac](https://github.com/ckeditor/ckeditor5-ui/commit/835d0ac))
* Implemented public `show()` and `hide()` methods in the `ContextualToolbar` plugin. Closes [#263](https://github.com/ckeditor/ckeditor5-ui/issues/263). ([eb4caab](https://github.com/ckeditor/ckeditor5-ui/commit/eb4caab))
* Improvements in the `BalloonPanelView`–based components for the balloon toolbar editor. Closes [#236](https://github.com/ckeditor/ckeditor5-ui/issues/236). Closes [#234](https://github.com/ckeditor/ckeditor5-ui/issues/234). Closes [#224](https://github.com/ckeditor/ckeditor5-ui/issues/224). ([737b55f](https://github.com/ckeditor/ckeditor5-ui/commit/737b55f))
* Made the UI component initialization and destruction processes synchronous. Closes [#225](https://github.com/ckeditor/ckeditor5-ui/issues/225). ([07e1502](https://github.com/ckeditor/ckeditor5-ui/commit/07e1502))
* Made the UI destruction a fail–safe, repeatable process. Closes [#248](https://github.com/ckeditor/ckeditor5-ui/issues/248). ([6f5ec0d](https://github.com/ckeditor/ckeditor5-ui/commit/6f5ec0d))
* The `ContextualToolbar` should not show up when all child items are disabled. The `ContextualToolbar#beforeShow` event has been replaced by `ContextualToolbar#show`. Closes [#269](https://github.com/ckeditor/ckeditor5-ui/issues/269). Closes [#232](https://github.com/ckeditor/ckeditor5-ui/issues/232). ([d83d07d](https://github.com/ckeditor/ckeditor5-ui/commit/d83d07d))

### BREAKING CHANGES

* `StickyToolbarView#limiterOffset` has been renamed to `StickyToolbarView#limiterBottomOffset`.
* `ContextualToolbar#beforeShow` is no longer available. Please refer to `ContextualToolbar#show` instead.
* The `clickOutsideHandler` helper's `contextElement` config option is now an `Array` named `contextElements`.
* `View#init()`, `View#destroy()` (also `ViewCollection#init()`, `ViewCollection#destroy()` and `ViewCollection#add()`) no longer return `Promise`. It may require updates in UI components which inherit from `View` and rely on the value returned by these methods.
* Various UI components switched to synchronous `init()` and `destroy()` (no longer returning `Promise`), which means that features using these components may need some updates to work properly.
* The position names in `BalloonPanelView.defaultPositions` and their results have changed. Please refer to the latest API documentation to learn more.


## [0.9.0](https://github.com/ckeditor/ckeditor5-ui/compare/v0.8.0...v0.9.0) (2017-05-07)

### Bug fixes

* `BalloonPanelView` should not be focusable. Closes [#206](https://github.com/ckeditor/ckeditor5-ui/issues/206). ([f9e3bb7](https://github.com/ckeditor/ckeditor5-ui/commit/f9e3bb7))

  T/206a: BalloonPanelView should not be focusable
* ContextualBalloon plugin should use BalloonPanelView#pin instead of #attachTo. Closes [#192](https://github.com/ckeditor/ckeditor5-ui/issues/192). ([28dd457](https://github.com/ckeditor/ckeditor5-ui/commit/28dd457))
* ContextualBalloon.view#element should be registered in editor's focus tracker. Closes [#193](https://github.com/ckeditor/ckeditor5-ui/issues/193). ([cfbe329](https://github.com/ckeditor/ckeditor5-ui/commit/cfbe329))
* FocusCycler should ignore invisible views. Closes [#209](https://github.com/ckeditor/ckeditor5-ui/issues/209). ([b8fbaf1](https://github.com/ckeditor/ckeditor5-ui/commit/b8fbaf1))

  T/209: FocusCycler should not consider invisible views.
* ViewCollection#destroy should wait for all ViewCollection#add promises to resolve to avoid errors. Closes [#203](https://github.com/ckeditor/ckeditor5-ui/issues/203). ([a7e7c94](https://github.com/ckeditor/ckeditor5-ui/commit/a7e7c94))

### Features

* Added keepAttachedTo() method to the BalloonPanelView. Closes [#170](https://github.com/ckeditor/ckeditor5-ui/issues/170). ([101b465](https://github.com/ckeditor/ckeditor5-ui/commit/101b465))
* Introduced `ContextualToolbar` plugin. Closes [#182](https://github.com/ckeditor/ckeditor5-ui/issues/182). Closes [#187](https://github.com/ckeditor/ckeditor5-ui/issues/187). ([66a30b1](https://github.com/ckeditor/ckeditor5-ui/commit/66a30b1))

  Introduced several new positions in `BalloonPanelView#defaultPositions`. Added `className` attribute to the `BalloonPanelView` interface.

  BREAKING CHANGE: Default positions of the `BalloonPanelView` have been renamed.

  BREAKING CHANGE: Class names controlling the arrow of the panel have been renamed.
* Introduced ContextualBalloon plugin for managing contextual balloons. Closes [#134](https://github.com/ckeditor/ckeditor5-ui/issues/134). ([3ceb6a6](https://github.com/ckeditor/ckeditor5-ui/commit/3ceb6a6))
* Introduced notification plugin. Closes [#189](https://github.com/ckeditor/ckeditor5-ui/issues/189). ([f2dd63f](https://github.com/ckeditor/ckeditor5-ui/commit/f2dd63f))

### Other changes

* Improved ContextualBalloon so it supports asynchronous Views. Closes [#200](https://github.com/ckeditor/ckeditor5-ui/issues/200). ([09067aa](https://github.com/ckeditor/ckeditor5-ui/commit/09067aa))
* Merged `FloatingPanelView` into `BalloonPanelView`. Closes [#191](https://github.com/ckeditor/ckeditor5-ui/issues/191). ([4b90faa](https://github.com/ckeditor/ckeditor5-ui/commit/4b90faa))

  BREAKING CHANGE: `FloatingPanelView` is no longer available.
  BREAKING CHANGE: `BalloonPanelView#keepAttachedTo()` has been replaced by `pin()`.
  BREAKING CHANGE: Default position names in `BalloonPanelView.defaultPositions` have changed. Now prefixed with `arrow_`.
* Updated translations. ([3455fe7](https://github.com/ckeditor/ckeditor5-ui/commit/3455fe7))

### BREAKING CHANGES

* Default positions of the `BalloonPanelView` have been renamed.
* Class names controlling the arrow of the panel have been renamed.
* `FloatingPanelView` is no longer available.
* `BalloonPanelView#keepAttachedTo()` has been replaced by `pin()`.
* Default position names in `BalloonPanelView.defaultPositions` have changed. Now prefixed with `arrow_`.


## [0.8.0](https://github.com/ckeditor/ckeditor5-ui/compare/v0.7.1...v0.8.0) (2017-04-05)

### Features

* Allowed marking ListItemView active using the #isActive attribute. Closes [#166](https://github.com/ckeditor/ckeditor5-ui/issues/166). ([a19d6c4](https://github.com/ckeditor/ckeditor5-ui/commit/a19d6c4))
* Enabled styling via "class" attribute in ListItemView. Closes [#162](https://github.com/ckeditor/ckeditor5-ui/issues/162). ([672bf82](https://github.com/ckeditor/ckeditor5-ui/commit/672bf82))
* Implemented features necessary for creating inline editors UI – `FloatingPanelView` class, `Template.revert()` method and `enableToolbarKeyboardFocus()` util. Closes [#152](https://github.com/ckeditor/ckeditor5-ui/issues/152). ([cb606d7](https://github.com/ckeditor/ckeditor5-ui/commit/cb606d7))

### Other changes

* `ComponentFactory` will throw an error when attempting to create a non-existent component. Closes [#174](https://github.com/ckeditor/ckeditor5-ui/issues/174). ([ef0a7f8](https://github.com/ckeditor/ckeditor5-ui/commit/ef0a7f8))
* Imported "ck-hidden" CSS class from ckeditor5-theme-lark. Closes [#164](https://github.com/ckeditor/ckeditor5-ui/issues/164). ([486bb22](https://github.com/ckeditor/ckeditor5-ui/commit/486bb22))
* Moved `ViewCollection#bindTo` method to `Collection` class in `ckeditor5-utils`. Closes [#168](https://github.com/ckeditor/ckeditor5-ui/issues/168). ([5b55987](https://github.com/ckeditor/ckeditor5-ui/commit/5b55987))
* Updated translations. ([3b27e51](https://github.com/ckeditor/ckeditor5-ui/commit/3b27e51))

### BREAKING CHANGES

* `ViewCollection#bindTo.as` is renamed to `Collection#bindTo.using` when mapping function is a parameter. See`Collection#bindTo` docs.
* The `ui/balloonpanel/balloonpanelview` module was renamed to `ui/panel/balloon/balloonpanelview`. See [#152](https://github.com/ckeditor/ckeditor5-ui/issues/152).


## [0.7.1](https://github.com/ckeditor/ckeditor5-ui/compare/v0.7.0...v0.8.0) (2017-03-06)

### Bug fixes

* Removed title from the editable element. Fixes [#121](https://github.com/ckeditor/ckeditor5/issues/121). ([71fb3eb](https://github.com/ckeditor/ckeditor5-ui/commit/71fb3eb))

### Features

* Added support for toolbar item separators. Closes [#154](https://github.com/ckeditor/ckeditor5/issues/154). ([f3cb75d](https://github.com/ckeditor/ckeditor5-ui/commit/f3cb75d))

### Other changes

* Uploaded translations. ([67ba32b](https://github.com/ckeditor/ckeditor5-ui/commit/67ba32b))
