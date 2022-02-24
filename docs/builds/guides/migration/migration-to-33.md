---
category: builds-migration
menu-title: Migration to v32.x
order: 92
modified_at: 2022-02-21
---

# Migration to CKEditor 5 v33.0.0

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Migration to CKEditor 5 v33.0.0

For the entire list of changes introduced in version 33.0.0, see the [changelog for CKEditor 5 v33.0.0] TODO: link.

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v33.0.0.

## Changes of imports in CKEditor 5 Collaboration Features

DLL builds support was introduced for collaboration features. As a result, some imports, plugin requirements and cross-package dependencies had to be changed to allow for the new building process.

From now on, additional plugins will be required, when following CKEditor 5 collaboration features are added to the editor:

Adding `TrackChanges` will also require adding these plugins to the list of the editor plugins:

- `Comments` (`@ckeditor/ckeditor5-comments/src/comments`).

Adding `RealTimeCollaborativeEditing` will also require:

- `CloudServices` (`@ckeditor/ckeditor5-cloud-services/src/cloudservices`).

Adding `RealTimeCollaborativeComments` will also require:

- `CloudServices` (`@ckeditor/ckeditor5-cloud-services/src/cloudservices`),
- `Comments` (`@ckeditor/ckeditor5-comments/src/comments`).

Adding `RealTimeCollaborativeTrackChanges` will also require:

- `CloudServices` (`@ckeditor/ckeditor5-cloud-services/src/cloudservices`),
- `Comments` (`@ckeditor/ckeditor5-comments/src/comments`),
- `TrackChanges` (`@ckeditor/ckeditor5-track-changes/src/trackchanges`).

Adding `RealTimeCollaborativeRevisionHistory` will also require:

- `CloudServices` (`@ckeditor/ckeditor5-cloud-services/src/cloudservices`).

Adding `CloudServicesCommentsAdapter` will also require:

- `CloudServices` (`@ckeditor/ckeditor5-cloud-services/src/cloudservices`),
- `CommentsRepository` (`@ckeditor/ckeditor5-comments/src/comments/commentsrepository`).

Adding `CloudServicesTrackChangesAdapter` will also require:

- `CloudServices` (`@ckeditor/ckeditor5-cloud-services/src/cloudservices`),
- `CommentsRepository` (`@ckeditor/ckeditor5-comments/src/comments/commentsrepository`),
- `TrackChangesEditing` (`@ckeditor/ckeditor5-track-changes/src/trackchangesediting`).

Adding `CloudServicesRevisionHistoryAdapter` will also require:

- `CloudServices` (`@ckeditor/ckeditor5-cloud-services/src/cloudservices`).

## Comments editor configuration required

Since cross-package dependencies inside the project were removed, the configuration for the comments editor became required. Keep in mind that the editor used in comments section is also a CKEditor 5 instance and is configured the same way as the regular editor.

After the update, you should configure the comments editor using `config.comments.editorConfig` option:

```js
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import List from '@ckeditor/ckeditor5-list/src/list';

ClassicEditor.create( document.querySelector( '#editor' ), {
	// ...

	comments: {
		editorConfig: {
			extraPlugins: [ Autoformat, Bold, Italic, List ]
		}
	}
} );
```

<info-box>
	Before the change, the comments editor included `Bold`, `Italic`, `Autoformat` and `List` plugins.

	If you want to keep the same user experience after updating the editor, configure the comments editor as shown in the example above.
</info-box>

If the configuration is not provided, a warning will be logged in the console and the the comments editor will be initialized with the most basic features, that is typing, paragraph and undo.

To hide the warning (and use the basic configuration), provide an empty configuration for the comments editor:

```js
ClassicEditor.create( document.querySelector( '#editor' ), {
	// ...

	comments: {
		editorConfig: {}
	}
} );
```
