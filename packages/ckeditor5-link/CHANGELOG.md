Changelog
=========

## [11.0.0](https://github.com/ckeditor/ckeditor5-link/compare/v10.1.0...v11.0.0) (2019-02-28)

### Bug fixes

* Improved the focus management when removing the link form from the DOM. Closes [ckeditor/ckeditor5#1501](https://github.com/ckeditor/ckeditor5/issues/1501). ([9dd756c](https://github.com/ckeditor/ckeditor5-link/commit/9dd756c))
* Fixed memory leaks during editor initialization and destruction (see [ckeditor/ckeditor5#1341](https://github.com/ckeditor/ckeditor5/issues/1341)). ([bb24b88](https://github.com/ckeditor/ckeditor5-link/commit/bb24b88))

### Other changes

* Updated translations. ([012557b](https://github.com/ckeditor/ckeditor5-link/commit/012557b)) ([b2990a9](https://github.com/ckeditor/ckeditor5-link/commit/b2990a9)) ([f8573c2](https://github.com/ckeditor/ckeditor5-link/commit/f8573c2))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))


## [10.1.0](https://github.com/ckeditor/ckeditor5-link/compare/v10.0.4...v10.1.0) (2018-12-05)

### Features

* Improved responsiveness of the form and actions views in narrow viewports (see [ckeditor/ckeditor5#416](https://github.com/ckeditor/ckeditor5/issues/416)). ([74dbe69](https://github.com/ckeditor/ckeditor5-link/commit/74dbe69))

### Other changes

* Improved SVG icons size. See [ckeditor/ckeditor5-theme-lark#206](https://github.com/ckeditor/ckeditor5-theme-lark/issues/206). ([5b12f81](https://github.com/ckeditor/ckeditor5-link/commit/5b12f81))
* Updated translations. ([9d7b042](https://github.com/ckeditor/ckeditor5-link/commit/9d7b042)) ([6ac7e41](https://github.com/ckeditor/ckeditor5-link/commit/6ac7e41))


## [10.0.4](https://github.com/ckeditor/ckeditor5-link/compare/v10.0.3...v10.0.4) (2018-10-08)

### Other changes

* The link button will be active when the selection is placed inside a link. Closes [#173](https://github.com/ckeditor/ckeditor5-link/issues/173). ([c9e4bc3](https://github.com/ckeditor/ckeditor5-link/commit/c9e4bc3))
* Updated translations. ([6d0ce97](https://github.com/ckeditor/ckeditor5-link/commit/6d0ce97))


## [10.0.3](https://github.com/ckeditor/ckeditor5-link/compare/v10.0.2...v10.0.3) (2018-07-18)

### Other changes

* Updated translations. ([e1e2f56](https://github.com/ckeditor/ckeditor5-link/commit/e1e2f56))


## [10.0.2](https://github.com/ckeditor/ckeditor5-link/compare/v10.0.1...v10.0.2) (2018-06-21)

### Other changes

* Updated translations.


## [10.0.1](https://github.com/ckeditor/ckeditor5-link/compare/v10.0.0...v10.0.1) (2018-05-22)

### Bug fixes

* Fixed a cross-site scripting (XSS) vulnerability which allowed remote attackers to inject arbitrary web script through a crafted href attribute of a link (A) element. [CVE-2018-11093](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-11093). ([8cb782e](https://github.com/ckeditor/ckeditor5-link/commit/8cb782e))

  This issue was reported indepdentently by [Toan Chi Nguyen](https://www.linkedin.com/in/toan-nguyen-chi/) from [Techlab Corporation](https://www.techlabcorp.com/) and [Michal Bazyli](https://www.linkedin.com/in/michal-bazyli-6a3111144/). Thank you!


## [10.0.0](https://github.com/ckeditor/ckeditor5-link/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([32a80fb](https://github.com/ckeditor/ckeditor5-link/commit/32a80fb))
* Updated translations. ([c6d5333](https://github.com/ckeditor/ckeditor5-link/commit/c6d5333))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-link/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

### Other changes

* Updated translations. ([f6ab11a](https://github.com/ckeditor/ckeditor5-link/commit/f6ab11a))


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-link/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

### Features

* Made the link form buttons thicker with a fill color and no background (see [ckeditor/ckeditor5#810](https://github.com/ckeditor/ckeditor5/issues/810)). ([45292f1](https://github.com/ckeditor/ckeditor5-link/commit/45292f1))
* The <kbd>Ctrl</kbd>+<kbd>K</kbd> keystroke should open link URL editing dialog. Closes [#181](https://github.com/ckeditor/ckeditor5-link/issues/181). ([56047b5](https://github.com/ckeditor/ckeditor5-link/commit/56047b5))

### Bug fixes

* The selected link should be highlighted using the class instead of a marker. Closes [#180](https://github.com/ckeditor/ckeditor5-link/issues/180). Closes [#176](https://github.com/ckeditor/ckeditor5-link/issues/176). Closes [ckeditor/ckeditor5#888](https://github.com/ckeditor/ckeditor5/issues/888). ([c75c4ca](https://github.com/ckeditor/ckeditor5-link/commit/c75c4ca))

### Other changes

* Increased the specificity of CSS rules. Introduced the `.ck` class for editor UI components (see: [ckeditor/ckeditor5#494](https://github.com/ckeditor/ckeditor5/issues/494)). ([e66f921](https://github.com/ckeditor/ckeditor5-link/commit/e66f921))
* Used `.ck-button_sav`e and `_cancel` CSS classes to make the link form view buttons colorful (see [ckeditor/ckeditor5-image#187](https://github.com/ckeditor/ckeditor5-image/issues/187)). ([a5eebdb](https://github.com/ckeditor/ckeditor5-link/commit/a5eebdb))


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-link/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Features

* Added two-step caret movement for links. Closes [#72](https://github.com/ckeditor/ckeditor5-link/issues/72). ([985bb40](https://github.com/ckeditor/ckeditor5-link/commit/985bb40))
* Implemented a 2–step link UI with a refreshed look&feel (see [ckeditor/ckeditor5#645](https://github.com/ckeditor/ckeditor5/issues/645)). Closes [#31](https://github.com/ckeditor/ckeditor5-link/issues/31). ([6baee95](https://github.com/ckeditor/ckeditor5-link/commit/6baee95))

### Bug fixes

* Link feature should not create empty text nodes with `linkHref` attribute. Closes [#169](https://github.com/ckeditor/ckeditor5-link/issues/169). ([0641978](https://github.com/ckeditor/ckeditor5-link/commit/0641978))

### Other changes

* Aligned feature class naming to the new scheme. ([5d8e67d](https://github.com/ckeditor/ckeditor5-link/commit/5d8e67d))
* Migrated package styles to PostCSS. Moved visual styles to `@ckeditor/ckeditor5-theme-lark` (see [ckeditor/ckeditor5-ui#144](https://github.com/ckeditor/ckeditor5-ui/issues/144)). ([f16d263](https://github.com/ckeditor/ckeditor5-link/commit/f16d263))
* Removed `LinkElement`. We should be using custom properties instead. Closes [#162](https://github.com/ckeditor/ckeditor5-link/issues/162). ([3785e50](https://github.com/ckeditor/ckeditor5-link/commit/3785e50))
* Updated translations. ([d285ad3](https://github.com/ckeditor/ckeditor5-link/commit/d285ad3))

### BREAKING CHANGES

* The structure of the link UI has changed dramatically. Some pieces of the `LinkFormView` belong now to the `LinkActionsView` class. The CSS classes have also changed along with component templates.


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-link/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Other changes

* Updated translations. ([ea343cd](https://github.com/ckeditor/ckeditor5-link/commit/ea343cd))
* Aligned UI library usage to the [changes in the UI framework](https://github.com/ckeditor/ckeditor5-ui/pull/332).


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-link/compare/v0.8.0...v1.0.0-alpha.1) (2017-10-03)

### Bug fixes

* Prevented default browser actions on <kbd>Ctrl</kbd>+<kbd>K</kbd> (which should move focus to "URL" input in the link balloon). Closes [#153](https://github.com/ckeditor/ckeditor5-link/issues/153). Closes [#154](https://github.com/ckeditor/ckeditor5-link/issues/154). ([5360fce](https://github.com/ckeditor/ckeditor5-link/commit/5360fce))
* The URL input should span the width of the balloon. Closes [#145](https://github.com/ckeditor/ckeditor5-link/issues/145). ([05b3bf4](https://github.com/ckeditor/ckeditor5-link/commit/05b3bf4))


## [0.8.0](https://github.com/ckeditor/ckeditor5-link/compare/v0.7.0...v0.8.0) (2017-09-03)

### Bug fixes

* `<a>` elements without the `href` attribute should not be picked up by the converter when loading data or pasting. Closes [#139](https://github.com/ckeditor/ckeditor5-link/issues/139). ([80e4c03](https://github.com/ckeditor/ckeditor5-link/commit/80e4c03))
* `LinkCommand` and `UnlinkCommand` should update their state upon editor load. Closes [#93](https://github.com/ckeditor/ckeditor5-link/issues/93). ([1784eb6](https://github.com/ckeditor/ckeditor5-link/commit/1784eb6))
* It should be possible to paste links. See https://github.com/ckeditor/ckeditor5/issues/477. ([4f24219](https://github.com/ckeditor/ckeditor5-link/commit/4f24219))
* Keyboard listener should check if the command is enabled before opening the balloon. Closes [#128](https://github.com/ckeditor/ckeditor5-link/issues/128). ([be4b9eb](https://github.com/ckeditor/ckeditor5-link/commit/be4b9eb))
* Link should have a higher priority than all other attribute elements. Closes [#121](https://github.com/ckeditor/ckeditor5-link/issues/121). ([9dc8973](https://github.com/ckeditor/ckeditor5-link/commit/9dc8973))
* Linking an entire image should not be possible. Closes [#85](https://github.com/ckeditor/ckeditor5-link/issues/85). ([1a4e110](https://github.com/ckeditor/ckeditor5-link/commit/1a4e110))
* The editing UI should show up when the selection encloses a link. Closes [#23](https://github.com/ckeditor/ckeditor5-link/issues/23). ([ae43103](https://github.com/ckeditor/ckeditor5-link/commit/ae43103))
* The link feature's keystrokes should properly integrate with the list feature. Improved balloon positioning. Closes [#146](https://github.com/ckeditor/ckeditor5-link/issues/146). ([4d808b7](https://github.com/ckeditor/ckeditor5-link/commit/4d808b7))
* The URL field's value should be updated each time the form shows up. Closes [#78](https://github.com/ckeditor/ckeditor5-link/issues/78). ([3b702aa](https://github.com/ckeditor/ckeditor5-link/commit/3b702aa))
* Then unlink button in the link balloon should be visible when a link is partially selected. Closes [#141](https://github.com/ckeditor/ckeditor5-link/issues/141). ([2a4e9d8](https://github.com/ckeditor/ckeditor5-link/commit/2a4e9d8))
* URL input value should not be `'undefined'` when no link is selected. Closes [#123](https://github.com/ckeditor/ckeditor5-link/issues/123). ([22893d3](https://github.com/ckeditor/ckeditor5-link/commit/22893d3))

### Features

* `LinkFormView` controls should enter the read-only mode when `LinkCommand` and `UnlinkCommand` are disabled. Closes [#135](https://github.com/ckeditor/ckeditor5-link/issues/135). ([50da835](https://github.com/ckeditor/ckeditor5-link/commit/50da835))
* URL input field should provide a placeholder. Closes [#109](https://github.com/ckeditor/ckeditor5-link/issues/109). ([6d18c55](https://github.com/ckeditor/ckeditor5-link/commit/6d18c55))

### Other changes

* Aligned the implementation to the new Command API (see https://github.com/ckeditor/ckeditor5-core/issues/88). ([919b497](https://github.com/ckeditor/ckeditor5-link/commit/919b497))
* Cleaning up svg icons. ([af73903](https://github.com/ckeditor/ckeditor5-link/commit/af73903))
* Removed the "Unlink" button. Closes [#52](https://github.com/ckeditor/ckeditor5-link/issues/52). ([3b7fda7](https://github.com/ckeditor/ckeditor5-link/commit/3b7fda7))

  See https://github.com/ckeditor/ckeditor5-link/issues/31#issuecomment-316992952 and https://github.com/ckeditor/ckeditor5-link/issues/149 for plans how unlinking will be exposed in the future.

### BREAKING CHANGES

* The `unlink` UI component was removed from the component factory.
* The command API has been changed.


## [0.7.0](https://github.com/ckeditor/ckeditor5-link/compare/v0.6.0...v0.6.1) (2017-05-07)

### Bug fixes

* `Esc` key should close the link panel even if none of the `LinkFormView` fields is focused. Closes [#90](https://github.com/ckeditor/ckeditor5-link/issues/90). ([866fa49](https://github.com/ckeditor/ckeditor5-link/commit/866fa49))
* The link balloon should hide the "Unlink" button when creating a link. Closes [#53](https://github.com/ckeditor/ckeditor5-link/issues/53). ([686e625](https://github.com/ckeditor/ckeditor5-link/commit/686e625))
* The link balloon should update its position upon external document changes. Closes [#113](https://github.com/ckeditor/ckeditor5-link/issues/113). ([18a5b90](https://github.com/ckeditor/ckeditor5-link/commit/18a5b90))
* The link plugin should manage focus when the balloon is open. Made Link plugins `_showPanel()` and `_hidePanel()` methods protected. Closes [#95](https://github.com/ckeditor/ckeditor5-link/issues/95). Closes [#94](https://github.com/ckeditor/ckeditor5-link/issues/94). ([5a83b70](https://github.com/ckeditor/ckeditor5-link/commit/5a83b70))
* Link should not be allowed directly in the root element. Closes [#97](https://github.com/ckeditor/ckeditor5-link/issues/97). ([81d4ba5](https://github.com/ckeditor/ckeditor5-link/commit/81d4ba5))

### Other changes

* Integrated the link plugin with the `ContextualBalloon` plugin. Closes [#91](https://github.com/ckeditor/ckeditor5-link/issues/91). ([26f148e](https://github.com/ckeditor/ckeditor5-link/commit/26f148e))
* Updated translations. ([7a35617](https://github.com/ckeditor/ckeditor5-link/commit/7a35617))


## [0.6.0](https://github.com/ckeditor/ckeditor5-link/compare/v0.5.1...v0.6.0) (2017-04-05)

### Features

* Named existing plugin(s). ([ae8fcd7](https://github.com/ckeditor/ckeditor5-link/commit/ae8fcd7))

### Other changes

* Fixed import paths after [refactoring in ckeditor5-ui](https://github.com/ckeditor/ckeditor5-ui/pull/156). Closes [#83](https://github.com/ckeditor/ckeditor5-link/issues/83). ([b235415](https://github.com/ckeditor/ckeditor5-link/commit/b235415))
* Updated translations. ([0589bf0](https://github.com/ckeditor/ckeditor5-link/commit/0589bf0))


## [0.5.1](https://github.com/ckeditor/ckeditor5-link/compare/v0.5.0...v0.5.1) (2017-03-06)

### Bug fixes

* The "Save" button label should be localizable. ([eb78861](https://github.com/ckeditor/ckeditor5-link/commit/eb78861))

### Other changes

* Updated translations. ([7a0a8d3](https://github.com/ckeditor/ckeditor5-link/commit/7a0a8d3))
