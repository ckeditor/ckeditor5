Changelog
=========

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
