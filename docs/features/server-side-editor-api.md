---
category: cloud-services
order: 30
meta-title: Cloud Services Server-side Editor API | CKEditor 5 Documentation
meta-description: Learn how to use server-side API to manage content and collaboration data easily without running the editor on the client side.
modified_at: 2025-06-05
badges: [ premium ]
---

# Server-side editor API

Server-side Editor API enables deep and complex integration of your application with all document data, enabling you to manipulate content and manage collaborative data such as suggestions, comments, and revision history, and much more, directly from your server-side code (without running editor instance on the client).

The server-side editor REST API endpoint allows you to execute any JavaScript code that uses the CKEditor&nbsp;5 API, that could be executed by a browser, but without a need to open the editor by a human user. Instead, the script is executed on the Cloud Services server. Please note that there are some [security-related limitations](https://ckeditor.com/docs/cs/latest/developer-resources/server-side-editor-api/security.html) for the executed JavaScript code.

## Why use server-side editor API?

While CKEditor&nbsp;5 provides a rich client-side editing experience, there are many scenarios where server-side content processing is essential:

* **Automation**: Run content processing tasks as part of your backend workflows.
* **Scalability**: Process multiple documents simultaneously without client-side limitations.
* **Security**: Process sensitive content in a controlled environment without exposing it to client-side manipulation.
* **Performance**: Handle large-scale content operations without impacting the user's browser.
* **Consistency**: Ensure uniform content changes across multiple documents.
* **Integration**: Connect with other server-side systems and databases directly.

## Common use cases

* **Deep integration**: Build custom features that can manage document content and related document data straight from your application UI, without a need to open the editor.
* **Content migration**: Restructure and update references across multiple documents, perfect for website redesigns or content reorganization.
* **Shared content blocks**: Automatically update reusable content (like headers, footers, or common sections) across all documents that use it.
* **Automated review systems**: Build systems that automatically review and suggest content changes, like grammar checks or style improvements.
* **AI-powered editing**: Make automated suggestions while users are actively editing, helping improve content quality.
* **Automated publishing**: Prepare and process content for publication, including formatting, metadata updates, and resolving comments.

## API examples

Below, you will find several examples of practical server-side API applications. There are far more possibilities available.

<info-box info>
	In the examples below we use the {@link module:core/editor/editor~Editor `editor`} variable in many places. While on the client (browser) environment it is not available by default, it is a globally available pointer to the editor's instance on the server. There is no need to set this up when using Cloud Services.
</info-box>

### Getting started with server-side editor API

This guide explains how to write scripts that can be executed through the Server-side Editor API endpoint. The following sections provide examples of such scripts, each demonstrating a specific use case that can be automated on the server side.

For information about setting up and using the endpoint itself, see the complementary [Cloud Services Server-side Editor API](https://ckeditor.com/docs/cs/latest/developer-resources/server-side-editor-api/editor-scripts.html) documentation.

<info-box info>
	Please note you need to have an [editor bundle](https://ckeditor.com/docs/cs/latest/guides/collaboration/editor-bundle.html) uploaded first for the service to work properly.
</info-box>

### Working with content

#### Getting editor data

The most basic action you can perform is getting the editor data.
```js
// Get the editor data.
const data = editor.getData();

// The endpoint will respond with the returned data.
return data;
```

You can also retrieve the data with specific options and include additional information about the document:

```js
// Get the editor data with suggestion highlights visible.
const data = editor.getData( { showSuggestionHighlights: true } );

// Get additional document information.
const wordCount = editor.plugins.get( 'WordCount' ).getWords();

// Return both the content and metadata.
return {
	content: data,
	wordCount: wordCount
};
```

This approach allows you to not only retrieve the document content but also process it, extract metadata, or prepare it for specific use cases like exports or integrations with other systems.

#### Using commands

Commands provide a high-level API to interact with the editor and change the document content. Most editor features provide a command that you can use to trigger some action on the editor.

Here is a simple example. Imagine you need to fix a typo in a company name that is spread across multiple documents. Instead of forcing the user to do it manually, you can do it with a single line of code:

```js
// Replace all instances of "Cksource" with "CKSource" in the document.
editor.execute( 'replaceAll', 'CKSource', 'Cksource' );
```

This command will find all instances of "Cksource" in your documents and change them to "CKSource". This is perfect for making bulk updates in multiple documents. Simply, execute this call for every document you would like to change.

Most CKEditor 5 features expose one or multiple commands that can be used to manipulate the editor's state. To learn what commands are available, visit [Features guides](https://ckeditor.com/docs/ckeditor5/latest/features/index.html), and look for the "Common API" section at the end of each guide, where commands related to that feature are described.

#### Insert HTML content

When you have HTML content ready (for example, from another system or a template), you can insert it directly into the editor. This is often simpler than building the content piece by piece using the editor API.

```js
// The HTML content we want to add.
const html = '<h2>New section</h2><p>This is a <strong>new section</strong> inserted into the document using <u>server-side editor API</u>.</p>';

// Convert HTML to the editor's model.
const model = editor.data.parse( html );

// Get the root element and create an insertion position.
const root = editor.model.document.getRoot();
const insertPosition = editor.model.createPositionAt( root, 1 );

// Insert the content at the specified position.
editor.model.insertContent( model, insertPosition );
```

#### Using editor model API

If you cannot find a command that would perform a specific action on the document, you can use the editor API to apply precise changes. This approach offers the greatest flexibility and should cover any needs you may have. It requires, however, a better understanding of CKEditor internals.

For example, consider a scenario where you need to update all links in your document from `/docs/` to `/documents/`. This is a common task when moving content between environments or updating your site structure.

```js
// Get the root element and create a range that covers all content.
const root = editor.model.document.getRoot();
const range = editor.model.createRangeIn( root );
const items = Array.from( range.getItems() );

editor.model.change( writer => {
	for ( const item of items ) {
		let href = item.getAttribute( 'linkHref' );

		if ( item.is( 'textProxy' ) && href ) {
			// Update the link URL.
			href = href.replace( '/docs/', '/documents/' );
			writer.setAttribute( 'linkHref', href, item );
		}
	}
} );
```

This approach is particularly useful when you have to modify the document data in some specific way, and the generic, high-level API cannot cover it.

To learn more about working with the editor engine, see the {@link framework/architecture/editing-engine Editing engine} guide.

### Working with comments

The {@link features/comments comments} feature allows your users to have discussions attached to certain parts of your documents. You can use the comments feature API to implement interactions with comments with no need to open the editor itself.

#### Creating comments

You can create new comments using the `addCommentThread` command. By default, this command would create a comment thread on the current selection and create a "draft" comment thread, which might not be what you want in a server-side context. However, you can customize it using two parameters: `ranges` to specify where to place the comment, and `comment` to set its initial content.

Here is an example that shows how to automatically add comments to images that are missing the `alt` attribute:

```js
const model = editor.model;
// Create a range on the whole content.
const range = model.createRangeIn( model.document.getRoot() );

editor.model.change( () => {
	// Go through each item in the editor content.
	for ( const item of range.getItems() ) {
		const isImage = item.is( 'element', 'imageBlock' ) || item.is( 'element', 'imageInline' );

		// Find images without `alt` attribute
		if ( isImage && !item.getAttribute( 'alt' ) ) {
			const commentRange = model.createRangeOn( item );
			const firstCommentMessage = 'The <u>alt</u> attribute is missing.';

			// Add a comment on the image.
			editor.execute(
				'addCommentThread',
				{
					ranges: [ commentRange ],
					comment: firstCommentMessage
				}
			);
		}
	}
} );
```

The above example shows how to automatically review your content and add comments where needed. You could use similar code to build automated content review systems, accessibility checkers, or any other validation workflows.

#### Resolving comments

You can use the comments feature API to manage existing comments in your documents. For example, here is a way to resolve all comment threads in a given document:

```js
// Get all comment threads from the document.
const threads = editor.plugins.get( 'CommentsRepository' ).getCommentThreads();

// Resolve all open comment threads.
for ( const thread of threads ) {
	if ( !thread.isResolved ) {
		thread.resolve();
	}
}
```

This code is particularly useful when you need to clean up a document. You might use it to automatically resolve old discussions, prepare documents for publication, or maintain a clean comment history in your content management system.

### Working with track changes

You can leverage the {@link features/track-changes track changes} feature API to manage existing content suggestions, retrieve final document data with all suggestions accepted, or implement automated or AI-powered content reviews.

#### Working with suggestions

You can use the {@link module:track-changes/trackchangesdata~TrackChangesData track changes data plugin} to get the document data with all suggestions either accepted or discarded:

```js
// Get the track changes data plugin.
const trackChangesData = editor.plugins.get( 'TrackChangesData' );

// Get the document data with all suggestions rejected.
// You can also use `trackChangesData.getDataWithAcceptedSuggestions()` to get data with all suggestions accepted.
const data = trackChangesData.getDataWithDiscardedSuggestions();

return data;
```

This is particularly useful when you need to show or process the "original" or the "final" document data.

While the previous example could be used to get the data, you may also want to permanently accept or discard suggestions. You can do this for all suggestions at once using the following command:

```js
// Accept all suggestions in the document.
// Use `discardAllSuggestions` command to discard all suggestions instead.
editor.execute( 'acceptAllSuggestions' );
```

This command is especially helpful when finalizing documents or when working with applications where a document is split into multiple CKEditor document instances but is treated as one unit in the application. In such cases, you might, for example, want to offer a button to accept all suggestions across all document parts.

For more granular control, you can also manage individual suggestions:

```js
// Get the track changes editing plugin.
const trackChangesEditing = editor.plugins.get( 'TrackChangesEditing' );

// Get a specific suggestion by its ID.
const suggestion = trackChangesEditing.getSuggestion( 'suggestion-id' );

// Accept the suggestion.
suggestion.accept();
// Or discard it.
// suggestion.discard();
```

It allows to display and manage suggestions outside the editor, for example in a separate application view where users can see all comments and suggestions and resolve them without going into the editor.

#### Creating new suggestions

Track changes is integrated with most editor commands. If you wish to change the document using commands and track these changes, all you need to do is turn on track changes mode.

Below is an example that shows a basic text replacement:

```js
// Enable track changes to mark our edits as suggestions.
editor.execute( 'trackChanges' );

// Make a simple text replacement.
editor.execute( 'replaceAll', 'CKSource', 'Cksource' );
```

The `trackChanges` command ensures that all changes made by other commands are marked as suggestions.

Since Track changes feature is integrated with `Model#insertContent()` function, you can easily suggest adding some new content:

```js
// Enable track changes for the new content.
editor.execute( 'trackChanges' );

// Prepare the new content to be added.
const modelFragment = editor.data.parse( 'Hello <strong>world!</strong>' );

// Add the content as a suggestion at the beginning of the document.
const firstElement = editor.model.document.getRoot().getChild( 0 );
const insertPosition = editor.model.createPositionAt( firstElement, 0 );

editor.model.insertContent( modelFragment, insertPosition );
```

Now, let's see how to suggest deleting a specified part of the document. To do this, use `Model#deleteContent()` while in track changes mode:

```js
// Enable track changes so that deleted content is marked,
// instead of being actually removed from the content.
editor.execute( 'trackChanges' );

// Get the section we want to mark as deletion suggestion.
const firstElement = editor.model.document.getRoot().getChild( 0 );

// `deleteContent()` expects selection-to-remove as its parameter.
const deleteRange = editor.model.createRangeIn( firstElement );
const deleteSelection = editor.model.createSelection( deleteRange );

// Track changes is integrated with `deleteContent()`, so the content
// will be marked as suggestion, instead of being removed from the document.
editor.model.deleteContent( deleteSelection );
```

You can use `insertContent()` and `deleteContent()` methods in the following scenarios:

* Automated suggestions based on external data.
* Creating templates that need review before finalization.
* Integrating with content management systems to propose changes.
* Building custom workflows for content creation and review.

#### Attribute modifications

If you wish to create attributes suggestions using the editor model API, you need to specifically tell the track changes features to record these changes. Let's look at how to correctly make a suggestion to update links URLs:

```js
// Get the track changes editing plugin for direct access to suggestion recording.
const trackChangesEditing = editor.plugins.get( 'TrackChangesEditing' );

// Get the root element and create a range that covers all content.
const root = editor.model.document.getRoot();
const range = editor.model.createRangeIn( root );
const items = Array.from( range.getItems() );

// Process each item in the document.
for ( const item of items ) {
	editor.model.change( writer => {
		// Use `recordAttributeChanges to ensure the change is properly recorded as a suggestion.
		trackChangesEditing.recordAttributeChanges( () => {
			let href = item.getAttribute( 'linkHref' );

			// Only process text proxies (parts of text nodes) that have a `linkHref` attribute.
			if ( item.is( 'textProxy' ) && href ) {
				// Update the link URL, for example changing '/docs/' to '/documents/'.
				href = href.replace( '/docs/', '/documents/' );

				// Set the new attribute value, which will be recorded as a suggestion.
				writer.setAttribute( 'linkHref', href, item );
			}
		} );
	} );
}
```

#### Extracting additional suggestion data

Track changes feature stores and exposes more data than is saved on the Cloud Services servers. This dynamic data is evaluated by the feature on-the-fly, hence it is not stored. You can use the editor API to get access to that data. 

All active suggestions have a related annotation (UI "balloon" element, located in the sidebar or displayed above the suggestion). You can, for example, retrieve a suggestion label that is displayed inside a suggestion balloon annotation.

Another useful information is content on which the suggestion was made (together with some additional context around it).

The following example demonstrates retrieving additional suggestion data:

```js
const results = [];
const trackChangesUI = editor.plugins.get( 'TrackChangesUI' );
const annotations = editor.plugins.get( 'Annotations' ).collection;

