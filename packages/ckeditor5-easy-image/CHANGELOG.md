Changelog
=========

## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-easy-image/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Bug fixes

* Prevented UploadGateway from being created when cloudServices#tokenUrl is not provided. Closes [#9](https://github.com/ckeditor/ckeditor5-easy-image/issues/9). ([cdc6662](https://github.com/ckeditor/ckeditor5-easy-image/commit/cdc6662))

### Other changes

* Aligned code to the new CloudeServices API and use `ckeditor5-cloudservices` package. Closes [#7](https://github.com/ckeditor/ckeditor5-easy-image/issues/7). ([ce800f7](https://github.com/ckeditor/ckeditor5-easy-image/commit/ce800f7))

  Feature: The plugin will now automatically refresh token when it will expire.

### BREAKING CHANGES

* Easy Image plugin do not use `cloudeservices.token` config anymore. The proper config now is `cloudeservices.tokenUrl`with the URL to the token server.


## 1.0.0-alpha.1 (2017-10-03)

Internal changes only (updated dependencies, documentation, etc.).
