
---
category: builds-migration
menu-title: Migration to v32.x
order: 92
modified_at: 2021-12-10
---

# Migration to CKEditor 5 v32.0.0

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

[//]: <> (TODO: Update the URL to changelog)

For the entire list of changes introduced in version 32.0.0, see the [changelog for CKEditor 5 v32.0.0](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md#3200-202?-??-??).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v32.0.0.

### Bump of minimal version of `Node.js` to 14.x

[`Node.js` 12 ends its long-term support in April 2022](https://nodejs.org/en/about/releases/). Because of that, starting from v32.0.0, the minimal version of `Node.js` required by CKEditor 5 will be 14.
