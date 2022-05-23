---
category: updating
menu-title: Migration to v35.x
order: 89
modified_at: 2022-23-05
---

# Migration to CKEditor 5 v35.0.0

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

For the entire list of changes introduced in version 35.0.0, see the [changelog for CKEditor 5 v35.0.0]().

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v35.0.0.

## Important changes

### Changed `AnnotationsUI` interface

New property `AnnotationsUI#annotations` has been added to the `AnnotationsUI` interface. If you implemented a custom annotations UI class, you should update it accordingly.

The property should be set in `AnnotationsUI#attach( annotations )`. The first parameter passed to this method should be assigned to `AnnotationsUI#annotations`.

Additionally, `Annotations#detach()` should set the property to `null`.

```js
// Before:
class CustomAnnotationUI extends ContextPlugin {
	attach( annotations ) {
		// ...
		// Your custom code.
	}

	detach() {
		// ...
		// Your custom code.
	}

	// ...
}

// After:
class CustomAnnotationUI extends ContextPlugin {
	attach( annotations ) {
		// ...
		// Your custom code.

		this.annotations = annotations;
	}

	detach() {
		// ...
		// Your custom code.

		this.annotations = null;
	}

	// ...
}
```
