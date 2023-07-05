---
category: update-guides
menu-title: Update to v37.x
order: 87
---

# Update to CKEditor 5 v37.0.0

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

For the entire list of changes introduced in version 37.0.0, see the [release notes for CKEditor 5 v37.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v37.0.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v37.0.0.

## Bump of minimal version of Node.js to 16.x

[Node.js 14 ends its long-term support in April 2023](https://nodejs.org/en/about/releases/). Because of that, starting from v37.0.0, the minimal version of Node.js required by CKEditor 5 will be 16.

## TypeScript typings

As of version 37.0.0, we provide native TypeScript types, hence community types are no longer needed. To address this, it may be necessary to replace these community types with native types provided by the package. Here is how to do it:

1. Remove community types:
	* Remove any `@types/ckeditor__ckeditor5-*` packages used.
	* Remove any augmentation of types you had in your project.

	For example:

	  ```ts
	  // typings/types.d.ts

	  declare module 'ckeditor5/src/core' {
		  export * from 'ckeditor__ckeditor5-core';
	  }

	  declare module 'ckeditor5/src/ui' {
		  export * from 'ckeditor__ckeditor5-ui';
	  }
	  ```

2. Replace the community types with native types:
	* Update any import statements to use the native types instead of the community types.
	* Update any code that references the community types to use the native types.
	* Make sure that all imports are from the package entry point instead of the path to a module.

	For example:

	```ts
	// Instead of:
	import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

	// Do:
	import { Plugin } from '@ckeditor/ckeditor5-core';
	```

3. Adjust your `tsconfig.json` to include at least:

	```json
	{
		"compilerOptions": {
			"lib": [
				"DOM",
				"DOM.Iterable"
			],
			"module": "es6",
			"target": "es2019",
			"moduleResolution": "node"
		}
	}
	```

	You can choose other options for your project, but they are not guaranteed to work.

4. Test your project:
	* Ensure that the changes did not introduce any new errors or issues.
	* Verify that the project still functions as intended.

We want to thank our community for providing the types so far!

## Comments archive

CKEditor 5 v37.0.0 introduces the comments archive feature. Below you will find notes regarding the feature as well as migration tips in case of breaking changes that may affect some integrations.

Note that the [documentation for the previous editor version (36.0.1)](https://ckeditor.com/docs/ckeditor5/36.0.1/) is still available if you would like to compare the differences.

### General notes

* Comments archive is enabled by default and cannot be turned off.
* You need to add the `commentsArchive` button to the toolbar to get access to the comments archive panel.
* The UI in the comment annotation has changed. The remove and edit buttons have been moved to a dropdown. A new button for resolving a comment thread was added.
* Markers for resolved comment threads are still preserved in the document data. This allows for re-opening (unresolving) a comment thread. Comment threads can be re-opened only if their related marker is still present in the content.
* When a commented part of the document is removed from the document, the related comment thread is resolved and moved to the archive.
* In integrations using `Context` and multiple editor instances, each editor instance will display only its own comment threads in the comments archive panel.
* Comment threads that were removed before the comments archive was introduced will not be shown in the archive.
* The undo feature no longer undoes creating or removing a comment thread.
* The undo feature no longer undoes resolving or re-opening a comment thread.

### Breaking changes

#### Non-real-time collaboration integration

This concerns only applications that use the comments feature without real-time collaboration and provide their integration.

##### "Load and save" integration

Additional data for comment threads has to be stored and passed to `CommentsRepository#addCommentThread()` when adding comments data. Make sure that you correctly store the new properties: `resolvedBy`, `resolvedAt`, `context`, and `attributes`. Depending on your integration, this may require changes in your database.

##### Adapter integration

Comment thread becomes an actual data entity, with properties that need to be saved in the database. This requires changes in the adapter and may require changes in your database, depending on your integration.

New methods are required in the {@link module:comments/comments/commentsrepository~CommentsAdapter comments adapter}:

* `addCommentThread()`
* `updateCommentThread()`
* `resolveCommentThread()`
* `reopenCommentThread()`
* `removeCommentThread()` &ndash; it is now required (it was optional before).

Additionally, `getCommentThread()` should be updated to resolve with an object that includes new comment thread properties: `resolvedBy`, `resolvedAt`, `context`, and `attributes`.

You may also review the updated API documentation for the {@link module:comments/comments/commentsrepository~CommentsAdapter comments adapter}.

#### Custom views and templates

This concerns only applications that customize the comment and comment thread views and templates.

Multiple CSS rules have been changed, so make sure that your custom views display properly. Additionally, comment annotations may now be displayed in the comments archive dropdown which is available from the toolbar. This means that your custom views may be affected by new CSS rules (most notably, CSS reset rules). Make sure that your custom views display properly inside the comments archive dropdown.

Comments and comment thread views and templates have substantially changed due to the introduction of the comments archive. These changes may be incompatible with your custom views or templates. Please review the following:

* The {@link module:comments/comments/ui/view/commentthreadview~CommentThreadView `CommentThreadView` template}.
* The {@link module:comments/comments/ui/view/commentview~CommentView#function-getTemplate `CommentView` template}.
* The updated {@link features/annotations-custom-template custom templates} and {@link features/annotations-custom-view custom views} guides.
* `CommentThreadView` introduces `resolveButton`, which fires a new `resolveCommentThread` event. If you have a completely custom thread view (inheriting directly from `BaseCommentThreadView`), make sure to implement a UI element that will fire this event on `CommentThreadView`.

Finally, we introduced a special type of comment, "system comment", which looks like a simple comment and displays system messages, such as "Comment thread was resolved" (displayed for a resolved comment thread). These comments are created using `CommentView` (or a defined custom view). A system comment has the `#isSystemComment` property set to `true`. You may use it to recognize a system comment and provide necessary customization (for example, a system comment should not have action buttons). A system comment receives a temporary comment model. Note that the system comment model's `attributes` property is set to an empty object. Make sure that your custom comment view correctly handles system comments.

#### Comments outside the editor

This concerns only the applications that use the comments outside the editor feature.

New events, properties, and changes in the API have to be handled. Please review the updated guide for {@link features/comments-outside-editor comments outside the editor} and compare it with your current integration.

Notable changes include, but are not limited to:

* Handling new `CommentsRepository` events: `resolveCommentThread` and `reopenCommentThread`.
* New `context` and `isResolvable` parameters in the {@link module:comments/comments/commentsrepository~CommentsRepository#openNewCommentThread `CommentsRepository#openNewCommentThread()`} call.

Keep in mind that currently, for comments outside the editor, the resolved comment threads are not displayed in the archive panel.
