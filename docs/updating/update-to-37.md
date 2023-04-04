---
category: update-guides
menu-title: Update to v37.x
order: 87
modified_at: 2023-04-03
---

# Update to CKEditor 5 v37.0.0

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

For the entire list of changes introduced in version 37.0.0 see the [release notes for CKEditor 5 v37.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v37.0.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v37.0.0.

## TypeScript typings

As of version `37.0.0` we provide native TypeScript types, and community types are not longer needed. In order to address this, it may be necessary to replace these community types with native types provided by the package. Here's how to do it:

1. Remove community types:
	- Remove all used `@types/ckeditor__ckeditor5-*` packages
	- Remove any augmentation of types you had in your project
	
	For example:
  
	  ```js
	  // typings/types.d.ts

	  declare module 'ckeditor5/src/core' {
		  export * from 'ckeditor__ckeditor5-core';
	  }

	  declare module 'ckeditor5/src/ui' {
		  export * from 'ckeditor__ckeditor5-ui';
	  }
	  ```

2. Replace the community types with native types:
	- Update any import statements to use the native types instead of the community types
	- Update any code that references the community types to use the native types

3. Test your project:
	- Ensure that the changes did not introduce any new errors or issues
	- Verify that the project still functions as intended

We want to thank our community for providing the types so far!
