---
category: update-guides
meta-title: Update to version 43.x | CKEditor 5 Documentation
menu-title: Update to v43.x
order: 81
modified_at: 2024-07-31
---

# Update to CKEditor&nbsp;5 v43.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v43.3.1

Released on November 6, 2024. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v43.3.1))

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v43.3.1.

### Reverted icon change

We had to revert a change introduced in v43.3.0 related to the icons export in one of our packages. This was due to unforeseen TypeScript issues in some setups.

## Update to CKEditor&nbsp;5 v43.3.0

Released on October 29, 2024. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v43.3.0))

For the entire list of changes introduced in version 43.3.0, see the [release notes for CKEditor&nbsp;5 v43.3.0](https://github.com/ckeditor/ckeditor5/releases/tag/v43.3.0).

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v43.3.0.

### Performance improvements

We have improved how the editor handles the document structure by making it more reliable and efficient to access specific elements and verify their positions.

* **Node index and offset caching**: The `Node` and `NodeList` elements now cache index and offset values, reducing the need for recalculations and significantly boosting overall performance during model operations.
* **Selection range validation**: The newly implemented `Position#isValid()` method is also utilized to better validate selection ranges, ensuring more consistent behavior in various editing scenarios.
* **Performance improvements in numbers**: The editor now loads content between **3x and, in some cases, up to 6x faster, depending on the type and size of the content**. For instance, where a specific 200-page document previously took almost 25 seconds to load, the time has now been reduced to just 3.5 seconds.

**We’re committed to ongoing performance enhancements**, so you can expect even faster, smoother experience in future updates.

### Export to Word watermark support

A new configuration option has been added to include a watermark when exporting documents to Word, providing additional flexibility in document branding and protection.

## Update to CKEditor&nbsp;5 v43.2.0

Released on October 15, 2024. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v43.2.0))

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v43.2.0.

### Notable improvements

* **Operational Transformation Stability**: Significant changes have been made to the OT system, enhancing the undo functionality and real-time collaboration, especially in conflict resolution scenarios. These improvements ensure smoother editor operations during complex interactions.
* **Performance Improvements**: We have merged several community-driven performance enhancements, that optimize the editor’s core engine. While no changes to the editor’s logic were made, these updates improve overall efficiency and responsiveness.

### More imports available via `ckeditor5` and `ckeditor5-premium-features` indexes

As users transition to new installation methods (v42.0.0+) with `ckeditor5` and `ckeditor5-premium-features` as the main packages, we are continuously addressing missing imports for less common classes, functions, types, and utilities, broadening their availability. Since our TypeScript rewrite (v37.0.0), imports can now be made directly through the package indexes, simplifying integration. As many users historically imported from `src`, we encourage you to try the new version and report any missing imports. In the future, we are considering removing `src` from published packages to reduce package size, so the more feedback we receive, the better and more stable API we will provide.

## Update to CKEditor&nbsp;5 v43.1.1

Released on September 25, 2024. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v43.1.1))

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v43.1.0.

### Vulnerability fix

During a recent internal audit, we identified a Cross-Site Scripting (XSS) vulnerability in the CKEditor 5 clipboard package ([`CVE-2024-45613`](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-rgg8-g5x8-wr9v)). This vulnerability could be triggered by a specific user action, leading to unauthorized JavaScript code execution if the attacker inserted malicious content into the editor, which might happen with only a particular editor configuration.

This vulnerability affects **only** installations where the editor configuration meets the following criteria:

