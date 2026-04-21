# Test Case Design Template (Given/When/Then + Oracles)

Use this template for any test layer (unit/integration/contract/E2E) by filling only what applies.

## Core

### Metadata

- ID: \***\*\*\*\*\*\*\***\_\_\***\*\*\*\*\*\*\***
- Title: \***\*\*\*\*\***\_\_\_\***\*\*\*\*\***
- Owner: \***\*\*\*\*\***\_\_\_\***\*\*\*\*\***
- Layer: unit / component / contract / integration / E2E / exploratory
- Priority: P0 / P1 / P2 / P3
- Risk addressed: journey + failure mode(s)

### Goal (What This Test Proves)

- Hypothesis: \***\*\*\*\*\***\*\*\***\*\*\*\*\***\_\_\_\***\*\*\*\*\***\*\*\***\*\*\*\*\***
- Why now: \***\*\*\*\*\***\*\*\*\*\***\*\*\*\*\***\_\***\*\*\*\*\***\*\*\*\*\***\*\*\*\*\***

### Preconditions

- Environment: local / CI / staging
- Feature flags/config: **\*\*\*\***\*\***\*\*\*\***\_**\*\*\*\***\*\***\*\*\*\***
- Auth/user roles: **\*\*\*\***\*\*\*\***\*\*\*\***\_\_**\*\*\*\***\*\*\*\***\*\*\*\***

### Test Data

- Data setup method: fixtures / factories / seed / API setup
- Data identifiers (IDs/keys): **\*\***\*\***\*\***\_\_\_**\*\***\*\***\*\***
- Cleanup/reset plan: **\*\*\*\***\*\***\*\*\*\***\_\_\_**\*\*\*\***\*\***\*\*\*\***

### Steps (Given / When / Then)

Given:

- ***

When:

- ***

Then:

- ***

### Oracles (How You Know ItÔÇÖs Correct)

Functional oracles:

- Expected state/output: **\*\*\*\***\*\***\*\*\*\***\_**\*\*\*\***\*\***\*\*\*\***
- Contract/schema: **\*\*\*\***\*\*\*\***\*\*\*\***\_\_**\*\*\*\***\*\*\*\***\*\*\*\***

Quality oracles (if applicable):

- Security: authz/authn, sensitive data not exposed
- Accessibility: roles/labels, focus order, keyboard paths
- Performance: budget (p95/p99) and no significant regression

Negative oracles:

- What must NOT happen: **\*\*\*\***\*\***\*\*\*\***\_**\*\*\*\***\*\***\*\*\*\***

### Observability (Debugging Ergonomics)

- Correlation IDs captured: request ID / trace ID / build URL
- Failure artifacts expected:
  - Logs
  - Traces
  - Screenshots/video (UI)
  - Crash reports/core dumps (if relevant)

### Flake Control (Determinism)

- Time control: timezone/locale/frozen time? **\*\***\_\_\_\_**\*\***
- Network control: mocked/stubbed boundaries? **\*\***\_\_\_**\*\***
- Retries policy: **\*\*\*\***\*\*\*\***\*\*\*\***\_\_\_**\*\*\*\***\*\*\*\***\*\*\*\***
- Timeout budget: **\*\*\*\***\*\*\*\***\*\*\*\***\_\_\_**\*\*\*\***\*\*\*\***\*\*\*\***

### Automation Notes

- What to mock vs keep real: **\*\***\*\***\*\***\_\_\_\_**\*\***\*\***\*\***
- Lowest layer alternative: can this be tested lower? **\_\_\_\_**
- CI execution: PR gate / nightly / release **\*\*\*\***\_**\*\*\*\***

### Pass/Fail Criteria

- Pass criteria: **\*\*\*\***\*\*\*\***\*\*\*\***\_\_\_\_**\*\*\*\***\*\*\*\***\*\*\*\***
- Fail criteria: **\*\*\*\***\*\*\*\***\*\*\*\***\_\_\_\_**\*\*\*\***\*\*\*\***\*\*\*\***

## Optional: AI / Automation

Do:

- Use AI to propose edge cases and variations (boundaries, auth roles, locales).
- Use AI to draft Given/When/Then steps and candidate oracles, then validate manually.

Avoid:

- Copying AI-generated assertions without verifying the oracle and failure mode.
- Generating large combinatorial suites without a risk-based selection.
