---
category: framework
order: 500
meta-title: Server-Side Editor API | CKEditor 5 Documentation
modified_at: 2025-05-20
---

# Server-Side Editor API

Server-Side Editor API allows for deep and complex integration of your application with document data, enabling you to manipulate content and manage collaborative data such as suggestions, comments, and revision history directly from your server-side code.

## Why Use Server-Side Editor API?

While CKEditor 5 provides a rich client-side editing experience, there are many scenarios where server-side content processing is essential:

* **Security**: Process sensitive content in a controlled environment without exposing it to client-side manipulation
* **Performance**: Handle large-scale content operations without impacting the user's browser
* **Consistency**: Ensure uniform content changes across multiple documents
* **Integration**: Connect with other server-side systems and databases directly
* **Automation**: Run content processing tasks as part of your server workflows
* **Scalability**: Process multiple documents simultaneously without client-side limitations

## Common Use Cases

* **Bulk Content Updates**: Make consistent changes across your entire content base, ideal for updating document templates or standardizing terminology
* **Content Migration**: Restructure and update references across multiple documents, perfect for website redesigns or content reorganization
* **Shared Content Blocks**: Automatically update reusable content (like headers, footers, or common sections) across all documents that use it
* **Dynamic Content**: Periodically update values like stock prices or other real-time data in your documents
* **Automated Review Systems**: Build systems that automatically review and suggest content changes, like grammar checks or style improvements
* **AI-powered Editing**: Make automated suggestions while users are actively editing, helping improve content quality
* **Automated Revision Control**: Track and manage document versions automatically, perfect for maintaining content history and audit trails
* **Automated Publishing**: Prepare and process content for publication, including formatting, metadata updates, and resolving comments
* **Custom Integration**: Connect the editor with your existing systems and workflows, such as CMS or document management systems
* **Automatic Checkpoints**: Create automatic checkpoints in your document

## Getting Started with Server-Side Editor API

This guide shows you how to write scripts that can be executed through the Server-Side Editor API endpoint. The following sections provide examples of such scripts, each demonstrating a specific use case that can be automated on the server side.

For information about setting up and using the endpoint itself, see the {TODO: link Cloud Services Server-side Editor API} documentation.

## Working with Content

### Using Commands

Commands provide a high-level API to interact with the editor and change the document content. Most editor features provide a command that you can use to trigger some action on the editor.

Here's a simple example. Imagine you're working on a document and need to change every instance of "entirely" to "completely". Instead of doing it manually, you can do it with one line of code:

```js
// Replace all instances of "entirely" with "completely" in the document.
editor.execute( 'replaceAll', 'completely', 'entirely' );
```

This one line will find all instances of "entirely" in your document and change them to "completely". This is perfect for making bulk updates in multiple documents. Simply, execute this call for every document you would like to change.

To learn more about commands architecture, visit the [Commands documentation](https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/core-editor-architecture.html#commands).

### Insert HTML Content

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

### Using Editor Model API

If you cannot find a command that would perform a specific action on the document, you can use editor document API to provide precise changes. This approach offers the biggest flexibility and should cover any need you have, although it requires a better understanding of CKEditor internals.

For example, consider a scenario where you need to update all links in your document from `/docs/` to `/documents/`. This is a common task when moving content between environments or updating your site structure.

```js
// Get the root element and create a range that covers all content.
const root = editor.model.document.getRoot();
const range = editor.model.createRangeIn( root );
const items = Array.from( range.getItems() );

// Use model.change to ensure proper undo/redo support.
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

To learn more about working with the editor model, see the {@link framework/architecture/editing-engine Editing engine guide}.

## Working with Track Changes

{@link features/track-changes Track changes} helps you manage content suggestions effectively, for tasks like automating content review, and implementing AI-powered suggestions.

### Using commands

Track changes is integrated with most editor commands, so if you wish to change the document using commands and track these changes, all you need to do is turn on track changes mode.

Let's start with a basic text replacement:

```js
// Enable track changes to mark our edits as suggestions.
editor.execute( 'trackChanges' );

// Make a simple text replacement.
editor.execute( 'replaceAll', 'I', 'you' );
```

The `trackChanges` command ensures that all changes are marked as suggestions, making it easy for others to review and accept or reject them.

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

This pattern is essential when building automated content review systems. You might use it to flag outdated sections, remove deprecated content, or clean up documents before publication. The API gives you precise control over what gets removed and how the changes are tracked.

Similarly, you can suggest adding new content:

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

This approach shines in several real-world scenarios:
* Automatically suggesting content updates based on external data
* Creating templates that need review before finalization
* Integrating with content management systems to propose changes
* Building custom workflows for content creation and review

### Attribute Modifications

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

## Resolving Comments

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

## Working with Revision History

### Basic Revision Management

Here's how to work with the basics of {@link features/revision-history revision history}. When you make changes, you can save them as a new revision:

```js
// Make some changes to the document.
editor.execute( 'replaceAll', 'I', 'you' );

// Save the current state as a new revision.
editor.plugins.get( 'RevisionTracker' ).saveRevision( { name: 'New revision' } );
```

This approach is essential for maintaining a clear history of your document's evolution. It's particularly useful when you need to create checkpoints in your work or maintain an audit trail of content modifications.

### Working with Revision Data

For more advanced scenarios, you might need to work with different revisions of your document:

```js
// Get the revision management tools.
const revisionHistory = editor.plugins.get( 'RevisionHistory' );
const revisionTracker = editor.plugins.get( 'RevisionTracker' );

// Get the first revision from history.
const revision = revisionHistory.getRevisions()[ 0 ];

// Get the content and attributes of the revision.
const documentData = await revisionTracker.getRevisionDocumentData( revision );
const attributes = await revisionTracker.getRevisionRootsAttributes( revision );

return { documentData, attributes };
```

This is useful if you need particular revision data for further processing. It will allow you build custom back-end features based on revisions, like previewing revisions data outside of editor, exporting a particular revision to PDF, or integrating revisions data with external systems.