1. The [**Block Toolbar**](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/toolbar.html#block-toolbar) plugin is enabled.
2. One of the following plugins is also enabled:
	* [**General HTML Support**](https://ckeditor.com/docs/ckeditor5/latest/features/html/general-html-support.html) with a configuration that permits unsafe markup.
	* [**HTML Embed**](https://ckeditor.com/docs/ckeditor5/latest/features/html/html-embed.html).

You can read more details in the relevant [security advisory](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-rgg8-g5x8-wr9v) and [contact us](https://ckeditor.com/contact/) if you have more questions.

Taking the occasion, we decided to introduce additional hardening to some parts of our codebase that introduce **theoretical and non-exploitable issues**. Our security team confirmed that none of these issues were exploitable in a real scenario, however, we decided to fix them, to increase the overall security posture of our software.

## Update to CKEditor&nbsp;5 v43.1.0

Released on September 5, 2024. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v43.1.0))

For the entire list of changes introduced in version 43.1.0, see the [release notes for CKEditor&nbsp;5 v43.1.0](https://github.com/ckeditor/ckeditor5/releases/tag/v43.1.0).

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v43.1.0.

### Reverted recently introduced `config.sanitizeHtml`

In v43.0.0 we made a decision to move {@link module:html-embed/htmlembedconfig~HtmlEmbedConfig#sanitizeHtml `config.htmlEmbed.sanitizeHtml`} to a top-level property `config.sanitizeHtml`, so it could be used by multiple features (HTML embed, merge fields, and possibly other in future).

However, we realized that it was a wrong decision to expose such a sensitive property in a top-level configuration property. We are worried that integrators may be confused and incorrectly assume that this callback would sanitize the entire output from CKEditor. Therefore, we decided to revert that change, so the sanitization callback is related strictly with the features that use it.

Starting with v43.1.0, you should again use {@link module:html-embed/htmlembedconfig~HtmlEmbedConfig#sanitizeHtml `config.htmlEmbed.sanitizeHtml`} and newly introduced {@link module:merge-fields/mergefieldsconfig~MergeFieldsConfig#sanitizeHtml `config.mergeFields.sanitizeHtml`}. The editor will throw an error if `config.sanitizeHtml` is used.

Note: CKEditor&nbsp;5, by default, prevents execution of scripts in the editor content, while the content is being edited inside the editor. However, there are features (such as General HTML support or HTML embed) that can be configured to make CKEditor&nbsp;5 produce HTML output that contains executable scripts. Please remember, that CKEditor&nbsp;5 is a frontend component working in a browser. As an integrator, it is your responsibility to sanitize the content before it is displayed on your website or on other potentially vulnerable medium.

### Table and cell border settings update

The tables' user interface now clearly indicates the default border settings. It allows users to set “no borders” (None) for tables and cells without any additional configuration.

⚠️ In some cases this update may lead to data changes in the tables’ HTML markup when the editor loads them. However, visually nothing will change, and the experience will be the same.

## Update to CKEditor&nbsp;5 v43.0.0

Released on August 7, 2024. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v43.0.0))

For the entire list of changes introduced in version 43.0.0, see the [release notes for CKEditor&nbsp;5 v43.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v43.0.0).

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v43.0.0.

### Export to Word v2 becomes the default

In CKEditor&nbsp;5 v42.0.0, we introduced a new version of the Export to Word plugin that utilizes the updated converter (marked as V2). It was introduced in an opt-in manner. Starting with v43.0.0, the Export to Word V2 is **the default** configuration. This may require updates to the editor's configuration if you use this plugin.

Example V1 configuration:

```js
exportWord: {
	tokenUrl: 'https://example.com/cs-token-endpoint',
	fileName: 'my-file.docx',
	converterOptions: {
		format: 'A4',
		margin_top: '20mm',
		margin_bottom: '20mm',
		margin_right: '12mm',
		margin_left: '12mm'
	}
}
```

The same migrated to V2:

```js
exportWord: {
	tokenUrl: 'https://example.com/cs-token-endpoint',
	fileName: 'my-file.docx',
	converterOptions: {
		document: {
			size: 'A4',
			margin: {
				top: '20mm',
				bottom: '20mm',
				right: '12mm',
				left: '12mm'
			}
		}
	}
}
```

You can find the full V2 configuration in the {@link module:export-word/exportword~ExportWordConverterOptionsV2} API documentation.

#### Other configuration changes

* We decided to switch the default `auto_pagination` option to `false`. This option was only used with the {@link features/pagination pagination feature}. When enabled, the breaks in the pagination force page breaks in the exported Word document. However, browser engines and Microsoft Word differ significantly in how they render page elements. Because of that we decided to turn this option off. If you still want to enforce breaks from pagination, change it in the configuration to `true`.
* A new configuration option was added: `document.language`. It is set to the editor content language by default.

### Typing bug fixes

This release brings a couple of improvements to typing in the editor.

* Android IME: multiple issues related to duplicated characters, reverse writing effects, etc. ([#13994](https://github.com/ckeditor/ckeditor5/issues/13994), [#14707](https://github.com/ckeditor/ckeditor5/issues/14707), [#13850](https://github.com/ckeditor/ckeditor5/issues/13850), [#13693](https://github.com/ckeditor/ckeditor5/issues/13693), [#14567](https://github.com/ckeditor/ckeditor5/issues/14567), [#11569](https://github.com/ckeditor/ckeditor5/issues/11569)).
* Safari: the reverse typing effect after the focus change ([#14702](https://github.com/ckeditor/ckeditor5/issues/14702)).

These fixes do not require migration, but typing is a crucial area for the editor, and we want to call them out explicitly.

### Special characters user interface

The special characters UI has been changed from a dropdown to a dialog. This unifies the action between the menu bar and the toolbar. It also gives content creators quicker access to the always-on-top dialog when they insert a lot of symbols into the content.

### Update of global names in the UMD builds

We have decided to change the global names for the `ckeditor5` and `ckeditor5-premium-features` packages in the UMD builds to `CKEDITOR` and `CKEDITOR_PREMIUM_FEATURES` respectively.

### React and Vue integrations updates

We have released new major versions of the React and Vue integrations. In both of them, we have migrated to JavaScript modules (ESM) and rewritten large parts of their codebases to support the latest versions of these frameworks and to follow the latest recommendations for writing the components.

We strongly recommend that you read the release highlights to update to the latest versions:

* [Release highlights for React integration](https://github.com/ckeditor/ckeditor5-react/releases/tag/v9.0.0).
* [Release highlights for Vue integration](https://github.com/ckeditor/ckeditor5-vue/releases/tag/v7.0.0).

### Updates to the Package Generator

In the last major release of CKEditor&nbsp;5, we introduced new installation methods. Since then we have received a lot of feedback from you. Thanks to this, we identified several minor issues fixed in versions 42.0.1 and 42.0.2. While these fixes did not require any changes in the application, they do require some changes in the custom plugins created with the Package Generator.

You can skip this section if you have not read the [Migrating custom plugins](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/custom-plugins.html) guide. However, if you have, follow the steps below to apply these fixes to your plugin.

1. Update all packages starting with `@ckeditor/ckeditor5-dev-` to version `^42.0.0`.
2. Open the `package.json` file and replace the content as follows:
	* If your project is written in TypeScript, replace the `"types"` and `"exports"` fields:

		```json
		"types": "dist/index.d.ts",
		"exports": {
			".": {
				"types": "./dist/index.d.ts",
				"import": "./dist/index.js"
			},
			"./*": "./dist/*",
			"./browser/*": null,
			"./package.json": "./package.json"
		}
		```

	* If your project is written in plain JavaScript, replace the `“exports”` field:

		```json
		"exports": {
			".": "./dist/index.js",
			"./*": "./dist/*",
			"./browser/*": null,
			"./package.json": "./package.json"
		}
		```

3. Open the `scripts/build-dist.mjs` file and look for the `name` object key in the second `build()` step. This value represents the global variable under which your plugin is available in the UMD build and should currently match the name of your package. UMD is an alternative build format that we provide for those who cannot use JavaScript modules in their applications. We encourage you to update this value to `CKEDITOR_PLUGIN_X`, where `X` uniquely identifies your plugin. We recommend using only uppercase letters and underscores (`_`).

### Minor breaking changes in this release

* **Reverted `config.sanitizeHtml`.** In v43.0.0 we made a decision to move `config.htmlEmbed.sanitizeHtml` to a top-level property `config.sanitizeHtml`. However, we realized that it was a wrong decision to expose such a sensitive property in a top-level configuration property. Starting with v43.1.0 you should again use `config.htmlEmbed.sanitizeHtml` and/or `config.mergeFields.sanitizeHtml`. The editor will throw an error if `config.sanitizeHtml` is used. See the [migration guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-43.html#reverted-recently-introduced-configsanitizehtml) for additional context behind this decision.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The structure and presentation of the list of AI commands in the toolbar have changed (a flat filtered list is now a nested menu). Additionally, if your integration customizes this user interface, please ensure your integration code is up-to-date.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The default `[aria-label]` provided by `InlineEditableUIView` is now `'Rich Text Editor. Editing area: [root name]'` (previously: `'Editor editing area: [root name]'`). You can use the `options.label` constructor property to adjust the label.
