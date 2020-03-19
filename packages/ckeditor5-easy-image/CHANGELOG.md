Changelog
=========

## [18.0.0](https://github.com/ckeditor/ckeditor5-easy-image/compare/v17.0.0...v18.0.0) (2020-03-19)

Internal changes only (updated dependencies, documentation, etc.).


## [17.0.0](https://github.com/ckeditor/ckeditor5-easy-image/compare/v16.0.0...v17.0.0) (2020-02-19)

Internal changes only (updated dependencies, documentation, etc.).


## [16.0.0](https://github.com/ckeditor/ckeditor5-easy-image/compare/v15.0.0...v16.0.0) (2019-12-04)

Internal changes only (updated dependencies, documentation, etc.).


## [15.0.0](https://github.com/ckeditor/ckeditor5-easy-image/compare/v11.0.5...v15.0.0) (2019-10-23)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.5](https://github.com/ckeditor/ckeditor5-easy-image/compare/v11.0.4...v11.0.5) (2019-08-26)

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([d403f73](https://github.com/ckeditor/ckeditor5-easy-image/commit/d403f73))


## [11.0.4](https://github.com/ckeditor/ckeditor5-easy-image/compare/v11.0.3...v11.0.4) (2019-07-10)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.3](https://github.com/ckeditor/ckeditor5-easy-image/compare/v11.0.2...v11.0.3) (2019-07-04)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.2](https://github.com/ckeditor/ckeditor5-easy-image/compare/v11.0.1...v11.0.2) (2019-06-05)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.1](https://github.com/ckeditor/ckeditor5-easy-image/compare/v11.0.0...v11.0.1) (2019-04-10)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.0](https://github.com/ckeditor/ckeditor5-easy-image/compare/v10.0.4...v11.0.0) (2019-02-28)

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))


## [10.0.4](https://github.com/ckeditor/ckeditor5-easy-image/compare/v10.0.3...v10.0.4) (2018-12-05)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.3](https://github.com/ckeditor/ckeditor5-easy-image/compare/v10.0.2...v10.0.3) (2018-10-08)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.2](https://github.com/ckeditor/ckeditor5-easy-image/compare/v10.0.1...v10.0.2) (2018-07-18)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.1](https://github.com/ckeditor/ckeditor5-easy-image/compare/v10.0.0...v10.0.1) (2018-06-21)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.0](https://github.com/ckeditor/ckeditor5-easy-image/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([8371e22](https://github.com/ckeditor/ckeditor5-easy-image/commit/8371e22))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-easy-image/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-easy-image/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

### Other changes

* Aligned to package names changes: `@ckeditor/ckeditor5-cloudservices` was renamed to `@ckeditor/ckeditor5-cloud-services` and `@ckeditor/ckeditor-cloudservices-core` to `@ckeditor/ckeditor-cloud-services-core`. ([ce3abaf](https://github.com/ckeditor/ckeditor5-easy-image/commit/ce3abaf))


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-easy-image/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-easy-image/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Bug fixes

* Prevented `UploadGateway` from being created when `cloudServices#tokenUrl` is not provided. Closes [#9](https://github.com/ckeditor/ckeditor5-easy-image/issues/9). ([cdc6662](https://github.com/ckeditor/ckeditor5-easy-image/commit/cdc6662))

### Other changes

* Aligned code to the new `CloudeServices` API and used the `ckeditor5-cloudservices` package. Closes [#7](https://github.com/ckeditor/ckeditor5-easy-image/issues/7). ([ce800f7](https://github.com/ckeditor/ckeditor5-easy-image/commit/ce800f7))

  The plugin will now automatically refresh the token when it expired.

### BREAKING CHANGES

* The Easy Image plugin does not use `config.cloudServices.token` anymore. The new option name is `config.cloudServices.tokenUrl` with a URL to the token server.


## 1.0.0-alpha.1 (2017-10-03)

Internal changes only (updated dependencies, documentation, etc.).
