Changelog
=========

All changes in the package are documented in the main repository. See: https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md.

Changes for the past releases are available below.

## [19.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/compare/v18.0.0...v19.0.0) (April 29, 2020)

Internal changes only (updated dependencies, documentation, etc.).


## [18.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/compare/v17.0.0...v18.0.0) (March 19, 2020)

### Features

* Added support for basic list indentation when pasting from Microsoft Word. Closes [ckeditor/ckeditor5#2518](https://github.com/ckeditor/ckeditor5/issues/2518). ([58ae829](https://github.com/ckeditor/ckeditor5-paste-from-office/commit/58ae829))

  Thanks to [gjhenrique](https://github.com/gjhenrique) for the contribution!


## [17.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/compare/v16.0.0...v17.0.0) (February 19, 2020)

Internal changes only (updated dependencies, documentation, etc.).


## [16.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/compare/v15.0.0...v16.0.0) (December 4, 2019)

### Bug fixes

* Fixed handling `mso-list:normal`. Closes [ckeditor/ckeditor5#5712](https://github.com/ckeditor/ckeditor5/issues/5712). ([2054e69](https://github.com/ckeditor/ckeditor5-paste-from-office/commit/2054e69))

  Thanks [@bendemboski](https://github.com/bendemboski)!
* Fixed various issues with oddly formatted space run spans. ([2cd7b0f](https://github.com/ckeditor/ckeditor5-paste-from-office/commit/2cd7b0f))


## [15.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/compare/v11.1.0...v15.0.0) (October 23, 2019)

### Other changes

* Remove the `fixListIndentation()` filter in favor of improved list converters fix. See [ckeditor/ckeditor5-list#115](https://github.com/ckeditor/ckeditor5-list/issues/115). ([d594038](https://github.com/ckeditor/ckeditor5-paste-from-office/commit/d594038))


## [11.1.0](https://github.com/ckeditor/ckeditor5-paste-from-office/compare/v11.0.4...v11.1.0) (August 26, 2019)

### Features

* Prevent making entire content pasted from Google Docs bold. Closes [#61](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/61). ([8102de3](https://github.com/ckeditor/ckeditor5-paste-from-office/commit/8102de3))
* Provide support for pasting lists from Google Docs. Closes [#69](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/69). ([6ad2a62](https://github.com/ckeditor/ckeditor5-paste-from-office/commit/6ad2a62))

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([22edb90](https://github.com/ckeditor/ckeditor5-paste-from-office/commit/22edb90))


## [11.0.4](https://github.com/ckeditor/ckeditor5-paste-from-office/compare/v11.0.3...v11.0.4) (July 10, 2019)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.3](https://github.com/ckeditor/ckeditor5-paste-from-office/compare/v11.0.2...v11.0.3) (July 4, 2019)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.2](https://github.com/ckeditor/ckeditor5-paste-from-office/compare/v11.0.1...v11.0.2) (June 6, 2019)

### Other changes

* Loosen a dependency of a clipboard plugin in the paste from Office plugin so that it can be overridden. Closes [#56](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/56). ([561f22b](https://github.com/ckeditor/ckeditor5-paste-from-office/commit/561f22b))


## [11.0.1](https://github.com/ckeditor/ckeditor5-paste-from-office/compare/v11.0.0...v11.0.1) (April 4, 2019)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/compare/v10.0.0...v11.0.0) (February 28, 2019)

### Bug fixes

* Ensured correct lists ordering for separate list items with the same `mso-list` id. Closes [#43](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/43). ([4ebc363](https://github.com/ckeditor/ckeditor5-paste-from-office/commit/4ebc363))
* Handle "spacerun spans" with mixed whitespaces. Closes [#49](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/49). Closes [#50](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/50). ([7fb132f](https://github.com/ckeditor/ckeditor5-paste-from-office/commit/7fb132f))

  Huge thanks to [Matt Kobs](https://github.com/kobsy) for this contribution!

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))


## [10.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/tree/v10.0.0) (December 5, 2018)

Initial implementation of the Paste from Office feature.
