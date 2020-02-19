Changelog
=========

## [17.0.0](https://github.com/ckeditor/ckeditor5-watchdog/compare/v16.0.0...v17.0.0) (2020-02-19)

### MAJOR BREAKING CHANGES

* The `Watchdog` class was renamed to `EditorWatchdog` and is available in `src/editorwatchdog.js`.
* The `EditorWatchdog.for()` method was removed in favor of the constructor.
* The `EditorWatchdog#constructor()` API changed, now the `EditorWatchdog` constructor accepts the editor class as the first argument and the watchdog configuration as the second argument. The `EditorWatchdog` editor creator now defaults to `( sourceElementOrData, config ) => Editor.create( sourceElementOrData, config )`.

### Features

* Introduced `ContextWatchdog` which is a watchdog for `Context`. Closes [ckeditor/ckeditor5#6079](https://github.com/ckeditor/ckeditor5/issues/6079). Closes [ckeditor/ckeditor5#6042](https://github.com/ckeditor/ckeditor5/issues/6042). Closes [ckeditor/ckeditor5#4696](https://github.com/ckeditor/ckeditor5/issues/4696). ([76c4938](https://github.com/ckeditor/ckeditor5-watchdog/commit/76c4938))


## [16.0.0](https://github.com/ckeditor/ckeditor5-watchdog/compare/v15.0.0...v16.0.0) (2019-12-04)

### Bug fixes

* Only instances of the `Error` class will be handled by `Watchdog`. Closes [ckeditor/ckeditor5#5678](https://github.com/ckeditor/ckeditor5/issues/5678). ([3f24a2e](https://github.com/ckeditor/ckeditor5-watchdog/commit/3f24a2e))


## [15.0.0](https://github.com/ckeditor/ckeditor5-watchdog/compare/v11.0.0...v15.0.0) (2019-10-23)

### Other changes

* Made the Watchdog#setDestructor() method optional and default to editor => editor.destroy(). Closes [#21](https://github.com/ckeditor/ckeditor5-watchdog/issues/21). ([5a9dc0c](https://github.com/ckeditor/ckeditor5-watchdog/commit/5a9dc0c))


## [11.0.0](https://github.com/ckeditor/ckeditor5-watchdog/compare/v10.0.1...v11.0.0) (2019-08-26)

### Features

* Added support for multi-root editors. Closes [#22](https://github.com/ckeditor/ckeditor5-watchdog/issues/22). ([692955e](https://github.com/ckeditor/ckeditor5-watchdog/commit/692955e))
* Added unhandled promise rejection error handling. Fixed objects in the `crashed` array. Closes [#3](https://github.com/ckeditor/ckeditor5-watchdog/issues/3). ([1a47364](https://github.com/ckeditor/ckeditor5-watchdog/commit/1a47364))
* Introduced the observable `Watchdog#state` property. Introduced the `minimumNonErrorTimePeriod` configuration which defaults to 5 seconds and will be used to prevent infinite restart loops while allowing a larger number of random crashes as long as they do not happen too often. Renamed `waitingTime` configuration option to `saveInterval`. Closes [#7](https://github.com/ckeditor/ckeditor5-watchdog/issues/7). Closes [#15](https://github.com/ckeditor/ckeditor5-watchdog/issues/15). ([5bdbfe5](https://github.com/ckeditor/ckeditor5-watchdog/commit/5bdbfe5))

### Bug fixes

* The editor data will be saved correctly after the `destroy()` method is called. Added the protected `Watchdog#_now()` method that allows for time-based testing of the error handling mechanism. Closes [#17](https://github.com/ckeditor/ckeditor5-watchdog/issues/17). Closes [#19](https://github.com/ckeditor/ckeditor5-watchdog/issues/19). ([a54db15](https://github.com/ckeditor/ckeditor5-watchdog/commit/a54db15))

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([741594a](https://github.com/ckeditor/ckeditor5-watchdog/commit/741594a))
* Made the `Watchdog#restart()` method private. Changed the signatures of `Watchdog#create()` and `Watchdog#destroy()`, so now these methods will return empty promises. Closes [#13](https://github.com/ckeditor/ckeditor5-watchdog/issues/13). ([69aef8b](https://github.com/ckeditor/ckeditor5-watchdog/commit/69aef8b))

### BREAKING CHANGES

* Renamed `waitingTime` configuration option to `saveInterval`.
* `Watchdog#restart()` is no longer public.


## [10.0.1](https://github.com/ckeditor/ckeditor5-watchdog/compare/v10.0.0...v10.0.1) (2019-07-10)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.0](https://github.com/ckeditor/ckeditor5-watchdog/tree/v10.0.0) (2019-07-04)

The initial watchdog feature implementation.
