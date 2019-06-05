Changelog
=========

## [11.0.0](https://github.com/ckeditor/ckeditor5-mention/compare/v10.0.0...v11.0.0) (2019-06-05)

### Bug fixes

* Mention can now also be preceded by a bracket, quote or soft break. Closes [#44](https://github.com/ckeditor/ckeditor5-mention/issues/44). ([86262d1](https://github.com/ckeditor/ckeditor5-mention/commit/86262d1))
* Mention plugin should not throw errors when another `ContextualBalloon` is already visible. Closes [#67](https://github.com/ckeditor/ckeditor5-mention/issues/67). ([de9ee71](https://github.com/ckeditor/ckeditor5-mention/commit/de9ee71))
* The mention panel should have precendence over all other panels. Closes [#74](https://github.com/ckeditor/ckeditor5-mention/issues/74). ([3e8a84c](https://github.com/ckeditor/ckeditor5-mention/commit/3e8a84c))
* The Mention UI will use `ContextualBalloon` plugin to display to prevent balloon collisions with other features. Closes [#27](https://github.com/ckeditor/ckeditor5-mention/issues/27). ([9ae7f30](https://github.com/ckeditor/ckeditor5-mention/commit/9ae7f30))

### Other changes

* Remove unknown stack option from ContextualBalloon.add() method call. ([b6a50cf](https://github.com/ckeditor/ckeditor5-mention/commit/b6a50cf))
* Use model.insertContent instead of model.Writer.insertText. Closes [#69](https://github.com/ckeditor/ckeditor5-mention/issues/69). ([ee973bb](https://github.com/ckeditor/ckeditor5-mention/commit/ee973bb))

### BREAKING CHANGES

* The `MentionUI#panelView` property is removed. The Mention feature now uses the `ContextualBalloon` plugin.


## [10.0.0](https://github.com/ckeditor/ckeditor5-mention/tree/v10.0.0) (2019-04-10)

The initial release.
