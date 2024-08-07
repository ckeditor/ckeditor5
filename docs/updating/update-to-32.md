---
category: update-guides
meta-title: Update to version 32.x | CKEditor 5 Documentation
menu-title: Update to v32.x
order: 92
modified_at: 2021-12-10
---

# Update to CKEditor&nbsp;5 v32.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v32.0.0

_Released on January 31, 2022._

For the entire list of changes introduced in version 32.0.0, see the [release notes for CKEditor&nbsp;5 v32.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v32.0.0).

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v32.0.0.

### Bump of minimal version of Node.js to 14.x

[Node.js 12 ends its long-term support in April 2022](https://nodejs.org/en/about/releases/). Because of that, starting from v32.0.0, the minimal version of Node.js required by CKEditor&nbsp;5 will be 14.

### The `ListStyle` plugin is now deprecated

Due to the introduction of the new {@link features/lists#list-properties list properties}, the `ListStyle` plugin used so far became obsolete as it was replaced by the {@link module:list/listproperties~ListProperties `ListProperties`} plugin. Refer to the {@link features/lists##list-properties-2 list feature installation guide} for details on how to handle the upgrade.

### Revision history

The revision history feature was adapted to the upcoming support for real-time editing integration. Unfortunately, this introduced several breaking changes for the asynchronous integrations as well. You can find the migration instructions below. We also recommend revisiting the {@link features/revision-history-integration revision history integration guide}.

In case of any problems with migrating to CKEditor&nbsp;5 v32.0.0, [contact our support team](https://ckeditor.com/contact/).

#### Revisions data

The revision model has changed along with the list of properties stored in the database. Below is the summary of the changes:

* New properties {@link module:revision-history/revision~Revision#fromVersion `#fromVersion`} and {@link module:revision-history/revision~Revision#toVersion `#toVersion`} were added and need to be stored in your database. For existing revisions, set the value of these properties to `0`.
* Revision ID for the initial revision will be set to the document ID or to the `'initial'` value. Make sure that you either set the `collaboration.channelId` configuration variable or allow for storing multiple revisions with the same ID (among different documents).
* The `Revision#isLocked` property was removed as it is no longer needed. You may remove it from the revisions saved in your database.
* The `Revision#data` property was renamed to {@link module:revision-history/revision~Revision#diffData `#diffData`}. Rename this property for revisions stored in your database.

Please **adjust your integration so that the revision data is properly saved in your database**.

#### Revision history adapter

The adapter interface has changed:

The `RevisionHistoryAdapter#getRevisions()` method was removed. You will need to fetch and add the revisions data directly in the adapter:

```js
/* Before v32.0.0 */
class RevisionHistoryIntegration extends Plugin {
	init() {
		const revisionHistory = editor.plugins.get( 'RevisionHistory' );

		// ...

		revisionHistory.adapter = {
			getRevisions: () => {
				return this._getRevisions();
			}
			// ...
		};
	}

	_getRevisions() {
		// An example of an asynchronous call to the database
		// that fetches the revisions data for the document.
		// Do not return the `diffData` property for these revisions!
		return fetch( /* ... */ ).then( /* ... */ );
	}
}
```
```js
/* After v32.0.0 */
class RevisionHistoryIntegration extends Plugin {
	async init() {
		const revisionHistory = editor.plugins.get( 'RevisionHistory' );

		// ...

		revisionHistory.adapter = {
			// ...
		};

		const revisionsData = await this._getRevisions();

		for ( const revisionData of revisionsData ) {
			revisionHistory.addRevisionData( revisionData );
		}
	}

	_getRevisions() {
		return fetch( /* ... */ ).then( /* ... */ );
	}
}
```

Keep in mind that you can still pass the revisions data (`revisionsData`) straight in the web page source instead of making an asynchronous call.

The adapter methods `#addRevision()` and `#updateRevision()` were removed in favor of {@link module:revision-history/revisionhistoryadapter~RevisionHistoryAdapter#updateRevisions `#updateRevisions()`} which needs to be implemented. The new method updates and/or saves one or multiple revisions in a single request. The input parameter is an array of objects containing revisions data. These may be either new revisions or existing revisions. Every object contains a revision ID, which should be checked to verify if a given revision already exists in your database. For new revisions, the data object contains all revision data. For existing revisions, only updated properties are passed:

```js
/* Before v32.0.0 */
const revisionHistory = editor.plugins.get( 'RevisionHistory' );

revisionHistory.adapter = {
	// ...
	addRevision: ( revisionData ) => {
		// `revisionData` contains the data for a new revision.
		// Make an asynchronous call to you backend that will save the revision.
		return fetch( /* ... */ );
	},
	updateRevision: ( revisionData ) => {
		// `revisionData` contains updated data for an existing revision.
		// Make an asynchronous call to you backend that will update the revision.
		return fetch( /* ... */ );
	}
};
```
```js
/* After v32.0.0 */
const revisionHistory = editor.plugins.get( 'RevisionHistory' );

revisionHistory.adapter = {
	// ...
	updateRevisions: ( revisionsData ) => {
		// `revisionsData` contains one or multiple
		// revision data objects for new and/or updated revisions.
		//
		// Make one asynchronous call to your backend that will update all the revisions.
		return fetch( /* ... */ );
	}
};
```

#### Revision history API and autosave integration

The `RevisionTracker#updateRevision()` method was removed in favor of {@link module:revision-history/revisiontracker~RevisionTracker#update `#update()`} and {@link module:revision-history/revisiontracker~RevisionTracker#saveRevision `#saveRevision()`}.

Before, `#updateRevision()` could either update the most recent revision or create a new revision (if the most recent revision was locked earlier). Now, the {@link features/revision-history-integration#how-revisions-are-updated-and-saved revision lifecycle} was simplified and "locking" is no longer needed. The `#updateRevision()` utility was split into two, more "precise" methods, that more clearly communicate the outcome of their use. We believe that the new approach is easier to understand.

```js
/* Before v32.0.0 */
const revisionTracker = editor.plugins.get( 'RevisionTracker' );

// Update the most recent revision with the newest document changes:
revisionTracker.updateRevision();
// Lock the most recent revision so that new changes cannot be added to it:
revisionTracker.updateRevision( { name: 'My revision', isLocked: true } );
// New changes would be added to a new revision
// (with or without specifying the revision name):
revisionTracker.updateRevision();
// Naming revision automatically locked it.
revisionTracker.updateRevision( { name: 'Another revision' } );
```
```js
/* After v32.0.0 */
const revisionTracker = editor.plugins.get( 'RevisionTracker' );

// Update the most recent revision with the unsaved document changes:
revisionTracker.update();
// Save all unsaved changes as a new revision:
revisionTracker.saveRevision( { name: 'My revision' } );
// After some time, new changes can be added as unsaved changes or as a new revision:
revisionTracker.update();
revisionTracker.saveRevision( { name: 'Another revision' } );
```

These methods may have been used in your autosave integration. Please refer to the documentation to see updated {@link features/revision-history-integration#autosave-integration autosave integration examples}.
