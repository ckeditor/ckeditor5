---
category: update-guides
meta-title: Update to version 42.x | CKEditor 5 Documentation
menu-title: Update to v42.x
order: 82
modified_at: 2024-06-25
---

# Update to CKEditor&nbsp;5 v42.x

<info-box>
	When updating your CKEditor&nbsp;5 installations, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v42.0.0

_Released on June 26, 2024._

For the entire list of changes introduced in version 42.0.0, see the [release notes for CKEditor&nbsp;5 v42.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v42.0.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v42.0.0.

### New installation methods

This release introduces new installation methods. We simplified dependency management, made CKEditor&nbsp;5 bundler-agnostic, and improved the startup performance through separate CSS distribution.

Read more about the details in the {@link updating/nim-migration/migration-to-new-installation-methods migration guides}. These guides provide step-by-step instructions and examples to help you seamlessly transition to the new installation methods.

Our legacy installation methods are still supported, but we put them on the deprecation path. You can learn more about this in the migration guide's {@link updating/nim-migration/migration-to-new-installation-methods#sunset-of-old-installation-methods-and-deprecation-timelines deprecation timelines} section.

#### JavaScript target changed

The predefined and DLL builds are targeting the ES2022 syntax to make use of native support for class fields and methods.

#### Removal of superbuild and predefined builds from the CDN

We have stopped publishing the superbuild and predefined builds to our CDN. Predefined builds can still be accessed as an npm package. If you want to keep using our CDN with new versions of the editor, we recommend {@link updating/nim-migration/migration-to-new-installation-methods#browser-builds migrating to the new installation methods}.

#### Deprecation of the Vite plugin

We have deprecated the Vite plugin, [`@ckeditor/vite-plugin-ckeditor5`](https://www.npmjs.com/package/@ckeditor/vite-plugin-ckeditor5), as it remained experimental and did not fully support features such as translations handling. The newly introduced installation methods resolve this issues, as they work with any bundler out-of-the-box.
