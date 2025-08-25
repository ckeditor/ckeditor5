# CKEditor 5 Tests

## Test Runner Requirements

**Important**: Test runners no longer support running tests from the root directories. All tests must be placed in an appropriate package within the `packages/` directory structure.

### Test Placement

Tests should be organized within their respective packages following this structure:

```
packages/
├── ckeditor5-package-name/
│   ├── src/
│   │   └── [source files]
│   └── tests/
│       └── [test files]
```
