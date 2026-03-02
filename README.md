# Browser Demo (NPM/JavaScript)

For instructions on how to run and use this demo, see the [Step-by-Step Setup Guide](https://docs.sealsecurity.io/step-by-step-onboarding-guides/javascript_npm-no_scm-no_sca-github_actions-cli_remote-renamed).

## About This Demo

This is a intentionally vulnerable Node.js/Express application used to demonstrate Seal Security's remediation capabilities. It ships with several real-world vulnerable dependencies and includes a live, triggerable exploit.

## Vulnerability: CVE-2022-29078 — EJS Remote Code Execution

**Package:** `ejs` (pinned to `^2.7.0`, vulnerable below `3.1.7`)
**Severity:** Critical (CVSS 9.8)

### How the exploit works

The app spreads the entire URL query string directly into the EJS render call:

```js
const data = { name: 'World', ...req.query };
res.render('page', data, ...)
```

EJS accepts a `settings` option object that includes `view options`, which controls how the template is compiled. One of those options, `outputFunctionName`, is injected **unsanitized** into the compiled template function body as a JavaScript identifier.

An attacker can pass arbitrary JavaScript via the `settings[view options][outputFunctionName]` query parameter, which gets executed on the server with the same privileges as the Node.js process — full Remote Code Execution.

### Exploit URL

```
http://localhost:3001/?name=Hacker&settings[view%20options][outputFunctionName]=x;setTimeout(function()%7Bprocess.exit(1)%7D,500);s
```

**What happens:** The server executes `setTimeout(function(){ process.exit(1) }, 500)`, killing the Node.js process 500ms after the request — demonstrating that arbitrary server-side code is running.

**Normal request:** `/?name=alice` renders `Hello alice!`
**Exploit request:** the above URL crashes the server.

## Additional Vulnerable Dependencies

| Package | Version | CVE | Type |
|---|---|---|---|
| `ejs` | ^2.7.0 | CVE-2022-29078 | Remote Code Execution |
| `got` | 6.7.1 | CVE-2022-33987 | SSRF (redirect bypass) |
| `json5` | 0.5.1 | CVE-2022-46175 | Prototype Pollution |
| `lodash` | 4.17.5 | CVE-2019-10744 | Prototype Pollution |

## Remediation

Running the **Seal Security Remediation** GitHub Actions workflow replaces the vulnerable packages with Seal's patched versions — without changing the declared version ranges in `package.json`.

> **Note:** The workflow uses [ngrok](https://ngrok.com/) solely to expose the running application to a public URL for live browser-based testing of the exploit. ngrok is **not** required for Seal to scan or remediate vulnerabilities — the `seal fix` step runs independently of it.
