# Free features test

This sample demonstrates CKEditor 5 with **free commercial plan plugins** - the features available in the free commercial plan without OSS and premium plugins.

## Editor

This sample shows the available features in the free commercial plan (CDN). Several features have been disabled as they are not included in the free plan.

We don't use CDN here, we just want to mock how such editor works and feels.

---

### Disabled Features

The following 18 features are **not available** in the free commercial plan:

- **Full page HTML** - Complete HTML page editing
- **HTML embed** - Custom HTML embedding
- **Restricted editing** - Content editing restrictions
- **Paste From Office** - Enhanced Office document pasting
- **Word count** - Character and word counting
- **Find and replace** - Text search and replace functionality
- **Bookmarks** - Document bookmarking
- **Multi-root editor** - Multiple editable areas
- **List Properties** - Advanced list formatting options
- **Simple Upload Adapter** - Basic file upload functionality
- **Base64 adapter** - Base64 image encoding
- **Image Resize** - Image resizing capabilities
- **Table and cell properties** - Advanced table formatting
- **Layout tables** - Table layout functionality
- **Column resize** - Table column resizing
- **Page break** - Page break insertion
- **Remove format** - Format removal tool
- **Special characters** - Special character insertion


---

## Action buttons

- Clear editor - calls `editor.setData( '' )`
- Turn on/off read-only mode - toggle read-only mode

---

## Note about free features

This sample excludes premium plugins and advanced features that are only available in paid plans. The features shown here represent what's available in the free commercial plan of CKEditor 5.
