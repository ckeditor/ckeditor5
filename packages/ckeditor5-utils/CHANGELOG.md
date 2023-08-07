Changelog
=========

All changes in the package are documented in the main repository. See: https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md.

Changes for the past releases are available below.

## [19.0.0](https://github.com/ckeditor/ckeditor5-utils/compare/v18.0.0...v19.0.0) (2020-04-29)

### MINOR BREAKING CHANGES

* The `translate` function from the `translation-service` was marked as protected. See [#334](https://github.com/ckeditor/ckeditor5-utils/issues/334).
* The format of stored editor translations has been changed. If you use `window.CKEDITOR_TRANSLATIONS` please see [#334](https://github.com/ckeditor/ckeditor5-utils/issues/334).
* The `getPositionedAncestor()` helper will no longer return the passed element when it is positioned.

### MAJOR BREAKING CHANGES

* `env.isEdge` is no longer available. See [ckeditor/ckeditor5#6202](https://github.com/ckeditor/ckeditor5/issues/6202).

### Features

* Added the support for initializing `Collection` items via the `constructor()`. Closes [ckeditor/ckeditor5#6319](https://github.com/ckeditor/ckeditor5/issues/6319). ([8846e66](https://github.com/ckeditor/ckeditor5-utils/commit/8846e66))
* Provided support for plural forms internalization. Part of [ckeditor/ckeditor5#6526](https://github.com/ckeditor/ckeditor5/issues/6526). ([5f6ea75](https://github.com/ckeditor/ckeditor5-utils/commit/5f6ea75))

### Bug fixes

* Do not execute `ResizeObserver` callbacks when the resized element is invisible (but still in DOM) (see [ckeditor/ckeditor5#6570](https://github.com/ckeditor/ckeditor5/issues/6570)). ([fb13d9d](https://github.com/ckeditor/ckeditor5-utils/commit/fb13d9d))
* Editor will now load correctly in environment with `Symbol` polyfill. Closes [ckeditor/ckeditor5#6489](https://github.com/ckeditor/ckeditor5/issues/6489). ([7cd1f48](https://github.com/ckeditor/ckeditor5-utils/commit/7cd1f48))
* Fixed various cases with typing multi-byte unicode sequences (e.g. emojis). Closes [ckeditor/ckeditor5#3147](https://github.com/ckeditor/ckeditor5/issues/3147). Closes [ckeditor/ckeditor5#6495](https://github.com/ckeditor/ckeditor5/issues/6495). ([6dc1ba6](https://github.com/ckeditor/ckeditor5-utils/commit/6dc1ba6))
* The `getOptimalPosition()` helper should prefer positions that fit inside the viewport even though there are some others that fit better into the limiter. Closes [ckeditor/ckeditor5#6181](https://github.com/ckeditor/ckeditor5/issues/6181). ([7cd1238](https://github.com/ckeditor/ckeditor5-utils/commit/7cd1238))

### Other changes

* Removed `env.isEdge` as Edge is now detected and treated as Chrome. Closes [ckeditor/ckeditor5#6202](https://github.com/ckeditor/ckeditor5/issues/6202). ([2902b30](https://github.com/ckeditor/ckeditor5-utils/commit/2902b30))
* The `getPositionedAncestor()` helper should use `offsetParent` instead of `getComputedStyle()` for performance reasons. Closes [ckeditor/ckeditor5#6573](https://github.com/ckeditor/ckeditor5/issues/6573). ([7939756](https://github.com/ckeditor/ckeditor5-utils/commit/7939756))


## [18.0.0](https://github.com/ckeditor/ckeditor5-utils/compare/v17.0.0...v18.0.0) (2020-03-19)

Internal changes only (updated dependencies, documentation, etc.).


## [17.0.0](https://github.com/ckeditor/ckeditor5-utils/compare/v16.0.0...v17.0.0) (2020-02-19)

### MINOR BREAKING CHANGES

* The `getResizeObserver()` helper is no longer available. We recommend using the [`ResizeObserver`](http://ckeditor.com/docs/ckeditor5/latest/api/module_utils_dom_resizeobserver-ResizeObserver.html) class instead.

### Features

* Added iterator interface to the `Config` class. ([1fdf2f1](https://github.com/ckeditor/ckeditor5-utils/commit/1fdf2f1))

### Other changes

* Improved `toMap()` method performance. This results in improved editor data processing speed. Closes [ckeditor/ckeditor5#5854](https://github.com/ckeditor/ckeditor5/issues/5854). ([fef816e](https://github.com/ckeditor/ckeditor5-utils/commit/fef816e))
* Replaced the `getResizeObserver()` helper with the `ResizeObserver` class for performance reasons. See [ckeditor/ckeditor5#6145](https://github.com/ckeditor/ckeditor5/issues/6145). ([05c97f8](https://github.com/ckeditor/ckeditor5-utils/commit/05c97f8))
* The `uid()` helper should be a lot faster. Closes [ckeditor/ckeditor5#6188](https://github.com/ckeditor/ckeditor5/issues/6188). ([b57fc3f](https://github.com/ckeditor/ckeditor5-utils/commit/b57fc3f))


## [16.0.0](https://github.com/ckeditor/ckeditor5-utils/compare/v15.0.0...v16.0.0) (2019-12-04)

### Bug fixes

* Improved error rethrowing by replacing the error stack. Closes [ckeditor/ckeditor5#5595](https://github.com/ckeditor/ckeditor5/issues/5595). ([7685c0d](https://github.com/ckeditor/ckeditor5-utils/commit/7685c0d))


## [15.0.0](https://github.com/ckeditor/ckeditor5-utils/compare/v14.0.0...v15.0.0) (2019-10-23)

### Features

* Implemented the `getResizeObserver()` helper that offers an entry to the native `ResizeObserver` API (see [ckeditor/ckeditor5#416](https://github.com/ckeditor/ckeditor5/issues/416)). ([875d5a4](https://github.com/ckeditor/ckeditor5-utils/commit/875d5a4))
* Introduced `assertEqualMarkup()` test util method. Closes [ckeditor/ckeditor5-paste-from-office#14](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/14). ([ee1655f](https://github.com/ckeditor/ckeditor5-utils/commit/ee1655f))
* Introduced support for creating elements in other XML namespaces. See [ckeditor/ckeditor5#1842](https://github.com/ckeditor/ckeditor5/issues/1842). ([37fbcb9](https://github.com/ckeditor/ckeditor5-utils/commit/37fbcb9))

  Thanks [@Sebobo](https://github.com/Sebobo)!

### Bug fixes

* `Rect#excludeScrollbarsAndBorders` should support RTL environments. Fixed incorrect output of the method. Closes [#297](https://github.com/ckeditor/ckeditor5-utils/issues/297). ([35f34fc](https://github.com/ckeditor/ckeditor5-utils/commit/35f34fc))

### Other changes

* Introduced the `CKEditorError.rethrowUnexpectedError()` helper. Added custom error handling for the `Emitter#fire()` function. Part of [ckeditor/ckeditor5#1304](https://github.com/ckeditor/ckeditor5/issues/1304). ([1d84705](https://github.com/ckeditor/ckeditor5-utils/commit/1d84705))


## [14.0.0](https://github.com/ckeditor/ckeditor5-utils/compare/v13.0.1...v14.0.0) (2019-08-26)

### Features

* Add feature detection of Unicode properties entities' support. ([21c0f6b](https://github.com/ckeditor/ckeditor5-utils/commit/21c0f6b))
* Allowed specifying editor content language in `Locale`. Implemented the (UI and content) language direction discovery in `Locale`. Implemented `Locale#uiLanguage`, `Locale#uiLanguageDirection`, `Locale#contentLanguage`, and `Locale#contentLanguageDirection` properties. See [ckeditor/ckeditor5#1151](https://github.com/ckeditor/ckeditor5/issues/1151). ([91c95f3](https://github.com/ckeditor/ckeditor5-utils/commit/91c95f3))

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([71469ac](https://github.com/ckeditor/ckeditor5-utils/commit/71469ac))
* Removed the CKEditor&nbsp;5 logger and its usage. Part of [ckeditor/ckeditor5#383](https://github.com/ckeditor/ckeditor5/issues/383). ([584ef1d](https://github.com/ckeditor/ckeditor5-utils/commit/584ef1d))

### BREAKING CHANGES

* The`Locale()` constructor arguments syntax has changed. Please refer to the API documentation to learn more.
* The `Locale#language` property has been deprecated by `Locale#uiLanguage`. Please refer to the API documentation to learn more.
* Removed the CKEditor&nbsp;5 logger utility.


## [13.0.1](https://github.com/ckeditor/ckeditor5-utils/compare/v13.0.0...v13.0.1) (2019-07-10)

Internal changes only (updated dependencies, documentation, etc.).


## [13.0.0](https://github.com/ckeditor/ckeditor5-utils/compare/v12.1.1...v13.0.0) (2019-07-04)

### Features

* Added `env.isAndroid`. ([591f641](https://github.com/ckeditor/ckeditor5-utils/commit/591f641))

### Other changes

* Added context as second required argument to the `CKEditorError`'s constructor, changed `isCKEditorError()` method to `is()`. Introduced the `areConnectedThroughProperties()` utility. See [ckeditor/ckeditor5-watchdog#1](https://github.com/ckeditor/ckeditor5-watchdog/issues/1). ([bacc764](https://github.com/ckeditor/ckeditor5-utils/commit/bacc764))

### BREAKING CHANGES

* The list of `CKEditorError()`'s parameters was changed – now it requires the message, context and then data. The `isCKEditorError()` method was renamed to `is()`.


## [12.1.1](https://github.com/ckeditor/ckeditor5-utils/compare/v12.1.0...v12.1.1) (2019-06-05)

Internal changes only (updated dependencies, documentation, etc.).


## [12.1.0](https://github.com/ckeditor/ckeditor5-utils/compare/v12.0.0...v12.1.0) (2019-04-10)

### Features

* Added `isSafari` property and `isSafari()` helper to the `env` module. See: [ckeditor/ckeditor5#1463](https://github.com/ckeditor/ckeditor5/issues/1463). ([f1ba6ae](https://github.com/ckeditor/ckeditor5-utils/commit/f1ba6ae))
* Made `FocusTracker#focusedElement` observable to bring support for multi-root editors (see [ckeditor/ckeditor5#1599](https://github.com/ckeditor/ckeditor5/issues/1599)). ([952d440](https://github.com/ckeditor/ckeditor5-utils/commit/952d440))


## [12.0.0](https://github.com/ckeditor/ckeditor5-utils/compare/v11.1.0...v12.0.0) (2019-02-28)

### Features

* Introduce `Collection.has()` method. Closes [#266](https://github.com/ckeditor/ckeditor5-utils/issues/266). ([312d55e](https://github.com/ckeditor/ckeditor5-utils/commit/312d55e))

### Bug fixes

* Prevent infinite loops on `.once()`. Closes [#272](https://github.com/ckeditor/ckeditor5-utils/issues/272). Closes [#204](https://github.com/ckeditor/ckeditor5-utils/issues/204). ([54b8108](https://github.com/ckeditor/ckeditor5-utils/commit/54b8108))
* Fixed memory leaks during editor initialization and destruction (see [ckeditor/ckeditor5#1341](https://github.com/ckeditor/ckeditor5/issues/1341)). ([94bc59e](https://github.com/ckeditor/ckeditor5-utils/commit/94bc59e))

### Other changes

* Configuration options should be cloned to prevent features from altering the original values. Closes [#257](https://github.com/ckeditor/ckeditor5-utils/issues/257). ([7981d4e](https://github.com/ckeditor/ckeditor5-utils/commit/7981d4e))
* DOM Elements will not be cloned when returned from config.get. Closes [#264](https://github.com/ckeditor/ckeditor5-utils/issues/264). ([4ad23b1](https://github.com/ckeditor/ckeditor5-utils/commit/4ad23b1))
* Optimized `diff()` function to use `fastDiff()` function internally for large data sets. Closes [#269](https://github.com/ckeditor/ckeditor5-utils/issues/269). ([ee9bed0](https://github.com/ckeditor/ckeditor5-utils/commit/ee9bed0))
* Replaced `for..of` statement in `EventEmitter` with `Array.prototype.forEach`. This changes allows building a React application using `create-react-app@2`. Closes [ckeditor/ckeditor5-react#40](https://github.com/ckeditor/ckeditor5-react/issues/40). ([900b54b](https://github.com/ckeditor/ckeditor5-utils/commit/900b54b))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))


## [11.1.0](https://github.com/ckeditor/ckeditor5-utils/compare/v11.0.0...v11.1.0) (2018-12-05)

### Features

* Implemented `env#isGecko()`. See [ckeditor/ckeditor5-engine#1439](https://github.com/ckeditor/ckeditor5-engine/issues/1439). ([53b7c94](https://github.com/ckeditor/ckeditor5-utils/commit/53b7c94))

### Other changes

* Various fixes in the API docs. Thanks to [@denisname](https://github.com/denisname)!


## [11.0.0](https://github.com/ckeditor/ckeditor5-utils/compare/v10.2.1...v11.0.0) (2018-10-08)

### Other changes

* Removed the `lodash` library from this package (a modular `lodash` build has been kept under `src/lib/lodash/`). We now recommend using `lodash-es` directly. Closes [#251](https://github.com/ckeditor/ckeditor5-utils/issues/251). ([637c9e3](https://github.com/ckeditor/ckeditor5-utils/commit/637c9e3))

### BREAKING CHANGES

* Removed the `lodash` library from this package (a modular `lodash` build has been kept under `src/lib/lodash/`). We now recommend using `lodash-es` directly.


## [10.2.1](https://github.com/ckeditor/ckeditor5-utils/compare/v10.2.0...v10.2.1) (2018-07-18)

Internal changes only (updated dependencies, documentation, etc.).


## [10.2.0](https://github.com/ckeditor/ckeditor5-utils/compare/v10.1.0...v10.2.0) (2018-07-18)

### Features

* Implemented a module exposing the `CKEDIOR_VERSION` to the global scope. Closes [ckeditor/ckeditor5#1005](https://github.com/ckeditor/ckeditor5/issues/1005). ([3546ac4](https://github.com/ckeditor/ckeditor5-utils/commit/3546ac4))
* Introduced `env.isEdge`. ([13d4af4](https://github.com/ckeditor/ckeditor5-utils/commit/13d4af4))

### Bug fixes

* The `isWindow()` helper should work in the Electron environment. Closes [ckeditor/ckeditor5#879](https://github.com/ckeditor/ckeditor5/issues/879). ([d561151](https://github.com/ckeditor/ckeditor5-utils/commit/d561151))


## [10.1.0](https://github.com/ckeditor/ckeditor5-utils/compare/v10.0.0...v10.1.0) (2018-06-21)

### Features

* Introduced `set:{property}` event in `ObservableMixin`. Closes [#171](https://github.com/ckeditor/ckeditor5-utils/issues/171). ([6ef1246](https://github.com/ckeditor/ckeditor5-utils/commit/6ef1246))
* Introduced `fastDiff()` function. Closes [#235](https://github.com/ckeditor/ckeditor5-utils/issues/235). ([81fefc9](https://github.com/ckeditor/ckeditor5-utils/commit/81fefc9))

### Bug fixes

* Error should not be thrown when scrolling the viewport from within an iframe in a different domain. Closes [ckeditor/ckeditor5#930](https://github.com/ckeditor/ckeditor5/issues/930). ([ad4656e](https://github.com/ckeditor/ckeditor5-utils/commit/ad4656e))


## [10.0.0](https://github.com/ckeditor/ckeditor5-utils/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([3177252](https://github.com/ckeditor/ckeditor5-utils/commit/3177252))

### BREAKING CHANGES

* The license under which CKEditor&nbsp;5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-utils/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-utils/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-utils/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Features

* Introduce `bind().toMany()` binding chain in `ObservableMixin`. Closes [#224](https://github.com/ckeditor/ckeditor5-utils/issues/224). ([cfa7d0e](https://github.com/ckeditor/ckeditor5-utils/commit/cfa7d0e))
* Introduced skipping items when binding collections. Closes [#215](https://github.com/ckeditor/ckeditor5-utils/issues/215). Closes https://github.com/ckeditor/ckeditor5-ui/issues/92. ([6e0d063](https://github.com/ckeditor/ckeditor5-utils/commit/6e0d063))

### Bug fixes

* `Rect.getDomRangeRects()` should not throw if the provided DOM range starts in a text node. Closes [ckeditor/ckeditor5-ui#317](https://github.com/ckeditor/ckeditor5-ui/issues/317). ([bfa55e9](https://github.com/ckeditor/ckeditor5-utils/commit/bfa55e9))
* Bulletproofed `isDomNode()` helper when used in iframes. Removed `isWindow()` logic from the helper. Closes [#201](https://github.com/ckeditor/ckeditor5-utils/issues/201). ([84ccda2](https://github.com/ckeditor/ckeditor5-utils/commit/84ccda2))
* Long keystrokes should be handled properly by getEnvKeystrokeText on Mac. Added support for ⇧ and ⌥ modifiers. Closes [#206](https://github.com/ckeditor/ckeditor5-utils/issues/206). ([d8443e2](https://github.com/ckeditor/ckeditor5-utils/commit/d8443e2))

### Other changes

* `ObservableMixin#unbind()` should not throw if used for an attribute which is not bound. Closes [#5](https://github.com/ckeditor/ckeditor5-utils/issues/5). ([848a818](https://github.com/ckeditor/ckeditor5-utils/commit/848a818))
* Aligned behaviors of `EmitterMixin` methods responsible for adding end removing listeners. Closes [#144](https://github.com/ckeditor/ckeditor5-utils/issues/144). ([460d7f4](https://github.com/ckeditor/ckeditor5-utils/commit/460d7f4))

  The `emitter.on()` now has the same behavior as `emitter.listenTo( emitter )` as well as `emitter.off()` is the same as `emitter.stopListening( emitter )`. This made `emitter.stopListening()` correctly remove all listeners added in any way to it which prevents memory leaks.
* Aligned code to the new Translation Service ([ckeditor/ckeditor5#624](https://github.com/ckeditor/ckeditor5/issues/624)). ([a51767a](https://github.com/ckeditor/ckeditor5-utils/commit/a51767a))
* Introduced the `isText()` helper. Closes [#214](https://github.com/ckeditor/ckeditor5-utils/issues/214). ([a9a6bec](https://github.com/ckeditor/ckeditor5-utils/commit/a9a6bec))
* Renamed `env.mac` to `env.isMac`. Closes [#222](https://github.com/ckeditor/ckeditor5-utils/issues/222). ([dc6b226](https://github.com/ckeditor/ckeditor5-utils/commit/dc6b226))
* Renamed `isDomNode()` to `isNode()`. Closes [#219](https://github.com/ckeditor/ckeditor5-utils/issues/219). ([1823196](https://github.com/ckeditor/ckeditor5-utils/commit/1823196))

### BREAKING CHANGES

* Renamed `env.mac` to `env.isMac`.
* `isDomNode()` was renamed to `isNode()`.


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-utils/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Bug fixes

* Removed a period at the end of an error message because some browsers included the period in links to errors. Closes [#193](https://github.com/ckeditor/ckeditor5-utils/issues/193). ([fdebc2f](https://github.com/ckeditor/ckeditor5-utils/commit/fdebc2f))


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-utils/compare/v0.10.0...v1.0.0-alpha.1) (2017-10-03)

### Features

* Scrolling DOM utilities should support multi-window scenarios. Closes [#175](https://github.com/ckeditor/ckeditor5-utils/issues/175). ([a5c27ea](https://github.com/ckeditor/ckeditor5-utils/commit/a5c27ea))

### Other changes

* `CKEditorError#message`, `log.error()` and `log.warn()` will contain a link to the error documentation. Closes [#185](https://github.com/ckeditor/ckeditor5-utils/issues/185). ([b7a00c9](https://github.com/ckeditor/ckeditor5-utils/commit/b7a00c9))


## [0.10.0](https://github.com/ckeditor/ckeditor5-utils/compare/v0.9.1...v0.10.0) (2017-09-03)

### Bug fixes

* `FocusTracker` should remain in sync when multiple `blur` events are followed by the `focus` event. Closes [#159](https://github.com/ckeditor/ckeditor5-utils/issues/159). ([0ff1b34](https://github.com/ckeditor/ckeditor5-utils/commit/0ff1b34))

### Features

* `KeystrokeHandler` should support priorities and proper keystroke cancelling. Closes [#180](https://github.com/ckeditor/ckeditor5-utils/issues/180). ([14af24c](https://github.com/ckeditor/ckeditor5-utils/commit/14af24c))
* Added support for `'space'` key code in the `parseKeystroke()` helper. Closes [#169](https://github.com/ckeditor/ckeditor5-utils/issues/169). ([f86b1ad](https://github.com/ckeditor/ckeditor5-utils/commit/f86b1ad))
* Introduced `ObservableMixin#decorate()` and support for setting `EmitterMixin#fire()`'s return value by listeners. Closes [#162](https://github.com/ckeditor/ckeditor5-utils/issues/162). ([377c875](https://github.com/ckeditor/ckeditor5-utils/commit/377c875))
* Introduced a static `Rect.getDomRangeRects()` method for external usage. Closes [#168](https://github.com/ckeditor/ckeditor5-utils/issues/168). ([f67aea1](https://github.com/ckeditor/ckeditor5-utils/commit/f67aea1))

### Other changes

* The `getOptimalPosition()` utility should accept the target option defined as a function. Closes [#157](https://github.com/ckeditor/ckeditor5-utils/issues/157). ([d63abae](https://github.com/ckeditor/ckeditor5-utils/commit/d63abae))


## [0.9.1](https://github.com/ckeditor/ckeditor5-utils/compare/v0.9.0...v0.9.1) (2017-05-07)

### Bug fixes

* The `Rect` utility should work for collapsed DOM Ranges. Closes [#153](https://github.com/ckeditor/ckeditor5-utils/issues/153). ([92aff35](https://github.com/ckeditor/ckeditor5-utils/commit/92aff35))
* The `getOptimalPosition()` utility should consider limiter ancestors with CSS overflow. Closes [#148](https://github.com/ckeditor/ckeditor5-utils/issues/148). ([6bf1741](https://github.com/ckeditor/ckeditor5-utils/commit/6bf1741))


## [0.9.0](https://github.com/ckeditor/ckeditor5-utils/compare/v0.8.0...v0.9.0) (2017-04-05)

### Bug fixes

* The `getOptimalPosition()` utility should work fine when the parent element has a scroll. Closes [#139](https://github.com/ckeditor/ckeditor5-utils/issues/139). ([b878949](https://github.com/ckeditor/ckeditor5-utils/commit/b878949))

### Features

* `Collection.bindTo()` method now is not only available in the `ViewCollection` but in all `Collection`s. Closes [#125](https://github.com/ckeditor/ckeditor5-utils/issues/125). ([4e299be](https://github.com/ckeditor/ckeditor5-utils/commit/4e299be))
* Added the `first()` function. Closes [#130](https://github.com/ckeditor/ckeditor5-utils/issues/130). ([8ab07d2](https://github.com/ckeditor/ckeditor5-utils/commit/8ab07d2))
* Two–way data binding between `Collection` instances. Closes [#132](https://github.com/ckeditor/ckeditor5-utils/issues/132). ([6b79624](https://github.com/ckeditor/ckeditor5-utils/commit/6b79624))


## [0.8.0](https://github.com/ckeditor/ckeditor5-utils/compare/v0.7.0...v0.8.0) (2017-03-06)

### Features

* Added ability to provide default configurations to `Config` constructor. Closes [#126](https://github.com/ckeditor/ckeditor5/issues/126). ([16a2a31](https://github.com/ckeditor/ckeditor5-utils/commit/16a2a31))
