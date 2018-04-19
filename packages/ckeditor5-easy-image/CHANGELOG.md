Changelog
=========

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
