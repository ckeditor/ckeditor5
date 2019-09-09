Changelog
=========

## [14.0.0](https://github.com/ckeditor/ckeditor5-ui/compare/v13.0.2...v14.0.0) (2019-08-26)

### Features

* Brought support for right–to–left (RTL) languages to various UI components. See [ckeditor/ckeditor5#1151](https://github.com/ckeditor/ckeditor5/issues/1151). ([d6c7f55](https://github.com/ckeditor/ckeditor5-ui/commit/d6c7f55))

### Bug fixes

* `ColorGrid` should set the `#isOn` property value of new `ColorTiles`. See [ckeditor/ckeditor5-font#51](https://github.com/ckeditor/ckeditor5-font/issues/51). ([e89ad60](https://github.com/ckeditor/ckeditor5-ui/commit/e89ad60))
* All editor toolbars should come with the `role` and `aria-label` attributes. Closes [ckeditor/ckeditor5#1404](https://github.com/ckeditor/ckeditor5/issues/1404). ([bdede90](https://github.com/ckeditor/ckeditor5-ui/commit/bdede90))
* Screen reader will now properly prompt errors for text inputs. Closes [ckeditor/ckeditor5#1406](https://github.com/ckeditor/ckeditor5/issues/1406). ([3a164b7](https://github.com/ckeditor/ckeditor5-ui/commit/3a164b7))

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([451df7b](https://github.com/ckeditor/ckeditor5-ui/commit/451df7b))
* Updated translations. ([eca9fe6](https://github.com/ckeditor/ckeditor5-ui/commit/eca9fe6))

### BREAKING CHANGES

* The `ToolbarView` class requires the [editor locale](https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_locale-Locale.html) to be passed into the constructor.


## [13.0.2](https://github.com/ckeditor/ckeditor5-ui/compare/v13.0.1...v13.0.2) (2019-07-10)

### Other changes

* Updated translations. ([ad189b6](https://github.com/ckeditor/ckeditor5-ui/commit/ad189b6))


## [13.0.1](https://github.com/ckeditor/ckeditor5-ui/compare/v13.0.0...v13.0.1) (2019-07-04)

### Other changes

* Updated translations. ([1964cc0](https://github.com/ckeditor/ckeditor5-ui/commit/1964cc0)) ([11cfd41](https://github.com/ckeditor/ckeditor5-ui/commit/11cfd41))


## [13.0.0](https://github.com/ckeditor/ckeditor5-ui/compare/v12.1.0...v13.0.0) (2019-06-05)

### Features

* Implemented the single view mode for the `ContextualBalloon` plugin. See https://github.com/ckeditor/ckeditor5-mention/issues/74. ([c000c93](https://github.com/ckeditor/ckeditor5-ui/commit/c000c93))
* Introduced rotatable panels for `ContextualBalloon`. Closes https://github.com/ckeditor/ckeditor5-ui/issues/491. ([581d8f7](https://github.com/ckeditor/ckeditor5-ui/commit/581d8f7))

### Other changes

* Renamed a misspelled `InputTextViewariaDesribedById` property to `InputTextView#ariaDescribedById`. Closes [#483](https://github.com/ckeditor/ckeditor5-ui/issues/483). ([2288bf3](https://github.com/ckeditor/ckeditor5-ui/commit/2288bf3))
* The `_rwd.css` mixin was moved to this package from `@ckeditor/ckeditor5-theme-lark`. See [ckeditor/ckeditor5#1662](https://github.com/ckeditor/ckeditor5/issues/1662). ([96e3a3c](https://github.com/ckeditor/ckeditor5-ui/commit/96e3a3c))
* The `ContextualBalloon#add()` method should accept the `withArrow` option. Closes [#487](https://github.com/ckeditor/ckeditor5-ui/issues/487). ([0e7f670](https://github.com/ckeditor/ckeditor5-ui/commit/0e7f670))
* Updated translations. ([4699d8b](https://github.com/ckeditor/ckeditor5-ui/commit/4699d8b)) ([d4c5714](https://github.com/ckeditor/ckeditor5-ui/commit/d4c5714))

### BREAKING CHANGES

* The (misspelled) `InputTextView#ariaDesribedById` property is no longer available. Use `ariaDescribedById` instead.


## [12.1.0](https://github.com/ckeditor/ckeditor5-ui/compare/v12.0.0...v12.1.0) (2019-04-10)

### Features

* Implemented `ColorGridView` and `ColorTileView` components. See [ckeditor/ckeditor5#1457](https://github.com/ckeditor/ckeditor5/issues/1457). ([6be52b4](https://github.com/ckeditor/ckeditor5-ui/commit/6be52b4))

### Bug fixes

* Fixed `View#render` collision when moving focus from a one editable to the other in multi-root editor. Closes https://github.com/ckeditor/ckeditor5/issues/1676. ([17e86f9](https://github.com/ckeditor/ckeditor5-ui/commit/17e86f9))

### Other changes

* Optimized icons. ([5325ea8](https://github.com/ckeditor/ckeditor5-ui/commit/5325ea8))
* Updated translations. ([dcdca2e](https://github.com/ckeditor/ckeditor5-ui/commit/dcdca2e))


## [12.0.0](https://github.com/ckeditor/ckeditor5-ui/compare/v11.2.0...v12.0.0) (2019-02-28)

### Bug fixes

* Prevented from changing the view document during the render phase. Closes https://github.com/ckeditor/ckeditor5/issues/1530. ([7cf835e](https://github.com/ckeditor/ckeditor5-ui/commit/7cf835e))
* Fixed memory leaks during editor initialization and destruction (see [ckeditor/ckeditor5#1341](https://github.com/ckeditor/ckeditor5/issues/1341)). ([fd18fb9](https://github.com/ckeditor/ckeditor5-ui/commit/fd18fb9))

### Other changes

* The `class` property should control the DOM class attribute in all UI components. Closes [#450](https://github.com/ckeditor/ckeditor5-ui/issues/450). ([b9b68c6](https://github.com/ckeditor/ckeditor5-ui/commit/b9b68c6))
* Updated translations. ([b9caee9](https://github.com/ckeditor/ckeditor5-ui/commit/b9caee9)) ([a3afaaa](https://github.com/ckeditor/ckeditor5-ui/commit/a3afaaa)) ([909e676](https://github.com/ckeditor/ckeditor5-ui/commit/909e676))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))
* The `BallonPanelView#className` property was renamed to `#class`.
* The `ToolbarView#className` property was renamed to `#class`.
* The `EditableUIView#externalElement` property (which held the element on which the editor was created if it was explicitly passed) was removed.
* The `EditorUIView#editableElement` property was made private. Use `editor.ui.getEditableElement()` method instead.


## [11.2.0](https://github.com/ckeditor/ckeditor5-ui/compare/v11.1.0...v11.2.0) (2018-12-05)

### Features

* Added the `.ck-read-only` CSS class to the `EditableUIView` when `#isReadOnly` is `true`. ([4119822](https://github.com/ckeditor/ckeditor5-ui/commit/4119822))
* Added the optional `DropdownView#class` property to set a custom CSS class on the main element in DOM. Closes [#447](https://github.com/ckeditor/ckeditor5-ui/issues/447). ([9cdcd4a](https://github.com/ckeditor/ckeditor5-ui/commit/9cdcd4a))

  Thanks to [@lucasreppewelander](https://github.com/lucasreppewelander)!
* Implemented `LabeledInputView#infoText` to display useful hints next to the input (see [ckeditor/ckeditor5-media-embed#35](https://github.com/ckeditor/ckeditor5-media-embed/issues/35)). ([6ac03ea](https://github.com/ckeditor/ckeditor5-ui/commit/6ac03ea))
* Implemented configurable, smart `DropdownView` panel positioning. Closes [#123](https://github.com/ckeditor/ckeditor5-ui/issues/123). ([8094f19](https://github.com/ckeditor/ckeditor5-ui/commit/8094f19))

### Other changes

* Improved SVG icons size. See [ckeditor/ckeditor5-theme-lark#206](https://github.com/ckeditor/ckeditor5-theme-lark/issues/206). ([ed88305](https://github.com/ckeditor/ckeditor5-ui/commit/ed88305))
* Updated translations. ([2e409a9](https://github.com/ckeditor/ckeditor5-ui/commit/2e409a9)) ([611bd04](https://github.com/ckeditor/ckeditor5-ui/commit/611bd04)) ([c6689e4](https://github.com/ckeditor/ckeditor5-ui/commit/c6689e4)) ([07c4fdb](https://github.com/ckeditor/ckeditor5-ui/commit/07c4fdb))


## [11.1.0](https://github.com/ckeditor/ckeditor5-ui/compare/v11.0.0...v11.1.0) (2018-10-08)

### Features

* Allowed displaying an error message next to the `LabeledInputVIew` (see [ckeditor/ckeditor5-media-embed#1](https://github.com/ckeditor/ckeditor5-media-embed/issues/1)). ([81aaea4](https://github.com/ckeditor/ckeditor5-ui/commit/81aaea4))

### Bug fixes

* Made the `Edit block` string translatable. Closes [#445](https://github.com/ckeditor/ckeditor5-ui/issues/445). ([1fa84e9](https://github.com/ckeditor/ckeditor5-ui/commit/1fa84e9))

### Other changes

* Updated translations. ([baff3c9](https://github.com/ckeditor/ckeditor5-ui/commit/baff3c9))
* Updated translations. ([e58bcbb](https://github.com/ckeditor/ckeditor5-ui/commit/e58bcbb))


## [11.0.0](https://github.com/ckeditor/ckeditor5-ui/compare/v10.1.0...v11.0.0) (2018-07-18)

### Features

* Implemented the `SwitchButtonView`. Closes [#402](https://github.com/ckeditor/ckeditor5-ui/issues/402). Closes [#403](https://github.com/ckeditor/ckeditor5-ui/issues/403). ([105fbea](https://github.com/ckeditor/ckeditor5-ui/commit/105fbea))

  Also:

  * Simplified the `ListItemView` class, which is now just a container for `ButtonView` (and others),
  * Moved `ListItemView#style` and `#class` to the `ButtonView` (as `#class` and `#labelStyle`),
  * Enhanced the `addListToDropdown` utility with a better configuration (`ListDropdownItemDefinition`) and the support for buttons, switch buttons, and separators,
  * `.ck-button` and `.ck-list` became `flex` containers; the first one to allow complex inner structures (like the toggle) and the later to take control of complex list items (like `.ck-switchbutton`).

### Bug fixes

* The `BalloonToolbar` should hide when the editable is blurred. Closes [#418](https://github.com/ckeditor/ckeditor5-ui/issues/418). ([f6a02d4](https://github.com/ckeditor/ckeditor5-ui/commit/f6a02d4))
* The `BlockToolbar` should add elements to the `FocusTracker` only after `uiReady` is fired to avoid errors. Closes [#424](https://github.com/ckeditor/ckeditor5-ui/issues/424). ([ae9fa09](https://github.com/ckeditor/ckeditor5-ui/commit/ae9fa09))
* The `BlockToolbar` should hide when the editor is blurred. Closes [#408](https://github.com/ckeditor/ckeditor5-ui/issues/408). ([e3bbccf](https://github.com/ckeditor/ckeditor5-ui/commit/e3bbccf))

### Other changes

* Allowed list item's buttons to have an outer, visible box-shadow. Ensured the balloon panel's arrow does not cover panel's children. Closes [#394](https://github.com/ckeditor/ckeditor5-ui/issues/394). ([8a64ee2](https://github.com/ckeditor/ckeditor5-ui/commit/8a64ee2))
* Updated translations. ([949585d](https://github.com/ckeditor/ckeditor5-ui/commit/949585d))

### BREAKING CHANGES

* Most of the `ListItemView` functionality is now handled by the `ButtonView`,
* The API of the `addListToDropdown` has changed; see `ListDropdownItemDefinition` to learn more,
* The `.ck-button` and `.ck-list` classes are using `flex` which may have an impact on rendering.


## [10.1.0](https://github.com/ckeditor/ckeditor5-ui/compare/v10.0.0...v10.1.0) (2018-06-21)

### Features

* Implemented list component separators (see [ckeditor/ckeditor5-table#24](https://github.com/ckeditor/ckeditor5-table/issues/24)). ([0808a8c](https://github.com/ckeditor/ckeditor5-ui/commit/0808a8c))
* Introduced the `BlockToolbar` plugin. Closes [#391](https://github.com/ckeditor/ckeditor5-ui/issues/391). ([5868516](https://github.com/ckeditor/ckeditor5-ui/commit/5868516))

### Bug fixes

* The action should be executed upon the first click on a tooltip-enabled UI in iOS. Closes [ckeditor/ckeditor5#920](https://github.com/ckeditor/ckeditor5/issues/920). ([6508ba2](https://github.com/ckeditor/ckeditor5-ui/commit/6508ba2))
* The balloon toolbar should be attached correctly in case of a multi-range selection. Closes [#385](https://github.com/ckeditor/ckeditor5-ui/issues/385). ([714ef21](https://github.com/ckeditor/ckeditor5-ui/commit/714ef21))
* The buttons in the editor should provide basic accessibility. Closes [ckeditor/ckeditor5#1013](https://github.com/ckeditor/ckeditor5/issues/1013). ([9e17d13](https://github.com/ckeditor/ckeditor5-ui/commit/9e17d13))

### Other changes

* Disabling a `ListItemView` should be possible using the `isEnabled` property. Closes [#389](https://github.com/ckeditor/ckeditor5-ui/issues/389). ([76a4d47](https://github.com/ckeditor/ckeditor5-ui/commit/76a4d47))
* Made the `ContextualBalloon` always use the position of the topmost view in the stack (see: [ckeditor/ckeditor5-table#28](https://github.com/ckeditor/ckeditor5-table/issues/28)). Closes [ckeditor/ckeditor5#900](https://github.com/ckeditor/ckeditor5/issues/900). ([a2ef073](https://github.com/ckeditor/ckeditor5-ui/commit/a2ef073))
* Updated translations. ([084e8c6](https://github.com/ckeditor/ckeditor5-ui/commit/084e8c6))


## [10.0.0](https://github.com/ckeditor/ckeditor5-ui/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([f1e5fbf](https://github.com/ckeditor/ckeditor5-ui/commit/f1e5fbf))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-ui/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-ui/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

### Other changes

* Renamed plural method names to singular. See [ckeditor/ckeditor5#742](https://github.com/ckeditor/ckeditor5/issues/742). ([48cd53d](https://github.com/ckeditor/ckeditor5-ui/commit/48cd53d))

### BREAKING CHANGES

* `View#registerChildren()` and `View#deregisterChildren()` have been renamed to `View#registerChild()` and `View#deregisterChild()`.


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-ui/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Features

* Implemented the `IconView#fillColor` observable which fills child `.ck-icon__fill` paths  with the color (see [ckeditor/ckeditor5-theme-lark#148](https://github.com/ckeditor/ckeditor5-theme-lark/issues/148)). ([728a691](https://github.com/ckeditor/ckeditor5-ui/commit/728a691))
* Initial implementation of the `ButtonDropdownView`. Closes [#333](https://github.com/ckeditor/ckeditor5-ui/issues/333). ([6e9c6e4](https://github.com/ckeditor/ckeditor5-ui/commit/6e9c6e4))

  Also:

  * Allowed vertical layout of the `ToolbarView` thanks to the `#isVertical` attribute.
  * Implemented `ToolbarView#className` attribute.
  * Implemented `DropdownView#isEnabled` attribute along with the CSS class binding.
* Updated UI components to bring the support for the refreshed Lark theme (see [ckeditor/ckeditor5#645](https://github.com/ckeditor/ckeditor5/issues/645)). ([623d536](https://github.com/ckeditor/ckeditor5-ui/commit/623d536))

### Bug fixes

* Button icon styles should not touch the dropdown's arrow. Closes [ckeditor/ckeditor5#831](https://github.com/ckeditor/ckeditor5/issues/831). ([507549f](https://github.com/ckeditor/ckeditor5-ui/commit/507549f))

### Other changes

* Added a CSS class to the SplitButtonView when the arrow is on (see [ckeditor/ckeditor5-theme-lark#134](https://github.com/ckeditor/ckeditor5-theme-lark/issues/134)). ([d490d61](https://github.com/ckeditor/ckeditor5-ui/commit/d490d61))
* Added the `.ck-content` CSS class to the `EditableUIView` in order to simplify styling the editor content. Closes [#176](https://github.com/ckeditor/ckeditor5-ui/issues/176). ([f38ae70](https://github.com/ckeditor/ckeditor5-ui/commit/f38ae70))
* Align feature class naming to a new scheme. ([1c500f6](https://github.com/ckeditor/ckeditor5-ui/commit/1c500f6))
* Aligned code to changes (`config.lang` to `config.languages`). Part of the Translation Service v2 ([ckeditor/ckeditor5#624](https://github.com/ckeditor/ckeditor5/issues/624)). ([876f681](https://github.com/ckeditor/ckeditor5-ui/commit/876f681))
* ComponentFactory.names() will return original component names (instead of normalized names). Closes [#376](https://github.com/ckeditor/ckeditor5-ui/issues/376). ([b6b39d7](https://github.com/ckeditor/ckeditor5-ui/commit/b6b39d7))
* CSS classes should be prefixed with `ck-` instead of `cke-`. Closes [#112](https://github.com/ckeditor/ckeditor5-ui/issues/112). ([7973f83](https://github.com/ckeditor/ckeditor5-ui/commit/7973f83))
* Introduced `SplitButtonView` and new dropdown creation helpers (`createDropdown()`, `addListToDropdown()` and `addToolbarToDropdown()`) Closes [#344](https://github.com/ckeditor/ckeditor5-ui/issues/344). Closes [#356](https://github.com/ckeditor/ckeditor5-ui/issues/356). ([0f26ca8](https://github.com/ckeditor/ckeditor5-ui/commit/0f26ca8))
* Migrated the package styles from SASS to PostCSS to bring theme support and avoid duplicates in some editor builds. Closes [#144](https://github.com/ckeditor/ckeditor5-ui/issues/144). Closes [ckeditor/ckeditor5#420](https://github.com/ckeditor/ckeditor5/issues/420). ([f152dfc](https://github.com/ckeditor/ckeditor5-ui/commit/f152dfc))
* Moved ck-button-icon mixin from ckeditor5-theme-lark. ([8757d27](https://github.com/ckeditor/ckeditor5-ui/commit/8757d27))
* Removed the `.ck-editor-toolbar` and `.ck-editor-toolbar-container` classes (see [ckeditor/ckeditor5-theme-lark#135](https://github.com/ckeditor/ckeditor5-theme-lark/issues/135)). ([352d056](https://github.com/ckeditor/ckeditor5-ui/commit/352d056))
* Rename `ContextualToolbar` to `BalloonToolbar`.  Closes [ckeditor/ckeditor5#550](https://github.com/ckeditor/ckeditor5/issues/550). ([28f59df](https://github.com/ckeditor/ckeditor5-ui/commit/28f59df))
* The `closeDropdownOnBlur()` helper should use `clickOutsideHandler()`. Decorated the `View#render()` method. Closes [#311](https://github.com/ckeditor/ckeditor5-ui/issues/311). ([269e97b](https://github.com/ckeditor/ckeditor5-ui/commit/269e97b))
* Updated translations. ([f657be2](https://github.com/ckeditor/ckeditor5-ui/commit/f657be2))

### BREAKING CHANGES

* Renamed `contextual/contextualtoolbar~ContextualToolbar` to `balloon/balloontoolbar~BalloonToolbar`.
* Renamed `contextualToolbar` configuration option to `balloonToolbar`.
* Removed `DropdownModel` interface – you can use dropdown properties directly now. See [#356](https://github.com/ckeditor/ckeditor5-ui/issues/356).
* Removed `createButtonDropdown()` and `ButtonDropdownView`. See [#356](https://github.com/ckeditor/ckeditor5-ui/issues/356).
* Removed `createListDropdown()` and `ListDropdownView`. See [#356](https://github.com/ckeditor/ckeditor5-ui/issues/356).
* The DOM structure of the dropdown component has changed. Please refer to the documentation to find out more.
* Basic properties of the balloon panel component have changed (i.e. the location of the arrow, the default positions), which may have an impact on existing integrations.
* The styles are no longer developed in SASS which means the `.scss` files became unavailable. Please refer to the [Theme Customization](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/ui/theme-customization.html) guide to learn more about migration to PostCSS.


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-ui/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Bug fixes

* `Template#getViews()` generator should not traverse native HTML elements. Closes [#337](https://github.com/ckeditor/ckeditor5-ui/issues/337). Closes [ckeditor/ckeditor5#657](https://github.com/ckeditor/ckeditor5/issues/657). ([894bad0](https://github.com/ckeditor/ckeditor5-ui/commit/894bad0))
* Improved binding of the `value` attribute in `InputTextView`. Closes [#335](https://github.com/ckeditor/ckeditor5-ui/issues/335). ([823120b](https://github.com/ckeditor/ckeditor5-ui/commit/823120b))

### Other changes

* Implemented `View#render()` method which replaces rendering the `#element` upon the first access and incorporates the `#init()` method functionality. Closes [#262](https://github.com/ckeditor/ckeditor5-ui/issues/262). Closes [#302](https://github.com/ckeditor/ckeditor5-ui/issues/302). ([bf90ad5](https://github.com/ckeditor/ckeditor5-ui/commit/bf90ad5))

   In other words – the `View#render()` method needs to be called to render a view and it sets the `View#element` itself. It can be called only once and it is done automatically if a view is added to some other view (as its child). If you need to add any additional logic to your component's initialization, then override the `render()` method (and remember to call `super.render()`).

   Additionally, from now on `View#setTemplate()` and `View#extendTemplate()` methods are recommended as a shorthand for `view.template = new Template( { ... } )` and `Template.extend( view.template )`.

    Please refer to the updated [documentation](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/architecture/intro.html#ui-library) to learn more.
* Removed legacy `width` and `height` attributes from the `BoxedEditorUIView`. Closes [#25](https://github.com/ckeditor/ckeditor5-ui/issues/25). ([ffa419a](https://github.com/ckeditor/ckeditor5-ui/commit/ffa419a))
* The `ComponentFactory` should be case-insensitive. Closes [#324](https://github.com/ckeditor/ckeditor5-ui/issues/324). ([94417e9](https://github.com/ckeditor/ckeditor5-ui/commit/94417e9))
* Updated translations. ([186f365](https://github.com/ckeditor/ckeditor5-ui/commit/186f365))

### BREAKING CHANGES

* The `View#init()` method in UI components has been renamed to `render()`. Please refer to the [documentation](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/architecture/intro.html#UI-library) to learn more.
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
* Clicking and dragging in a dropdown panel should not break the selection. Closes [#228](https://github.com/ckeditor/ckeditor5-ui/issues/228). ([6066a09](https://github.com/ckeditor/ckeditor5-ui/commit/6066a09))
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
