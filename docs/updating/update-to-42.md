---
category: update-guides
meta-title: Update to version 42.x | CKEditor 5 Documentation
menu-title: Update to v42.x
order: 82
---

# Update to CKEditor&nbsp;5 v42.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v42.0.0

Released on June 26, 2024. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v42.0.0))

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v42.0.0.

### New installation methods

This release introduces new installation methods. We simplified dependency management, made CKEditor&nbsp;5 bundler-agnostic, and improved the startup performance through separate CSS distribution.

The most prominent changes:

* All plugins and core features are now available from the unified [`ckeditor5`](https://www.npmjs.com/package/ckeditor5) and [`ckeditor5-premium-features`](https://www.npmjs.com/package/ckeditor5-premium-features) packages, reducing dependency management complexity.
* Our packages became bundler-agnostic. You can use whatever bundler you want (such as Vite or esbuild) to integrate CKEditor 5.
* CSS files are now distributed separately from JavaScript, allowing for parallel downloading, easier customization, and improved performance.
* All the new distribution methods (available via npm, CDN, and ZIP downloads) allow dynamic plugin registration making it easy to add or remove plugins dynamically.

#### Migration paths

The old installation methods are still supported, but we put them on the deprecation path. Detailed {@link updating/nim-migration/migration-to-new-installation-methods migration guides} can be found in our documentation. These guides provide step-by-step instructions and examples to help you seamlessly transition to the new installation methods:

* {@link updating/nim-migration/migration-to-new-installation-methods Overview and details of the new installation methods}.
* {@link updating/nim-migration/predefined-builds Predefined builds migration guide}.
* {@link updating/nim-migration/customized-builds Custom builds migration guide}.
* {@link updating/nim-migration/dll-builds DLLs migration guide}.
* {@link updating/nim-migration/custom-plugins Migration guide for custom plugins published as libraries}.

Our legacy installation methods are still supported, but we put them on the deprecation path. You can learn more about this in the migration guide's {@link updating/nim-migration/migration-to-new-installation-methods#sunset-of-old-installation-methods-and-deprecation-timelines deprecation timelines} section.

#### JavaScript target changed

The predefined and DLL builds are targeting the ES2022 syntax to make use of native support for class fields and methods.

#### Removal of superbuild and predefined builds from the CDN

We have stopped publishing the superbuild and predefined builds to our CDN. Predefined builds can still be accessed as an npm package. If you want to keep using our CDN with new versions of the editor, we recommend {@link updating/nim-migration/migration-to-new-installation-methods#browser-builds migrating to the new installation methods}.

#### Deprecation of the Vite plugin

We have deprecated the Vite plugin, [`@ckeditor/vite-plugin-ckeditor5`](https://www.npmjs.com/package/@ckeditor/vite-plugin-ckeditor5), as it remained experimental and did not fully support features such as translations handling. The newly introduced installation methods resolve this issues, as they work with any bundler out-of-the-box.

### New Builder

Along with the new release, we present you the brand new [CKEditor 5 Builder](https://ckeditor.com/ckeditor-5/builder/).

The new Builder allows you to start with one of the predefined presets, customize it by adding and removing features, and observe the changes live in an editor preview (and play with the editor!). Once you are happy with your custom setup, you get ready-to-use code snippets for React, Angular, Vue, and VanillaJS setups for both npm and CDN distributions.

### Minor breaking changes in this release

* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The `Insert image via URL` UI component form has been moved to a modal dialog instead of being available directly in the insert image dropdown.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Increased specificity of the `.image-style-block-align-[right/left]`, `.image-style-align-[right/left]`, and `.image-style-side` CSS classes by adding the `.image` class. See [#16317](https://github.com/ckeditor/ckeditor5/issues/16317).
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: The media embed feature now uses a modal dialog (instead of a toolbar dropdown) for inserting media.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: If you have custom CSS styles that override the default styling of the `Pagination` elements, they might stop working after this change. The reason is that a stricter CSS selector with `ck-pagination-loaded` is now used to hide or show these elements.
