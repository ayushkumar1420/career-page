# Careers applications integration

The Careers frontend is in this directory. The PHP admin project is a separate sibling directory at `..\career admin\`. Its canonical public jobs endpoint is `public-jobs.php`; the canonical application endpoint is `api\submit-application.php`. The frontend does not contain sample jobs or simulate a successful submission.

## API URLs and configuration

The page reads published jobs from `career admin\public-jobs.php`:

```text
GET /career%20admin/public-jobs.php (local project layout)
GET /career-admin/public-jobs.php (production deployment layout)
```

Applications are submitted to `career admin\api\submit-application.php`:

```text
POST /career%20admin/api/submit-application.php (local project layout)
POST /career-admin/api/submit-application.php (production deployment layout)
```

The endpoint paths are configured on `.opportunity-grid` and `#application-form` in `explore.html`. The `<meta name="career-api-base">` content is a base URL and prefixes those paths. The current local setting is `http://localhost:5500/career%20admin/`, matching the PHP server currently serving the admin at `localhost:5500` while Explore is opened at `127.0.0.1:5500`.

- Local on the current setup: use `http://localhost:5500/career%20admin/`. If instead running PHP with the backend README command on port 8080, change the meta content to `http://localhost:8080/career%20admin/`.
- Production on the same origin: set the meta content to `/career-admin/`, matching the admin project's documented Hostinger deployment path. Relative and root-relative API bases are supported.
- Separate API origin: set the meta content to its full base, e.g. `content="https://api.example.com/career-admin/"`. Configure the PHP server to allow only the exact website origin through CORS. Do not use wildcard origins with credentials or disable CORS protections.

Do not put SMTP settings, credentials, or other private server configuration in this page.

## Required PHP API contract

### Published jobs

`GET /career-admin/public-jobs.php` (or the local `/career%20admin/public-jobs.php`) returns JSON with a `jobs` array and HTTP 200:

```json
{
  "jobs": [
    {
      "id": "job-id",
      "title": "Job title",
      "short_description": "Short listing copy",
      "location": "Location",
      "work_mode": "Remote, hybrid, or on-site",
      "job_type": "Employment type",
      "description": "Full description",
      "responsibilities": ["Responsibility"],
      "required_skills": ["Skill"],
      "qualifications": "Qualifications",
      "experience": "Experience"
    }
  ]
}
```

Only published jobs may be returned. Each job needs a stable `id` (or `job_id`) and `title`. The optional detail fields are displayed when supplied and omitted when absent. `responsibilities`, `required_skills`, and `skills` may be strings or arrays of strings. If the admin job schema does not yet include a field, add it to the admin form and public response; the frontend deliberately does not invent job requirements.

### Submit an application

`POST /career-admin/api/submit-application.php` (or the local `/career%20admin/api/submit-application.php`) accepts `multipart/form-data` with these names:

| Field | Required | Expected value |
|---|---:|---|
| `job_id` | yes | ID of a currently published job |
| `full_name` | yes | Applicant name |
| `email` | yes | Valid email |
| `phone` | yes | Phone number |
| `resume` | yes | PDF file, maximum 5 MiB |
| `recruitment_consent` | yes | `1` |
| `location` | no | Applicant location |
| `qualification` | no | Qualification |
| `college` | no | College or university |
| `graduation_year` | no | Four-digit year |
| `linkedin_url` | no | LinkedIn URL |
| `portfolio_url` | no | Portfolio or GitHub URL |
| `cover_letter` | no | Cover letter |

On a persisted application, return HTTP 201 (or another successful 2xx) and JSON:

```json
{
  "success": true,
  "application_id": "application-id",
  "notification_status": "Pending"
}
```

The existing PHP API returns `{ "error": "Helpful applicant-facing error" }` with HTTP 422 for invalid input and HTTP 500 for server failures. `success: true` means the application was saved, independent of email notification status. The API returns `notification_status` as `Sent`, `Failed`, or `Pending`; the local log-only mode remains `Pending`. The frontend never claims email delivery. Do not return applicant data, stored resume paths, SMTP details, or stack traces. The UI only displays success when the server returns `success: true` and a non-empty `application_id`.

