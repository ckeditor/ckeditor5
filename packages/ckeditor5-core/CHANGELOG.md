Changelog
=========

## [0.9.0](https://github.com/ckeditor/ckeditor5-core/compare/v0.8.1...v0.9.0) (2017-09-03)

### Bug fixes

* `EditingKeystrokeHandler` should prevent default action only for commands. Closes [#90](https://github.com/ckeditor/ckeditor5-core/issues/90). ([82ff39a](https://github.com/ckeditor/ckeditor5-core/commit/82ff39a))
* `ToggleAttributeCommand` should listen to reliable events in order to determine its state. Closes [#50](https://github.com/ckeditor/ckeditor5-core/issues/50). ([6816505](https://github.com/ckeditor/ckeditor5-core/commit/6816505))
* SVG icons should not define own fill if controlled by the styles. Closes [#79](https://github.com/ckeditor/ckeditor5-core/issues/79). ([fadf5ec](https://github.com/ckeditor/ckeditor5-core/commit/fadf5ec))

### Features

* `EditingKeystrokeHandler` should support priorities and proper cancelling. Closes [#101](https://github.com/ckeditor/ckeditor5-core/issues/101). ([c74b9a3](https://github.com/ckeditor/ckeditor5-core/commit/c74b9a3))
* `Editor#destroy()` will destroy all loaded plugins. Closes [#86](https://github.com/ckeditor/ckeditor5-core/issues/86). ([77e5217](https://github.com/ckeditor/ckeditor5-core/commit/77e5217))

  Added default implementation for `Plugin#destroy()`. Introduced `PluginCollection#destroy()` method which calls `Plugin#destroy()` for every loaded plugin.
* `PluginCollection` will warn if the user wants to load two or more plugins with the same name. Closes [#85](https://github.com/ckeditor/ckeditor5-core/issues/85). ([e00a282](https://github.com/ckeditor/ckeditor5-core/commit/e00a282))
* Introduced `Editor#isReadOnly` property which disables all commands and prevents from modifying the document. Closes [#96](https://github.com/ckeditor/ckeditor5-core/issues/96). Closes https://github.com/ckeditor/ckeditor5/issues/492. ([1ca5608](https://github.com/ckeditor/ckeditor5-core/commit/1ca5608))

### Other changes

* Bound `EditingController#isReadOnly` to the editor. Closes [#98](https://github.com/ckeditor/ckeditor5-core/issues/98). ([ec02906](https://github.com/ckeditor/ckeditor5-core/commit/ec02906))
* Cleaned up SVG icons. ([ffac7e7](https://github.com/ckeditor/ckeditor5-core/commit/ffac7e7))
* Introduced `PluginInterface`. A plugin doesn't need to inherit directly from the `Plugin` class, as long as it implements some minimal interface. See [#78](https://github.com/ckeditor/ckeditor5-core/issues/78). ([f476f34](https://github.com/ckeditor/ckeditor5-core/commit/f476f34))
* Removed `ToggleAttributeCommand` class as well as other helpers from the `core/command` namespace. Closes [#14](https://github.com/ckeditor/ckeditor5-core/issues/14). ([7c68581](https://github.com/ckeditor/ckeditor5-core/commit/7c68581))
* The command API has been redesigned. The `Command` methods are now public and consistent. Commands can be used in a standalone mode (without the editor). The `CommandCollection` was introduced and replaced the `Map` of commands used in `editor.commands`. Closes [#88](https://github.com/ckeditor/ckeditor5-core/issues/88). ([b76983b](https://github.com/ckeditor/ckeditor5-core/commit/b76983b))

    Besides changes mentioned in this point and in the "Breaking changes" section, other minor changes were done:

    * `Editor#execute()` now accepts multiple command arguments.
    * `Command#value` property was standardized.

### BREAKING CHANGES

* The `ToggleAttributeCommand` was moved to the `ckeditor5-basic-styles` package as `AttributeCommand` and the other command helpers to `ckeditor5-engine` as `Schema` methods.
* The `Command`'s protected `_doExecute()` and `_checkEnabled()` methods have been replaced by public `execute()` and `refresh()` methods.
* The `Command`'s `refreshState` event was removed and one should use `change:isEnabled` in order to control and override its state.
* The `core/command/command` module has been moved to the root directory (so the `Command` class is `core/command~Command` now).
* The `Command#refresh()` method is now automatically called on `editor.document#changesDone`.
* The `editor.commands` map was replaced by a `CommandCollection` instance so `editor.commands.set()` calls need to be replaced with `editor.commands.add()`.

### NOTE

* Plugin naming convention has changed.


## [0.8.1](https://github.com/ckeditor/ckeditor5-core/compare/v0.8.0...v0.8.1) (2017-05-07)

### Other changes

* Updated translations. ([993596a](https://github.com/ckeditor/ckeditor5-core/commit/993596a))


## [0.8.0](https://github.com/ckeditor/ckeditor5-core/compare/v0.7.0...v0.8.0) (2017-04-05)

### Bug fixes

* This time, we introduced support for `config.removePlugins` for real (we said that we did this in the previous release, but we didn't). Closes [#49](https://github.com/ckeditor/ckeditor5-core/issues/49). ([5834fed](https://github.com/ckeditor/ckeditor5-core/commit/5834fed))

### Features

* Added support for building plugins and default configs into `Editor` classes. Closes [#67](https://github.com/ckeditor/ckeditor5-core/issues/67). ([a1fa64f](https://github.com/ckeditor/ckeditor5-core/commit/a1fa64f))

### Other changes

* Updated translations. ([1296b03](https://github.com/ckeditor/ckeditor5-core/commit/1296b03))


## [0.7.0](https://github.com/ckeditor/ckeditor5-core/compare/v0.6.0...v0.7.0) (2017-03-06)

### Features

* Added support for loading plugins by name and the `config.removePlugins` option. Closes [#49](https://github.com/ckeditor/ckeditor5/issues/49). ([dfee52e](https://github.com/ckeditor/ckeditor5-core/commit/dfee52e))
* Added the "low-vision" icon. Closes [#68](https://github.com/ckeditor/ckeditor5/issues/68). ([4c3d306](https://github.com/ckeditor/ckeditor5-core/commit/4c3d306))

### Other changes

* Uploaded translations. ([a39e84b](https://github.com/ckeditor/ckeditor5-core/commit/a39e84b))
