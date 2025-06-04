---
category: framework
order: 500
meta-title: Server-side Editor API | CKEditor 5 Documentation
modified_at: 2025-06-04
---

# Server-side editor API

Server-side Editor API enables deep and complex integration of your application with all document data, enabling you to manipulate content and manage collaborative data such as suggestions, comments, and revision history, and much more, directly from your server-side code.

The remote script REST API endpoint allows you to execute any JavaScript code that uses the CKEditor 5 API, that could be executed by a browser, but without a need to open the editor by a human user. Instead, the script is executed on the Cloud Services server.

## Why use server-side editor API?

While CKEditor 5 provides a rich client-side editing experience, there are many scenarios where server-side content processing is essential:

* **Automation**: Run content processing tasks as part of your server workflows.
* **Scalability**: Process multiple documents simultaneously without client-side limitations.
* **Security**: Process sensitive content in a controlled environment without exposing it to client-side manipulation.
* **Performance**: Handle large-scale content operations without impacting the user's browser.
* **Consistency**: Ensure uniform content changes across multiple documents.
* **Integration**: Connect with other server-side systems and databases directly.

## Common use cases

* **Content migration**: Restructure and update references across multiple documents, perfect for website redesigns or content reorganization.
* **Shared content blocks**: Automatically update reusable content (like headers, footers, or common sections) across all documents that use it.
* **Automated review systems**: Build systems that automatically review and suggest content changes, like grammar checks or style improvements.
* **AI-powered editing**: Make automated suggestions while users are actively editing, helping improve content quality.
* **Automated publishing**: Prepare and process content for publication, including formatting, metadata updates, and resolving comments.

## Getting started with server-side editor API

This guide explains how to write scripts that can be executed through the Server-side Editor API endpoint. The following sections provide examples of such scripts, each demonstrating a specific use case that can be automated on the server side.

For information about setting up and using the endpoint itself, see the {TODO: link Cloud Services Server-side Editor API} documentation.

## Working with content

### Getting editor data

The most basic action you can perform is getting the editor's data:

```js
// Get the editor data.
const data = editor.getData();

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

### Using commands

Commands provide a high-level API to interact with the editor and change the document content. Most editor features provide a command that you can use to trigger some action on the editor.

Here's a simple example. Imagine you need to fix a typo in a company name that is spread across multiple documents. Instead of forcing the user to do it manually, you can do it with one line of code:

```js
// Replace all instances of "Cksource" with "CKSource" in the document.
editor.execute( 'replaceAll', 'CKSource', 'Cksource' );
```

This one line will find all instances of "Cksource" in your document and change them to "CKSource". This is perfect for making bulk updates in multiple documents. Simply, execute this call for every document you would like to change.

To learn more about commands architecture, visit the [Commands documentation](https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/core-editor-architecture.html#commands).

### Insert HTML content

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

### Using editor model API

If you cannot find a command that would perform a specific action on the document, you can use the editor API to apply precise changes. This approach offers the biggest flexibility and should cover any need you have, although it requires a better understanding of CKEditor internals.

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

This approach is particularly useful when you need to update many links at once or fix broken links across your content.

To learn more about working with the editor engine, see the {@link framework/architecture/editing-engine Editing engine} guide.

## Working with track changes

You can leverage {@link features/track-changes Track changes} feature API to manage existing content suggestions, retrieve final document data with all suggestions accepted, or implement automated or AI-powered content reviews.

### Using commands

Track changes is integrated with most editor commands. If you wish to change the document using commands and track these changes, all you need to do is turn on track changes mode.

Let's start with a basic text replacement:

```js
// Enable track changes to mark our edits as suggestions.
editor.execute( 'trackChanges' );

// Make a simple text replacement.
editor.execute( 'replaceAll', 'CKSource', 'Cksource' );
```

The `trackChanges` command ensures that all changes made by other commands are marked as suggestions.

### Content changes

Now, let's look at how to suggest content removal:

```js
// Enable track changes to mark our edits as suggestions.
editor.execute( 'trackChanges' );

// Get the section we want to remove and prepare for deletion.
const firstElement = editor.model.document.getRoot().getChild( 0 );
const deleteRange = editor.model.createRangeIn( firstElement );
const deleteSelection = editor.model.createSelection( deleteRange );

// Remove the content as a suggestion.
editor.model.deleteContent( deleteSelection );
```

This functionality is essential when building e.g. automated content review systems. You might use it to precisely mark any content that should be removed. All content inside `deleteSelection` will become a deletion suggestion.

You can also suggest adding new content:

```js
// Enable track changes for the new content.
editor.execute( 'trackChanges' );

// Prepare the new content we want to add.
const modelFragment = editor.data.parse( 'Hello <strong>world!</strong>' );

