---
category: builds-migration
menu-title: Migration to v28.0.0
order: 10
---

# Migration to CKEditor 5 v28.0.0

For the entire list of changes introduced in version 28.0.0, see the [changelog for CKEditor 5 v28.0.0](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md#TODO).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v28.0.0.

## Disallowing nesting tables

Prior to version 28.0.0 inserting a table into another table was not allowed.

If you wish to bring back this restriction see {@link features/table#disallowing-nesting-tables "Disallowing nesting tables"}.

## Disallowing nesting block quotes

Prior to version 28.0.0 inserting block quote into a block quote was not allowed.

If you wish to bring back the old behavior see {@link features/block-quote#disallowing-nesting-block-quotes "Disallowing nesting block quotes"}.