// Go through all annotations available in the document.
for ( const annotation of annotations ) {
	// Check if this is a suggestion annotation.
	// Note, that another annotation type is `'comment'`.
	// You can process comments annotations to retrieve additional comments data.
	if ( annotation.type.startsWith( 'suggestion' ) ) {
		const suggestion = trackChangesUI.getSuggestionForAnnotation( annotation );

		// Get the suggestion label.
		const label = annotation.innerView.description;

		// Evaluate the content on which the suggestion was made.
		// First, get all the ranges in the content related to this suggestion.
		const ranges = [];

		// Note, that suggestions can be organized into "chains" when they
		// are next to each other. Get all suggestions adjacent to the processed one.
		for ( const adjacentSuggestion of suggestion.getAllAdjacentSuggestions() ) {
			ranges.push( ...adjacentSuggestion.getRanges() );
		}

		let contextHtml = '';

		if ( ranges.length ) {
			const firstRange = ranges[ 0 ];
			const lastRange = ranges[ ranges.length - 1 ];

			// Find the common ancestor for the whole suggestion context.
			const commonAncestor = firstRange.start.getCommonAncestor( lastRange.end );

			if ( commonAncestor ) {
				// Stringify the entire common ancestor element as HTML, highlighting suggestions.
				contextHtml = editor.data.stringify( commonAncestor, { showSuggestionHighlights: true } );
			}
		}

		results.push( {
			type: 'suggestion',
			id: suggestion.id,
			label,
			context: contextHtml
		} );
	}
}