// Add the content as a suggestion at the beginning of the document.
const firstElement = editor.model.document.getRoot().getChild( 0 );
const insertPosition = editor.model.createPositionAt( firstElement, 0 );

editor.model.insertContent( modelFragment, insertPosition );
```

The `insertContent()` method can be used in following scenarios:

* Automated suggestions based on external data.
* Creating templates that need review before finalization.
* Integrating with content management systems to propose changes.
* Building custom workflows for content creation and review.

### Working with suggestions

You can use the {@link module:track-changes/trackchangesdata~TrackChangesData track changes data plugin} to get the document data with all suggestions either accepted or rejected:

```js
// Get the track changes data plugin.
const trackChangesData = editor.plugins.get( 'TrackChangesData' );

// Get the document data with all suggestions rejected.
// You can also use `trackChangesData.getDataWithAcceptedSuggestions()` to get data with all suggestions accepted.
const data = trackChangesData.getDataWithDiscardedSuggestions();

return data;
```

This is particularly useful when you need to process the "original" or the "final" document data, i.e. as if pending suggestions were discarded or accepted.

While the previous example could be used to get the data, you may also want to permanently accept or discard suggestions. You can do this for all suggestions at once using the following command:

```js
// Accept all suggestions in the document.
// Use `discardAllSuggestions` command to discard all suggestions instead.
editor.execute( 'acceptAllSuggestions' );
```

This command is especially helpful when finalizing documents or when working with applications where a document is split into multiple CKEditor document instances but is treated as one unit in the application. In such cases, you might want to e.g. offer a button to accept all suggestions across all document parts.

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

It allows to display and manage suggestions outside of the editor, for example in a separate application view where users can see all comments and suggestions and resolve them without going into the editor.

### Attribute modifications

If you wish to create attributes suggestions using the editor model API, you need to specifically tell track changes features to record these changes. Let's look how to correctly make a suggestion to update links URLs:

```js
// Get the track changes editing plugin for direct access to suggestion recording.
const tcEditing = editor.plugins.get( 'TrackChangesEditing' );

// Get the root element and create a range that covers all content.
const root = editor.model.document.getRoot();
const range = editor.model.createRangeIn( root );
const items = Array.from( range.getItems() );

// Process each item in the document.
for ( const item of items ) {
    editor.model.change( writer => {
        // Use _recordAttributeChanges to ensure the change is properly recorded as a suggestion.
        tcEditing._recordAttributeChanges( () => {
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

## Resolving comments

{@link features/comments Comments} feature allows your users to have discussions on certain parts of your documents. You can use Comments feature API to implement interactions with comments with no need to open the editor itself.

For example, here's how to resolve all comment threads in a given document:

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

This code is particularly useful when you need to clean up a document before finalizing it. You might use it to automatically resolve old discussions, prepare documents for publication, or maintain a clean comment history in your content management system.

## Working with revision history

Use {@link features/revision-history Revision history} feature API to build more functional integration between your application and the document revisions data.

### Saving revisions

You can use Revision history API to save a new revision directly from your application back-end:

```js
// Save the current state as a new revision.
editor.plugins.get( 'RevisionTracker' ).saveRevision( { name: 'New revision' } );
```

This can be used on an unchanged document just to create a document snapshot, or after you performed some changes to save them as a new revision.

Revision history API can help you build an automated mechanism that will automatically create revisions in some time intervals, or based on other factors. It can be particularly useful when you need to create checkpoints for your documents to maintain an audit trail of content modifications.

### Working with revision data

For more advanced scenarios, you might need to work with different revisions of your document:

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

This is useful if you need particular revision data for further processing. It will allow you build custom back-end features based on revisions, like previewing revisions data outside of editor, exporting a particular revision to PDF, or integrating revisions data with external systems.

## Custom plugins

Server-side editor API capabilities could be extended by creating custom plugins. Custom plugins may implement complex logic and maintain reusable functionality across multiple server-side operations. Through the editor instance, you can access custom plugin API in your server-side scripts. This approach will make your code more organized and maintainable. It is especially recommended for complex operations that would be cumbersome to implement directly in the server-side script.

To use custom plugins in server-side executed scripts, simply add them to the editor bundle that you upload to Cloud Services. Then you can access them through the editor instance:

```js
// Get your custom plugin instance.
const myPlugin = editor.plugins.get( 'MyCustomPlugin' );

// Use the plugin's API.
return myPlugin.doSomething();
```

For more information about creating custom plugins, see the {@link framework/architecture/plugins Plugins architecture} guide and the {@link tutorials/creating-simple-plugin-timestamp Creating a basic plugin} tutorial.
