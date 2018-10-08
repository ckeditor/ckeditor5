Changelog
=========

## [10.0.0](https://github.com/ckeditor/ckeditor5-media-embed/tree/v10.0.0) (2018-10-08)

### Features

* Introduced the automatic media embedding. Closes [#6](https://github.com/ckeditor/ckeditor5-media-embed/issues/6). ([40dbf83](https://github.com/ckeditor/ckeditor5-media-embed/commit/40dbf83))
* Introduced toolbar for the Media Embed feature. Closes [#41](https://github.com/ckeditor/ckeditor5-media-embed/issues/41). Closes [#28](https://github.com/ckeditor/ckeditor5-media-embed/issues/28). ([0a14857](https://github.com/ckeditor/ckeditor5-media-embed/commit/0a14857))
* Simplified the URL configuration of the providers making both the protocol (`http://`, `https://`) and the `www` subdomain prefix optional in the `RegExps`. Closes [#13](https://github.com/ckeditor/ckeditor5-media-embed/issues/13). ([b86a36b](https://github.com/ckeditor/ckeditor5-media-embed/commit/b86a36b))

  Passed the entire output of the match against the provider `RegExp` to the `MediaEmbedProvider#html` function (previously only the last match), allowing more complex media previews. 
* The basic media embed feature. Closes [#1](https://github.com/ckeditor/ckeditor5-media-embed/issues/1). ([4c9b642](https://github.com/ckeditor/ckeditor5-media-embed/commit/4c9b642))

### Other changes

* Updated translations. ([3da48ae](https://github.com/ckeditor/ckeditor5-media-embed/commit/3da48ae))
* Updated translations. ([353f7f4](https://github.com/ckeditor/ckeditor5-media-embed/commit/353f7f4))
* Updated translations. ([7b6cca3](https://github.com/ckeditor/ckeditor5-media-embed/commit/7b6cca3))
