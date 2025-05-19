---
category: framework
order: 500
meta-title: Advanced CKEditor 5 How-tos | CKEditor 5 Documentation
modified_at: 2024-03-19
---

# Advanced How-tos

In this guide, we'll explore how to solve common challenges in CKEditor 5 by using API. Whether you're building custom features, working on server-side integrations, or need to automate content changes, these examples will show you how to do it.

You might need these solutions when:
- Building your own plugins or features
- Creating server-side scripts to process content
- Automating content updates across many documents
- Integrating the editor with other systems

We'll start with simple tasks and work our way up to more complex scenarios. Each example includes real-world use cases and step-by-step explanations.

## Working with Content

### Simple Text Changes

Let's start with something simple. Imagine you're working on a document and need to change every instance of "entirely" to "completely". Instead of doing it manually, you can do it with one line of code:

```js
// Replace all instances of "entirely" with "completely" in the document.
editor.execute( 'replaceAll', 'entirely', 'completely' );
```

That's it! This one line will:
- Find all instances of "entirely" in your document
- Change each one to "completely"
- Keep all the formatting around the changed text

This is perfect for fixing typos, updating old terms, or making any bulk changes to your text.

### Updating Links in Your Document

Now, let's try something more complex. Imagine you need to update all links in your document from `/docs/` to `/documents/`. This is a common task when moving content between environments or updating your site structure.

First, we need to get all the content from the document and prepare it for changes:

```js
// Get the root element and create a range that covers all content.
const root = editor.model.document.getRoot();
const range = editor.model.createRangeIn( root );
const items = Array.from( range.getItems() );
```

Then, we'll update each link we find:

```js
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

First, we need to prepare our HTML content and convert it to the editor's format:

```js
// The HTML content we want to add.
const html = '<h2>New section</h2><p>This is a <strong>new section</strong> inserted into the document using <u>server-side editor API</u>.</p>';

// Convert HTML to the editor's model.
const model = editor.data.parse( html );
```

Then, we'll find where to insert it and add the content:

```js
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

## Working with Suggestions and Comments

### Simple Suggestions

Let's start with the basics of suggestions. While the editor's UI is great for manual edits, the API is perfect for automating suggestions or making bulk changes. This is useful when:
- You're building an automated review system
- You need to suggest changes to multiple documents at once
- You want to integrate suggestion creation with your own workflow
- You're creating a custom UI for content review

Here's a simple example of how to make a text replacement as a suggestion:

```js
// Enable track changes to mark our edits as suggestions.
editor.execute( 'trackChanges' );

// Make a simple text replacement.
editor.execute( 'replaceAll', 'I', 'you' );
```

This approach is particularly useful for automated content updates. For example, you might use it to standardize terminology across multiple documents or update outdated references in your content. The `trackChanges` command ensures that your changes are marked as suggestions, making it easy for others to review and accept or reject them.

### Making Complex Suggestions

Now that we understand why we might want to use the API for suggestions, let's look at more complex scenarios.

**Scenario 1: Removing Content as a Suggestion**

When you need to programmatically suggest content removal, here's how to do it:

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

**Scenario 2: Adding New Content as a Suggestion**

Similarly, when you need to programmatically add content as suggestions, here's how:

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

### Managing Comments

Comments are a great way to discuss changes with your team. Let's see how to work with them.

First, we'll get all the comment threads, then resolve any open ones:

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

## Working with Revisions

Let's start with the basics of revision control. When you make changes, you can save them as a new revision.

First, make your changes, then save them as a new revision:

```js
// Make some changes to the document.
editor.execute( 'replaceAll', 'I', 'you' );

// Save the current state as a new revision.
editor.plugins.get( 'RevisionTracker' ).saveRevision( { name: 'New revision' } );
```

This approach is essential for maintaining a clear history of your document's evolution. It's particularly useful when you need to track changes over time, create checkpoints in your work, or maintain an audit trail of content modifications.

### Working with Revision Data

Now, let's try something more complex. Let's say you need to work with different revisions of your document. This is useful when you want to compare revisions, export them, or build your own features.

First, we'll get the necessary tools and the revision we want to work with:

```js
// Get the revision management tools.
const revisionHistory = editor.plugins.get( 'RevisionHistory' );
const revisionTracker = editor.plugins.get( 'RevisionTracker' );

// Get the first revision from history.
const revision = revisionHistory.getRevisions()[0];
```

Then, we can get all the data from that revision:

```js
// Get the content and attributes of the revision.
const documentData = await revisionTracker.getRevisionDocumentData( revision );
const attributes = await revisionTracker.getRevisionRootsAttributes( revision );
```

This data can be used in many ways, such as:
- Saving data to your database
- Comparing different revisions
- Building your own features
