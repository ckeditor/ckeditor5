Changelog
=========

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