return results;
```

### Working with revision history

Use the {@link features/revision-history revision history} feature API to build more functional integration between your application and the document revisions data.

#### Saving revisions

You can use Revision history API to save a new revision directly from your application backend:

```js
// Save the current state as a new revision.
editor.plugins.get( 'RevisionTracker' ).saveRevision( { name: 'New revision' } );
```

This can be used on an unchanged document to simply create a document snapshot, or after you performed some changes to save them as a new revision.

Revision history API can help you build an automated mechanism that will automatically create revisions in some time intervals, or based on other factors. It can be particularly useful when you need to create checkpoints for your documents to maintain an audit trail of content modifications.

#### Working with revision data

In more complex scenarios, you might have a need to work with content coming from various revisions of your document:

```js
// Get the revision management tools.
const revisionHistory = editor.plugins.get( 'RevisionHistory' );
const revisionTracker = editor.plugins.get( 'RevisionTracker' );

// Get the latest revision from history.
const revision = revisionHistory.getRevisions()[ 0 ];

// Get the document content and document roots attributes.
const documentData = await revisionTracker.getRevisionDocumentData( revision );
const attributes = await revisionTracker.getRevisionRootsAttributes( revision );

return { documentData, attributes };
```

This is useful if you need particular revision data for further processing. It will allow you build custom backend features based on revisions, like previewing revisions data outside of editor, exporting a particular revision to PDF, or integrating revisions data with external systems.

## Custom plugins

Server-side editor API capabilities could be extended by creating custom plugins. Custom plugins may implement complex logic and maintain reusable functionality across multiple server-side operations. Through the editor instance, you can access custom plugin API in your server-side scripts. This approach will make your code more organized and maintainable. Using a plugin will be necessary if you need to import a class or a function from one of the CKEditor 5 packages to implement your desired functionality.

To use custom plugins in server-side executed scripts, simply add them to the editor bundle that you upload to Cloud Services. Then you can access them through the editor instance:

```js
// Get your custom plugin instance.
const myPlugin = editor.plugins.get( 'MyCustomPlugin' );

// Use the plugin's API.
return myPlugin.doSomething();
```

For more information about creating custom plugins, see the {@link framework/architecture/plugins Plugins architecture} guide and the {@link tutorials/creating-simple-plugin-timestamp Creating a basic plugin} tutorial.

## Error handling

If an error occurs while processing the script on the server side, the API will return an error message and include the specific information about the encountered problem in the `data.error` object. Additionally, a `trace_id` is returned, which allows you to look up more detailed information about the specific event on the server. This makes it easier to quickly diagnose and resolve issues based on the provided identifier.
