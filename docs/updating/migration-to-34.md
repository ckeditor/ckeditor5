---
category: updating
menu-title: Migration to v34.x
order: 90
modified_at: 2022-03-15
---

# Migration to CKEditor 5 v34.0.0

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

For the entire list of changes introduced in version 34.0.0, see the [changelog for CKEditor 5 v34.0.0]

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v34.0.0.

## Important changes

### Additional dependencies in CKEditor 5 Collaboration Features

The {@link installation/advanced/dll-builds DLL builds} support was introduced for revision history. As a result, some imports, plugin requirements and cross-package dependencies have changed to allow for the new building process.

From now on, additional plugins will be required, when the following CKEditor 5 collaboration features are added to the editor:

* **{@link module:real-time-collaboration/realtimecollaborativerevisionhistory~RealTimeCollaborativeRevisionHistory}** will also require {@link module:revision-history/revisionhistory~RevisionHistory}:

	```js
	// ❌ Old imports:
	import RealTimeCollaborativeRevisionHistory from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativerevisionhistory';
	// ✅ New imports:
	import RealTimeCollaborativeRevisionHistory from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativerevisionhistory';
	import RevisionHistory from '@ckeditor/ckeditor5-revision-history/src/revisionhistory';
	```
