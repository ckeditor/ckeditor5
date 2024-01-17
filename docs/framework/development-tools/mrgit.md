---
menu-title: Mr. Git
category: development-tools
meta-title: Mr. Git | CKEditor 5 Framework Documentation
order: 4
modified_at: 2022-08-16
---

# Mr. Git

[Mr. Git](https://github.com/cksource/mrgit) is a multi-repository manager for Git. In CKEditor&nbsp;5, you can use it for easy development and testing of various CKEditor&nbsp;5-related repositories, such as [`ckeditor5-dev`](https://github.com/ckeditor/ckeditor5-dev) or [`ckeditor5-linters-config`](https://github.com/ckeditor/ckeditor5-linters-config).

## Setup

To use the tool, install it globally from the npm.

```bash
npm install -g mrgit
```

Then, put a file named `mrgit.json` in the root of the `ckeditor5` repository. This is an example content of this file:

```json
{
	"packages": "external/",
	"dependencies": {
		"ckeditor5-linters-config": "ckeditor/ckeditor5-linters-config@latest",
		"ckeditor5-dev": "ckeditor/ckeditor5-dev@latest"
	},
	"presets": {
		"dev": {
			"ckeditor5-dev": "ckeditor/ckeditor5-dev"
		},
		"example-feature": {
			"ckeditor5-linters-config": "ckeditor/ckeditor5-linters-config#i/1-example-feature",
			"ckeditor5-dev": "ckeditor/ckeditor5-dev#i/1-example-feature"
		}
	}
}
```

<info-box>
    Support for tags and presets is available since `mrgit` [`v2.0.0`](https://github.com/cksource/mrgit/releases/tag/v2.0.0)+.
</info-box>

## Usage

In the example configuration file listed above, we have defined base dependencies that should be used. These use the `@latest` tag, which means that the latest release tag will be used. This should coincide with the latest version available on npm. After calling `mrgit sync`, these dependencies will be cloned and made available locally in the specified (latest) version.

Alternatively, you can use one of the presets defined in the latter section of the file, for example, the `dev` preset. To do so, execute `mrgit sync --preset dev` &ndash; this will use versions specified in the preset instead. `ckeditor/ckeditor5-dev` does not have any tag or branch specified, so the `master` branch will be used by default.

Since only `ckeditor5-dev` is specified in this preset, version used for `ckeditor5-linters-config` will be the same as specified in the default `dependencies` section. Using this mechanism, it is possible to switch between production and development versions of the dependencies used by the `ckeditor5` repository.

For all available commands and configuration options, see the [Mr. Git documentation](https://github.com/cksource/mrgit#mr-git).
