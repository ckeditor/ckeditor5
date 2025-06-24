---
category: update-guides
meta-title: Update to version 46.x | CKEditor 5 Documentation
menu-title: Update to v46.x
order: 78
modified_at: 2025-06-24
---

# Update to CKEditor&nbsp;5 v46.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v46.0

Released on xxx, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v46.0.0))

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v46.0.0.

### New internal exports

As part of the transition to the New Installation Methods (NIM), we have standardized how public API elements are exposed in CKEditor&nbsp;5 and related packages. It now uses a unified export policy via index.ts, with clearer, standardized public API names introducing some breaking changes. find all the changes and the new exports introduced with NIM in this {@link updating/nim-migration/migrating-exports dedicated migration guide}.

### Major breaking changes in this release

* Mention exports changes

### Minor breaking changes in this release
