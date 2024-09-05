---
menu-title: Migrate testing suite from NPM to CDN in Vanilla JS
meta-title: Vanilla JS CKEditor 5 - migrate testing suite from NPM to CDN | CKEditor 5 documentation
meta-description: Migrate CKEditor 5 testing suite from NPM to CDN in a few simple steps. Learn how to install CKEditor 5 testing suite in your project using the CDN.
category: cloud
order: 22
---

# Migrating CKEditor&nbsp;5 testing suite from NPM to CDN

This guide will help you migrate CKEditor&nbsp;5 testing suite from an NPM-based installation to a CDN-based installation.

## Prerequisites

Ensure that your testing suite uses real web browser environments for testing. If you are using `jsdom` or any other environment without a real DOM, you may need to adjust the testing suite configuration to use a real browser because CDN scripts injection might be not recognized properly in such environments.

## Step 1: Remove CKEditor&nbsp;5 imports

If you have any CKEditor 5 imports in your test files, remove them. For example, remove lines like:

```javascript
import { ClassicEditor, ... } from 'ckeditor5';
import { EasyImage, ... } from 'ckeditor5-premium-features';
```
