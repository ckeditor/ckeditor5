---
category: update-guides
meta-title: Update to version 41.x | CKEditor 5 Documentation
menu-title: Update to v41.x
order: 83
modified_at: 2024-01-02
---

# Update to CKEditor&nbsp;5 v41.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v41.0.0

For the entire list of changes introduced in version 41.0.0, see the [release notes for CKEditor&nbsp;5 v41.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v41.0.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v41.0.0.

### Breaking changes to the list plugin

As of the latest release, the current list plugin (often referred to as list v1.0) has been replaced with the {@link features/lists newer and more advanced list plugin}, formerly known as Document lists (v2.0).

We introduced the new plugin in a manner that aims to be transparent for our users, namely by physically replacing the old plugin with the new one, but retaining all namespace intact. It means, starting with release v.40.2.0 all imports of various listst-relateg plugins will use the new version.

The old plugin has been renamed to `LegacyList` instead. The same applies to all other list-related plugins, namely: `LegacyTodoList`, `LegacyListEditing`, and `LegacyTodoListEditing`.

Unless you need to specifically use the old v1.0 plugin in your integration, there is no need to make changes in the configuration.

If you want to use the new extended plugin, but want to utilize block elements in list, you can turn off this functionality and use the {@link features/lists-editing#simple-lists simple list setting} instead of sticking to the old plugins.
