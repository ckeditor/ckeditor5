Changelog
=========

All changes in the package are documented in the main repository. See: https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md.

Changes for the past releases are available below.

## [19.0.0](https://github.com/ckeditor/ckeditor5-easy-image/compare/v18.0.0...v19.0.0) (April 29, 2020)

Internal changes only (updated dependencies, documentation, etc.).


## [18.0.0](https://github.com/ckeditor/ckeditor5-easy-image/compare/v17.0.0...v18.0.0) (March 19, 2020)

Internal changes only (updated dependencies, documentation, etc.).


## [17.0.0](https://github.com/ckeditor/ckeditor5-easy-image/compare/v16.0.0...v17.0.0) (February 19, 2020)

Internal changes only (updated dependencies, documentation, etc.).


## [16.0.0](https://github.com/ckeditor/ckeditor5-easy-image/compare/v15.0.0...v16.0.0) (December 4, 2019)

Internal changes only (updated dependencies, documentation, etc.).


## [15.0.0](https://github.com/ckeditor/ckeditor5-easy-image/compare/v11.0.5...v15.0.0) (October 23, 2019)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.5](https://github.com/ckeditor/ckeditor5-easy-image/compare/v11.0.4...v11.0.5) (August 26, 2019)

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([d403f73](https://github.com/ckeditor/ckeditor5-easy-image/commit/d403f73))


## [11.0.4](https://github.com/ckeditor/ckeditor5-easy-image/compare/v11.0.3...v11.0.4) (July 10, 2019)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.3](https://github.com/ckeditor/ckeditor5-easy-image/compare/v11.0.2...v11.0.3) (July 4, 2019)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.2](https://github.com/ckeditor/ckeditor5-easy-image/compare/v11.0.1...v11.0.2) (June 6, 2019)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.1](https://github.com/ckeditor/ckeditor5-easy-image/compare/v11.0.0...v11.0.1) (April 4, 2019)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.0](https://github.com/ckeditor/ckeditor5-easy-image/compare/v10.0.4...v11.0.0) (February 28, 2019)

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))


## [10.0.4](https://github.com/ckeditor/ckeditor5-easy-image/compare/v10.0.3...v10.0.4) (December 5, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.3](https://github.com/ckeditor/ckeditor5-easy-image/compare/v10.0.2...v10.0.3) (October 8, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.2](https://github.com/ckeditor/ckeditor5-easy-image/compare/v10.0.1...v10.0.2) (July 18, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.1](https://github.com/ckeditor/ckeditor5-easy-image/compare/v10.0.0...v10.0.1) (June 21, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.0](https://github.com/ckeditor/ckeditor5-easy-image/compare/v1.0.0-beta.4...v10.0.0) (April 25, 2018)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([8371e22](https://github.com/ckeditor/ckeditor5-easy-image/commit/8371e22))

### BREAKING CHANGES

* The license under which CKEditor&nbsp;5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-easy-image/compare/v1.0.0-beta.2...v1.0.0-beta.4) (April 19, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-easy-image/compare/v1.0.0-beta.1...v1.0.0-beta.2) (April 10, 2018)

### Other changes

* Aligned to package names changes: `@ckeditor/ckeditor5-cloudservices` was renamed to `@ckeditor/ckeditor5-cloud-services` and `@ckeditor/ckeditor-cloudservices-core` to `@ckeditor/ckeditor-cloud-services-core`. ([ce3abaf](https://github.com/ckeditor/ckeditor5-easy-image/commit/ce3abaf))


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-easy-image/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (March 15, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-easy-image/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (November 14, 2017)

### Bug fixes

* Prevented `UploadGateway` from being created when `cloudServices#tokenUrl` is not provided. Closes [#9](https://github.com/ckeditor/ckeditor5-easy-image/issues/9). ([cdc6662](https://github.com/ckeditor/ckeditor5-easy-image/commit/cdc6662))

### Other changes

* Aligned code to the new `CloudeServices` API and used the `ckeditor5-cloudservices` package. Closes [#7](https://github.com/ckeditor/ckeditor5-easy-image/issues/7). ([ce800f7](https://github.com/ckeditor/ckeditor5-easy-image/commit/ce800f7))

  The plugin will now automatically refresh the token when it expired.

### BREAKING CHANGES

* The Easy Image plugin does not use `config.cloudServices.token` anymore. The new option name is `config.cloudServices.tokenUrl` with a URL to the token server.


## 1.0.0-alpha.1 (October 3, 2017)

Internal changes only (updated dependencies, documentation, etc.).
