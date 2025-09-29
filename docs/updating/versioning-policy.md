---
menu-title: Versioning policy
meta-title: Versioning and release process | CKEditor 5 Documentation
meta-description: How CKEditor 5 is versioned and released - aligned versions across packages, release channels (stable, nightly, alpha/RC), and guidance on staying up to date.
category: updating
order: 40
---

# Versioning policy

CKEditor 5 is a modular ecosystem of over 80 packages, distributed through npm. To provide predictability and a consistent developer experience, we follow a unified versioning and release policy across all packages.

## Package structure

CKEditor 5 is delivered in two core packages:

* [**`ckeditor5`**](https://www.npmjs.com/package/ckeditor5) &ndash; the framework and open-source features.
* [**`ckeditor5-premium-features`**](https://www.npmjs.com/package/ckeditor5-premium-features) &ndash; commercial plugins and add-ons.

Together, these aggregate and version over 80 underlying packages that make up the editor framework, features, and utilities.

In addition, the ecosystem provides separately versioned integration packages and tooling:

* **Integrations:** [`@ckeditor/ckeditor5-react`](https://www.npmjs.com/package/@ckeditor/ckeditor5-react), [`@ckeditor/ckeditor5-angular`](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular), [`@ckeditor/ckeditor5-vue`](https://www.npmjs.com/package/@ckeditor/ckeditor5-vue)
* **Tooling:** [`ckeditor5-package-generator`](https://www.npmjs.com/package/ckeditor5-package-generator), [`@ckeditor/ckeditor5-integrations-common`](https://www.npmjs.com/package/@ckeditor/ckeditor5-integrations-common)

## Unified versioning

* All CKEditor 5 packages share the **same version number**.
* This includes both `ckeditor5` and `ckeditor5-premium-features`, as well as all underlying feature and framework packages.
* Integration packages and tooling may follow their own versioning, but major compatibility notes are always documented.

This unified versioning approach is common in large ecosystems (for example, Angular). It simplifies dependency management, avoids mismatched versions, and makes it easy to know which packages are compatible.

## Pinned dependencies

All packages in the ecosystem pin dependencies to specific versions. This prevents issues with npm/yarn/pnpm resolving past versions incorrectly and guarantees reproducible builds.

## Version numbers

We use the **`MAJOR.MINOR.PATCH`** scheme:

* **MAJOR** &ndash; Introduced when at least one package requires a **major breaking change**. This affects the entire ecosystem.
* **MINOR** &ndash; Introduced when a package adds a new feature or introduces a **minor breaking change**.
* **PATCH** &ndash; Introduced when a package only includes bug fixes, internal changes, or documentation updates.

Because CKEditor 5 spans multiple layers – from low-level utilities through framework APIs to ready-to-use builds – our approach differs from strict [Semantic Versioning](https://semver.org/). Instead, our policy balances stability with the flexibility needed for such a broad ecosystem.

## Breaking changes

Breaking changes are categorized based on which layer of the ecosystem they affect:

* **Integration layer** (editor builds, configuration, and top-level APIs):
	* Breaking changes are considered **major**.
	* Introduced very rarely and only when unavoidable.
* **Plugin development API** (packages such as `@ckeditor/ckeditor5-engine` or `@ckeditor/ckeditor5-core`):
	* Breaking changes are also considered **major**.
	* Introduced occasionally, but batched to reduce the number of major releases.
* **Low-level customization APIs and feature customization APIs** (internal utilities, hooks, helper functions, and lower-level APIs exposed by specific features, for example the Link balloon):
	* Designed mainly for **deep customizations of existing features**, rather than for building integrations or plugins.
	* Treated as **less stable** – breaking changes are considered **minor** and may occur more often as these APIs evolve with feature development.
	* Provide powerful flexibility but are closer to implementation details, so they should not be relied upon for long-term compatibility guarantees.

## Release schedule

We typically publish a **new major release of CKEditor 5 every 6 months**, though in some cases new majors may arrive sooner. Each new major replaces the previous one as the actively supported version, ensuring that all users benefit from the latest improvements, fixes, and compatibility updates.

For projects that need **long-term stability**, we also offer the commercial **CKEditor 5 LTS (Long-term Support) Edition**. Every two years, one major release (starting with **v47.0.0**) is designated as an LTS release, providing up to **3 years of guaranteed updates** &ndash; 6 months of active development followed by 2.5 years of maintenance with security and critical compatibility fixes. Read more in the {@link getting-started/setup/using-lts-edition CKEditor 5 LTS Edition} guide.

<info-box>
	For **v47.x**, the **Active phase ends in April 2026**, at which point the release enters the **Maintenance phase**. From then on, all new versions in the `v47.x` line will be distributed under a **commercial LTS Edition license**. Integrators without an LTS license should migrate to **v48.x** (the next regular release).
</info-box>

## Release channels

CKEditor 5 is distributed through several release channels, each serving a different purpose:

* **Stable releases**: The recommended versions for production use. These are fully tested and supported, and are available via **npm**, **ZIP packages**, and the **official CDN**.
* **Alpha builds**: Used for early access and testing before a stable release. Alpha builds are published to npm under the `alpha` dist-tag.
* **Nightly builds**: Generated automatically from the latest development branch. They are available via npm under the `nightly` dist-tag and are intended for testing the newest changes.

If you encounter an issue, please [report it in the CKEditor&nbsp;5 issue tracker](https://github.com/ckeditor/ckeditor5/issues). Early feedback (especially about alpha and nightly releases) gives us more time to investigate and resolve problems before they reach a stable release.

## Tracking changes

To stay up to date with changes:

- **Changelog**: Check the [CKEditor 5 changelog](https://github.com/ckeditor/ckeditor5/blob/stable/CHANGELOG.md).
- **News**: Read the [CKEditor Ecosystem Blog](https://ckeditor.com/blog/) or subscribe to the [newsletter](http://ckeditor.com/#newsletter-signup).
- **npm**: Follow the [`ckeditor5`](https://www.npmjs.com/package/ckeditor5) and [`ckeditor5-premium-features`](https://www.npmjs.com/package/ckeditor5-premium-features) packages.

## Update guides

When a release introduces breaking or otherwise important changes, the {@link updating/index Updating CKEditor&nbsp;5} section provides technical details and migration steps. Always review these guides after a release to keep your integration stable.