The PHP backend re-checks that the job is published at submission time, validates all fields, validates resume size, PDF structure and detected MIME type, uses generated resume names, and keeps uploads and application records protected from public access. Do not store `applications.json` or resumes under a publicly readable path. Configure PHP upload limits (`upload_max_filesize=5M` and `post_max_size=6M`), storage permissions, request rate limiting, and consent retention according to the site's policies. PHP `fileinfo` is not enabled in the runtime available for this checkout; the endpoint now fails closed until `fileinfo` is enabled. Never trust frontend validation as authoritative.

## Run locally

### Recommended: one PHP origin for website, API, and admin

Open PowerShell in the PHP backend directory and run:

```powershell
Set-Location "C:\Users\ayush\Downloads\DeepshiTechW1\career admin"
$env:CAREER_EMAIL_MODE = "log"
$phpDir = Split-Path (Get-Command php).Source
php -d "extension_dir=$phpDir\ext" -d extension=php_fileinfo.dll `
  -d upload_max_filesize=5M -d post_max_size=6M `
  -S localhost:8080 -t .. .\router.php
```

Open the website at `http://localhost:8080/DeepshiTechW1/career/explore.html` and the admin at `http://localhost:8080/career%20admin/`. This uses the real PHP endpoints on the same origin; the default local email mode logs a no-delivery attempt and does not claim that HR mail was sent. Remove the environment setting when finished with `Remove-Item Env:CAREER_EMAIL_MODE`.

The installed PHP runtime is 8.4.27. `fileinfo` is not enabled by default, but its DLL is included with this PHP package; the command above enables it for the local server. The backend fails closed if MIME inspection is unavailable. The runtime has no enabled `openssl` module and no SMTP configuration was supplied, so test the local notification flow with `CAREER_EMAIL_MODE=log`; actual SMTP delivery requires the server-side SMTP settings and OpenSSL.

### Optional: separate frontend Live Server and PHP API

Run the PHP command above in one terminal. In another terminal, start Live Server on the website folder and open `http://127.0.0.1:5500/career/explore.html`. The frontend will request the API from `http://127.0.0.1:8080/career%20admin/`; the PHP backend explicitly allows `127.0.0.1:5500` and `localhost:5500`. Do not replace these allow-lists with wildcard CORS.

## Verification checklist

Use the real PHP backend and its published job data to verify:

1. A published job appears from the public endpoint; no hardcoded job cards appear. The current `jobs.json` contains seven published jobs and no drafts.
2. Selecting a card opens that job's details; browser back navigation returns to the list.
3. Missing, invalid, unpublished, or removed job IDs cannot reach the application form.
4. Required name, email, phone, PDF resume, and consent validation display field errors; valid optional URLs and graduation years are accepted.
5. A PDF below 5 MiB is accepted; a non-PDF and a PDF above 5 MiB are rejected before the request.
6. A valid application reaches the PHP endpoint as multipart form data with its published `job_id`.
7. Success appears only for the server-confirmed response with an application ID; an email-notification failure does not invalidate a saved application.
8. A server rejection, malformed response, unavailable API, or network error keeps applicant entries available for retry and never shows success.
9. Rapid repeated submit clicks create only one in-flight request.
10. Check the listing, detail view, and form at narrow mobile viewport sizes and with keyboard-only navigation.

The actual PHP backend is present and the routes match after correcting the frontend paths and consent field. Local API, security, validation, PDF upload, persistence, notification-failure, browser success, and duplicate-submit checks were run; see the task report for the exact results. No live draft job exists in the current data, so draft filtering was confirmed from the endpoint's published-only filter rather than by altering existing jobs.

## Production / Hostinger checklist

- Deploy the admin project at `/career-admin/` as documented in its README; the frontend's production default uses that base path.
- Keep the API base empty when the site and API share a Hostinger domain. For a separate API origin, set the exact public API origin and allow only the website origin in PHP CORS configuration.
- Serve the site and API over HTTPS; configure PHP upload limits and private, non-web-accessible resume storage.
- Ensure the public jobs endpoint returns published roles only and the application endpoint re-checks job publication and persists the application before returning success.
- Configure mail credentials and delivery on the PHP host only. Keep them out of JavaScript and public files.
- Confirm production storage permissions, backups, retention/deletion policy, consent text, spam/rate controls, and privacy notice with the backend/site owner.
