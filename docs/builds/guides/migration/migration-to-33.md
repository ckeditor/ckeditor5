---
category: builds-migration
menu-title: Migration to v32.x
order: 92
modified_at: 2021-12-10
---

# Migration to CKEditor 5 v33.0.0

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Migration to CKEditor 5 v33.0.0

For the entire list of changes introduced in version 32.0.0, see the [changelog for CKEditor 5 v33.0.0](TODO).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v33.0.0.

## Changes of imports in CKEditor 5 Collaboration Features

As a result of introducing supports for DLL builds in collaboration features, some imports had to be changed to allow the new building process. From now, new plugins will be required when adding some of the CKEditor 5 collection features:

Adding `TrackChanges` will require also adding these plugins to the build:

- `Comments` (`@ckeditor/ckeditor5-comments/src/comments`)

Adding `RealTimeCollaborativeEditing` will require also adding these plugins to the list of editor plugins:

- `CloudServices` (`@ckeditor/ckeditor5-cloud-services/src/cloudservices`)

Adding `RealTimeCollaborativeComments` will require also adding these plugins to the list of editor plugins:

- `CloudServices` (`@ckeditor/ckeditor5-cloud-services/src/cloudservices`),
- `Comments` (`@ckeditor/ckeditor5-comments/src/comments`)

Adding `RealTimeCollaborativeTrackChanges` will require also adding these plugins to the list of editor plugins:

- `CloudServices` (`@ckeditor/ckeditor5-cloud-services/src/cloudservices`),
- `Comments` (`@ckeditor/ckeditor5-comments/src/comments`),
- `TrackChanges` (`@ckeditor/ckeditor5-track-changes/src/trackchanges`)

Adding `RealTimeCollaborativeRevisionHistory` will require also adding these plugins to the list of editor plugins:

- `CloudServices` (`@ckeditor/ckeditor5-cloud-services/src/cloudservices`)

Adding `CloudServicesCommentsAdapter` will require also adding these plugins to the list of context plugins:

- `CloudServices` (`@ckeditor/ckeditor5-cloud-services/src/cloudservices`),
- `CommentsRepository` (`@ckeditor/ckeditor5-comments/src/comments/commentsrepository`)

Adding `CloudServicesTrackChangesAdapter` will require also adding these plugins to the list of context plugins:

- `CloudServices` (`@ckeditor/ckeditor5-cloud-services/src/cloudservices`),
- `CommentsRepository` (`@ckeditor/ckeditor5-comments/src/comments/commentsrepository`),
- `TrackChangesEditing` (`@ckeditor/ckeditor5-track-changes/src/trackchangesediting`)

Adding `CloudServicesRevisionHistoryAdapter` will require also adding these plugins to the list of context plugins:

- `CloudServices` (`@ckeditor/ckeditor5-cloud-services/src/cloudservices`)

## Comments editor configuration required

As a result of the removed cross-package dependencies inside the project, the configuration for the comments feature became required. Now, the user should configure the comments feature plugin list by themself:

import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import List from '@ckeditor/ckeditor5-list/src/list';

ClassicEditor.create( document.querySelector( '#editor' ), {
	// Other configurations...

	comments: {
		editorConfig: {
			extraPlugins: [ Autoformat, Bold, Italic, List ]
		}
	}
} );

Not providing the comments feature configuration will now result in a console warning: `Missing comments editor configuration (`comments.editorConfig`). Default configuration will be used instead`.

To hide the warning it is possible to provide the empty configuration for the comments feature:

ClassicEditor.create( document.querySelector( '#editor' ), {
	// Other configurations...

	comments: {
		editorConfig: {}
	}
} );

Note thought, that the new editor for comments will not provide `Bold`, `Italic`, `Autoformat` and `List` plugins out of the box like it has done previously.
