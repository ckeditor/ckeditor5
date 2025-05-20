---
category: framework
order: 500
meta-title: Server-Side Editor API | CKEditor 5 Documentation
modified_at: 2024-03-19
---

# Server-Side Editor API

The Server-Side Editor API enables you to execute editor operations directly on your server. This means you can manipulate content and manage collaborative data such as suggestions, comments, and revision history - all from your server-side code.

## Why Use Server-Side Editor API?

While CKEditor 5 provides a rich client-side editing experience, there are many scenarios where server-side content processing is essential:

- **Security**: Process sensitive content in a controlled environment without exposing it to client-side manipulation
- **Performance**: Handle large-scale content operations without impacting the user's browser
- **Consistency**: Ensure uniform content changes across multiple documents
- **Integration**: Connect with other server-side systems and databases directly
- **Automation**: Run content processing tasks as part of your server workflows
- **Scalability**: Process multiple documents simultaneously without client-side limitations

## Key Benefits

- **Deep Integration**: Seamlessly connect your application with document data
- **Automated Processing**: Handle content changes programmatically
- **Bulk Operations**: Process multiple documents efficiently
- **Custom Workflows**: Build tailored content management solutions

## Common Use Cases

- **Automated Review Systems**: Build systems that automatically review and suggest content changes
- **Content Migration**: Update content structure and references across multiple documents
- **Bulk Content Updates**: Make consistent changes across your entire content base
- **Custom Integration**: Connect the editor with your existing systems and workflows
- **Automated Publishing**: Prepare and process content for publication
- **Content Analysis**: Analyze and improve content quality automatically
- **Real-time Processing**: Update documents during live editing sessions
- **AI-powered Editing**: Make automated suggestions while users are actively editing
- **Shared Content Blocks**: Update multiple documents when source content changes
- **Dynamic Content**: Periodically update values like stock prices or other real-time data

## Getting Started with Server-Side Editor API

The following sections provide practical examples of how to use the Server-Side Editor API. Each example demonstrates a specific use case and includes:

- A clear explanation of what the code does
- Step-by-step implementation details
- Real-world scenarios where the solution is useful

The examples progress from basic operations to more complex scenarios, helping you understand how to build powerful server-side content processing solutions.

## Working with Content

### Simple Text Changes

Let's start with something simple. Imagine you're working on a document and need to change every instance of "entirely" to "completely". Instead of doing it manually, you can do it with one line of code:

```js
// Replace all instances of "entirely" with "completely" in the document.
editor.execute( 'replaceAll', 'entirely', 'completely' );
```

This one line will:
- Find all instances of "entirely" in your document
- Change each one to "completely"
- Keep all the formatting around the changed text

This is perfect for fixing typos, updating old terms, or making any bulk changes to your text.

### Updating Links in Your Document

Now, let's try something more complex. Imagine you need to update all links in your document from `/docs/` to `/documents/`. This is a common task when moving content between environments or updating your site structure.

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

This approach is particularly useful when you need to:
- Update many links at once
- Fix broken links across your content
- Change link patterns in bulk

### Adding Complex HTML Content

Let's say you need to add a pre-made section to your document. This is useful when you want to add templates, import content from other systems, or create dynamic content.

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

This is perfect for:
- Adding content from other places
- Inserting ready-made templates
- Adding content from the clipboard

## Working with Track Changes

Let's explore how to work with track changes in your documents. While the editor's UI is great for manual edits, the API is perfect for automating suggestions or making bulk changes. For more information about {@link features/track-changes track changes}, see the documentation.

### Text Modifications

Let's start with a basic text replacement:

```js
// Enable track changes to mark our edits as suggestions.
editor.execute( 'trackChanges' );

// Make a simple text replacement.
editor.execute( 'replaceAll', 'I', 'you' );
```

This approach is particularly useful when:
- You're building an automated review system or custom UI for content review
- You need to process suggestions across multiple documents or sections
- You want to integrate suggestion creation with your own workflow
- You're implementing AI-powered suggestions or automated content updates
- You need to handle shared content blocks and dynamic values

This is perfect for automated content updates. For example, you might use it to standardize terminology across multiple documents or update outdated references in your content. The `trackChanges` command ensures that your changes are marked as suggestions, making it easy for others to review and accept or reject them. It's also ideal for implementing AI-powered suggestions that appear in real-time during collaborative editing sessions.

### Content Structure Changes

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
- Automatically suggesting content updates based on external data
- Creating templates that need review before finalization
- Integrating with content management systems to propose changes
- Building custom workflows for content creation and review

### Attribute Modifications

Sometimes you need more advanced control over how your changes are recorded, especially when working with attributes. Let's look at how to suggest attribute changes, like updating link URLs:

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

## Working with Comments

{@link features/comments Comments} are a great way to discuss changes with your team. Let's see how to work with them:

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

Let's start with the basics of {@link features/revision-history revision control}. When you make changes, you can save them as a new revision:

```js
// Make some changes to the document.
editor.execute( 'replaceAll', 'I', 'you' );

// Save the current state as a new revision.
editor.plugins.get( 'RevisionTracker' ).saveRevision( { name: 'New revision' } );
```

This approach is essential for maintaining a clear history of your document's evolution. It's particularly useful when you need to track changes over time, create checkpoints in your work, or maintain an audit trail of content modifications.

### Working with Revision Data

Now, let's try something more complex. Let's say you need to work with different revisions of your document:

```js
// Get the revision management tools.
const revisionHistory = editor.plugins.get( 'RevisionHistory' );
const revisionTracker = editor.plugins.get( 'RevisionTracker' );

// Get the first revision from history.
const revision = revisionHistory.getRevisions()[ 0 ];

// Get the content and attributes of the revision.
const documentData = await revisionTracker.getRevisionDocumentData( revision );
const attributes = await revisionTracker.getRevisionRootsAttributes( revision );
```

This is useful when you want to:
- Compare revisions
- Export them
- Build your own features
- Retrieve and process document data of a given revision
- Restore revisions server-side, possibly across multiple documents
- Integrate revision data with external systems
