# Code Quality Baseline

## Overview
This document establishes the baseline for code quality metrics as of **January 10, 2025**.
The goal is to prevent regression while gradually improving quality over time.

## Current Baselines (January 10, 2025)

### Frontend (TypeScript/React)
- **TypeScript Errors**: ~445 errors (mostly type definition issues)
- **ESLint Issues**: ~303 errors/warnings (mostly unused variables)
- **Test Failures**: ~118 failing tests (integration issues, missing providers)
- **Test Coverage**: TBD (will establish in Phase 2)

### Backend (Python/FastAPI)
- **Flake8 Issues**: ~43 issues (formatting and style)
- **MyPy Coverage**: TBD (will enable per-module in Phase 2)

### Key Issue Categories
1. **Type Definition Issues**: Missing properties in interfaces, implicit any types
2. **Unused Variable Warnings**: Development artifacts, commented code
3. **Test Integration**: Missing context providers, outdated test expectations
4. **Code Style**: Formatting inconsistencies, import order

## Quality Gate Strategy

### Phase 0 (Current) - Stabilize and Baseline
✅ **Status**: COMPLETED
- ✅ Pin toolchain versions (Node 22.16.0, Python 3.11.9)
- ✅ Document current error counts (445 TS, 303 ESLint, 118 test failures)
- ✅ Set up pre-commit hooks (already configured and updated)
- ✅ Create validation scripts (`./bin/validate`)
- ✅ Create secrets baseline (`.secrets.baseline`)
- ✅ Update pre-commit to latest versions

### Phase 1 (Next 1-2 weeks) - Enforce for Changed Code
- Pre-commit hooks mandatory for new/touched code
- CI warns but doesn't block on legacy issues
- Target: Zero new issues in changed files

### Phase 2 (2-4 weeks) - Ratchet and Expand
- Establish coverage baseline and ratchets
- Tighten linting rules incrementally
- Begin typing campaign for backend

### Phase 3 (Ongoing) - Normalize and Harden
- All quality gates blocking
- Remove per-file ignores
- Maintain high standards

## Toolchain Versions (Pinned)

### Frontend
- Node.js: 22.16.0 ✅
- npm: 11.4.2 ✅
- TypeScript: As defined in package.json
- ESLint: As defined in package.json
- Vitest: As defined in package.json

### Backend
- Python: 3.11.9 ✅
- FastAPI: 0.111.0 (pinned in requirements.txt)
- Black: 24.10.0 (pinned in .pre-commit-config.yaml)
- Flake8: 7.1.1 (pinned in .pre-commit-config.yaml)

## Validation Commands

### Frontend
```bash
cd frontend
npm ci
npm run type-check  # Should show ~445 errors (baseline)
npm run lint        # Should show ~303 issues (baseline)
npm run test:run    # Should pass
```

### Backend
```bash
cd backend
python -m pip install -r requirements.txt
python -m flake8 .  # Should show ~43 issues (baseline)
python -m black --check .
python -m isort --check-only .
```

### Full Validation
```bash
# Use the validation script
./bin/validate
```

## Progress Tracking

### Metrics to Track
- [ ] TypeScript error count (target: reduce by 10% per sprint)
- [ ] ESLint issue count (target: reduce by 10% per sprint)
- [ ] Flake8 issue count (target: reduce by 20% per sprint)
- [ ] Test coverage percentage (establish baseline, then increase by 2-5% per sprint)
- [ ] Pre-commit hook adoption rate (target: 100% team adoption)

### Milestones
- [ ] **Week 1**: Zero blocking issues on new/changed code
- [ ] **Week 3**: 50% reduction in legacy issues
- [ ] **Week 6**: Coverage ratchet implemented
- [ ] **Week 8**: All quality gates blocking for new PRs

## Notes
- Legacy issues are documented here to avoid blocking urgent work
- New/touched code must meet current standards immediately
- Baseline will be updated as improvements are made
- Focus on preventing new technical debt while steadily reducing existing debt

---
*Baseline established: January 10, 2025*
*Last updated: January 10, 2025*
