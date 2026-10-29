document.addEventListener("DOMContentLoaded", function () {
    var grid = document.querySelector(".opportunity-grid");
    var feedback = document.getElementById("opportunitiesFeedback");
    var page = document.querySelector(".career-explore-page");
    var listingView = document.getElementById("job-listing-view");
    var detailView = document.getElementById("job-detail-view");
    var detailContent = document.getElementById("job-detail-content");
    var applyLink = document.getElementById("job-apply-link");
    var applicationView = document.getElementById("application-view");
    var applicationForm = document.getElementById("application-form");
    var applicationBackLink = document.getElementById("application-back-link");
    var applicationJobTitle = document.getElementById("application-job-title");
    var applicationFeedback = document.getElementById("application-feedback");
    var submitButton = document.getElementById("application-submit");
    var resumeInput = document.getElementById("applicant-resume");
    var resumeName = document.getElementById("applicant-resume-name");
    var successView = document.getElementById("application-success");
    var apiBaseMeta = document.querySelector('meta[name="career-api-base"]');
    var apiBase = apiBaseMeta ? apiBaseMeta.content.trim() : "";
    if (!apiBase) {
        var localHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        apiBase = localHost
            ? window.location.protocol + "//" + window.location.hostname + ":8080/career%20admin/"
            : "/career-admin/";
    }
    var applicationInProgress = false;
    var selectedJob = null;
    var requestedJobId = new URLSearchParams(window.location.search).get("job");

    if (!grid || !feedback || !page || !listingView || !detailView || !detailContent
        || !applicationView || !applicationForm) {
        return;
    }

    var graduationYear = document.getElementById("applicant-graduation-year");
    if (graduationYear) {
        graduationYear.max = String(new Date().getFullYear() + 10);
    }

    function apiUrl(path) {
        var baseUrl = new URL(apiBase, window.location.href);
        if (baseUrl.pathname.charAt(baseUrl.pathname.length - 1) !== "/") {
            baseUrl.pathname += "/";
        }
        return new URL(String(path || "").replace(/^\/+/, ""), baseUrl).toString();
    }

    function jobId(job) {
        var id = job && (job.id !== undefined ? job.id : job.job_id);
        return id === undefined || id === null || String(id).trim() === "" ? "" : String(id);
    }

    function isPublished(job) {
        function flagIsPublished(value) {
            return value === true || value === 1
                || (typeof value === "string"
                    && ["1", "true", "published", "yes"].indexOf(value.trim().toLowerCase()) !== -1);
        }
        if (typeof job.status === "string") {
            return job.status.trim().toLowerCase() === "published";
        }
        if (job.is_published !== undefined && !flagIsPublished(job.is_published)) {
            return false;
        }
        if (job.published !== undefined && !flagIsPublished(job.published)) {
            return false;
        }
        return job.is_published !== undefined || job.published !== undefined;
    }

    function displayValue(value) {
        return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
    }

    function firstValue(job, keys) {
        for (var index = 0; index < keys.length; index += 1) {
            var value = displayValue(job[keys[index]]);
            if (value) {
                return value;
            }
        }
        return "";
    }

    function createJobUrl(id, hash) {
        return "explore.html?job=" + encodeURIComponent(id) + hash;
    }

    function setListingMessage(message, isError, retry) {
        feedback.textContent = message;
        feedback.hidden = false;
        feedback.classList.toggle("opportunities-error", Boolean(isError));
        if (retry) {
            var retryButton = document.createElement("button");
            retryButton.className = "job-retry-button";
            retryButton.type = "button";
            retryButton.textContent = "Try again";
            retryButton.addEventListener("click", loadJobs);
            feedback.appendChild(document.createTextNode(" "));
            feedback.appendChild(retryButton);
        }
    }

    function addDetailSection(parent, heading, value) {
        var values = Array.isArray(value)
            ? value.map(displayValue).filter(Boolean)
            : displayValue(value).split(/\r?\n/).map(function (item) { return item.trim(); }).filter(Boolean);
        if (!values.length) {
            return;
        }

        var section = document.createElement("section");
        section.className = "job-detail-section";
        var title = document.createElement("h2");
        title.textContent = heading;
        section.appendChild(title);

        if (Array.isArray(value)) {
            var list = document.createElement("ul");
            values.forEach(function (item) {
                var listItem = document.createElement("li");
                listItem.textContent = item;
                list.appendChild(listItem);
            });
            section.appendChild(list);
        } else {
            values.forEach(function (item) {
                var paragraph = document.createElement("p");
                paragraph.textContent = item;
                section.appendChild(paragraph);
            });
        }
        parent.appendChild(section);
    }

    function renderJobDetails(job) {
        selectedJob = job;
        detailContent.replaceChildren();

        var title = document.createElement("h1");
        title.id = "job-detail-title";
        title.textContent = displayValue(job.title) || "Opportunity";
        detailContent.appendChild(title);

        var metadata = [
            firstValue(job, ["location"]),
            firstValue(job, ["work_mode", "workMode"]),
            firstValue(job, ["job_type", "employment_type", "employmentType"])
        ].filter(Boolean);
        if (metadata.length) {
            var meta = document.createElement("p");
            meta.className = "job-detail-meta";
            meta.textContent = metadata.join(" · ");
            detailContent.appendChild(meta);
        }

        addDetailSection(detailContent, "About the role",
            firstValue(job, ["full_description", "description"]));
        addDetailSection(detailContent, "Responsibilities",
            job.responsibilities);
        addDetailSection(detailContent, "Required skills",
            job.required_skills !== undefined ? job.required_skills : job.skills);
        addDetailSection(detailContent, "Qualifications",
            job.qualifications);
        addDetailSection(detailContent, "Experience",
            job.experience);

        if (!firstValue(job, ["full_description", "description"])
            && !job.responsibilities && !job.required_skills && !job.skills
            && !job.qualifications && !job.experience) {
            var unavailable = document.createElement("p");
            unavailable.className = "job-detail-unavailable";
            unavailable.textContent = "A detailed description has not been provided for this role.";
            detailContent.appendChild(unavailable);
        }

        var about = document.createElement("section");
        about.className = "job-detail-section";
        var aboutHeading = document.createElement("h2");
        aboutHeading.textContent = "About DeepshiTech";
        var aboutCopy = document.createElement("p");
        aboutCopy.textContent = "At DeepshiTech, we provide innovative advertising and technology solutions built around the unique needs of each client. We work with businesses of different sizes, from emerging brands to established enterprises.";
        about.append(aboutHeading, aboutCopy);
        detailContent.appendChild(about);

        var url = createJobUrl(jobId(job), "#application-form");
        applyLink.href = url;
        applicationBackLink.href = createJobUrl(jobId(job), "#job-detail-view");
        applicationJobTitle.textContent = title.textContent;
    }

    function showJobUnavailable(message) {
        detailContent.replaceChildren();
        var heading = document.createElement("h1");
        heading.id = "job-detail-title";
        heading.textContent = "Opportunity unavailable";
        var explanation = document.createElement("p");
        explanation.className = "job-detail-unavailable";
        explanation.textContent = message;
        detailContent.append(heading, explanation);
        applyLink.hidden = true;
    }

    function showView(view) {
        listingView.hidden = view !== "listing";
        detailView.hidden = view !== "detail";
        applicationView.hidden = view !== "application";
        page.classList.toggle("is-job-view", view !== "listing");
        if (view !== "listing") {
            window.requestAnimationFrame(function () {
                (view === "detail" ? detailView : applicationView).scrollIntoView({ block: "start" });
            });
        }
    }

    function renderJobCard(job, index) {
        var id = jobId(job);
        if (!id || !displayValue(job.title)) {
            return null;
        }

        var card = document.createElement("a");
        card.className = "opportunity-card";
        card.href = createJobUrl(id, "#job-details");
        card.setAttribute("aria-label", "View details for " + displayValue(job.title));

        var number = document.createElement("span");
        number.className = "opportunity-number";
        number.textContent = String(index + 1).padStart(2, "0");

        var title = document.createElement("h3");
        title.textContent = displayValue(job.title);
        var description = document.createElement("p");
        description.textContent = firstValue(job, ["short_description", "summary"])
            || "View this published opportunity for more information.";
        var footer = document.createElement("span");
        footer.className = "opportunity-card-footer";
        var status = document.createElement("span");
        status.className = "opportunity-status";
        status.textContent = [
            firstValue(job, ["job_type", "employment_type", "employmentType"]),
            firstValue(job, ["work_mode", "workMode"])
        ].filter(Boolean).join(" · ") || "Opportunity";
        var arrow = document.createElement("span");
        arrow.className = "opportunity-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";
        footer.append(status, arrow);
        card.append(number, title, description, footer);
        return card;
    }

    function loadJobs() {
        grid.setAttribute("aria-busy", "true");
        grid.replaceChildren();
        setListingMessage("Loading current opportunities…", false, false);

        fetch(apiUrl(grid.getAttribute("data-jobs-api")), {
            headers: { Accept: "application/json" },
            cache: "no-store"
        }).then(function (response) {
            if (!response.ok) {
                throw new Error("The jobs service returned HTTP " + response.status + ".");
            }
            return response.json();
        }).then(function (data) {
            if (!data || !Array.isArray(data.jobs)) {
                throw new Error("The jobs service returned an invalid response.");
            }

            var jobs = data.jobs.filter(function (job) {
                return job && typeof job === "object" && isPublished(job);
            });
            grid.replaceChildren();
            if (!jobs.length) {
                setListingMessage("There are no current opportunities. Please check back soon.", false, false);
            } else {
                var cards = jobs.map(renderJobCard).filter(Boolean);
                if (!cards.length) {
                    throw new Error("The jobs service returned published listings without valid IDs or titles.");
                }
                grid.append.apply(grid, cards);
                feedback.hidden = true;
            }

            if (requestedJobId !== null) {
                var selected = jobs.find(function (job) { return jobId(job) === requestedJobId; });
                showView("detail");
                if (!selected) {
                    selectedJob = null;
                    showJobUnavailable("This job is no longer available or is not published.");
                } else {
                    applyLink.hidden = false;
                    renderJobDetails(selected);
                    if (window.location.hash === "#application-form") {
                        showView("application");
                    } else {
                        window.location.hash = "job-detail-view";
                    }
                }
            }
        }).catch(function (error) {
            console.error("Could not load published career opportunities.", error);
            setListingMessage("We couldn’t load current opportunities. Please check your connection and try again.",
                true, true);
            if (requestedJobId !== null) {
                showView("detail");
                showJobUnavailable("We couldn’t verify this job right now. Please try again from the opportunities list.");
            }
        }).finally(function () {
            grid.setAttribute("aria-busy", "false");
        });
    }

    function setFieldError(field, message) {
        var error = document.getElementById(field.id + "-error");
        if (error) {
            error.textContent = message;
        }
        field.setAttribute("aria-invalid", "true");
    }

    function clearFieldError(field) {
        var error = document.getElementById(field.id + "-error");
        if (error) {
            error.textContent = "";
        }
        field.removeAttribute("aria-invalid");
    }

    function validateApplication() {
        var valid = true;
        var firstInvalid = null;
        var fields = applicationForm.querySelectorAll("input, textarea");
        fields.forEach(function (field) {
            clearFieldError(field);
            var message = "";
            if (field.required && !field.validity.valid) {
                if (field.type === "checkbox") {
                    message = "Please provide consent before submitting.";
                } else if (field.type === "file") {
                    message = "Please select your resume in PDF format.";
                } else if (field.type === "email" && field.value.trim()) {
                    message = "Enter a valid email address.";
                } else {
                    message = "This field is required.";
                }
            } else if (field.type === "email" && field.value.trim() && !field.validity.valid) {
                message = "Enter a valid email address.";
            } else if (field.type === "url" && field.value.trim() && !field.validity.valid) {
                message = "Enter a complete URL beginning with http:// or https://.";
            } else if (field.id === "applicant-phone" && field.value.trim()
                && (!/^[+0-9()\-\s.]+$/.test(field.value)
                    || field.value.replace(/\D/g, "").length < 7
                    || field.value.replace(/\D/g, "").length > 15)) {
                message = "Enter a valid phone number containing 7 to 15 digits.";
            } else if (field.id === "applicant-graduation-year" && field.value
                && !field.validity.valid) {
                message = "Enter a graduation year between 1950 and " + (new Date().getFullYear() + 10) + ".";
            } else if (field.type === "file" && field.files.length) {
                var file = field.files[0];
                if (!/\.pdf$/i.test(file.name)
                    || (file.type && file.type.toLowerCase() !== "application/pdf")) {
                    message = "The resume must be a PDF file.";
                } else if (file.size > 5 * 1024 * 1024) {
                    message = "The resume must be 5 MB or smaller.";
                }
            }

            if (message) {
                valid = false;
                setFieldError(field, message);
                if (!firstInvalid) {
                    firstInvalid = field;
                }
            }
        });

        if (firstInvalid) {
            firstInvalid.focus();
        }
        return valid;
    }

    function showApplicationError(message) {
        applicationFeedback.textContent = message;
        applicationFeedback.hidden = false;
    }

    function responseMessage(payload, status) {
        if (payload) {
            var message = typeof payload.message === "string" ? payload.message : payload.error;
            if (typeof message === "string" && message.trim()) {
                return message.trim().slice(0, 400);
            }
        }
        if (status === 404 || status === 410) {
            return "This job is no longer accepting applications. Please return to the opportunities list.";
        }
        if (status === 413) {
            return "The uploaded resume is too large. Choose a PDF file that is 5 MB or smaller.";
        }
        if (status >= 500) {
            return "The application service is temporarily unavailable. Your details are still on this form; please try again.";
        }
        return "We couldn’t submit your application. Please review your details and try again.";
    }

    applicationForm.addEventListener("input", function (event) {
        if (event.target.matches("input, textarea")) {
            clearFieldError(event.target);
        }
        applicationFeedback.hidden = true;
    });

    resumeInput.addEventListener("change", function () {
        resumeName.textContent = resumeInput.files.length ? resumeInput.files[0].name : "No file selected";
        clearFieldError(resumeInput);
        applicationFeedback.hidden = true;
    });

    applicationForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if (applicationInProgress) {
            return;
        }
        applicationFeedback.hidden = true;
        if (!selectedJob || !isPublished(selectedJob)) {
            showApplicationError("This job is no longer available. Return to the opportunities list and choose a published role.");
            return;
        }
        if (!validateApplication()) {
            return;
        }

        applicationInProgress = true;
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
        submitButton.firstChild.textContent = "SUBMITTING… ";

        var formData = new FormData(applicationForm);
        formData.set("job_id", jobId(selectedJob));

        fetch(apiUrl(applicationForm.getAttribute("data-application-api")), {
            method: "POST",
            headers: { Accept: "application/json" },
            body: formData
        }).then(function (response) {
            return response.json().catch(function () {
                return null;
            }).then(function (payload) {
                if (!response.ok || !payload || payload.success !== true
                    || payload.application_id === undefined || payload.application_id === null
                    || String(payload.application_id).trim() === "") {
                    throw { status: response.status, payload: payload };
                }
                return payload;
            });
        }).then(function (payload) {
            document.getElementById("success-job-title").textContent = displayValue(selectedJob.title);
            document.getElementById("success-application-id").textContent = String(payload.application_id);
            applicationForm.hidden = true;
            successView.hidden = false;
            successView.focus();
        }).catch(function (error) {
            if (error && typeof error.status === "number") {
                showApplicationError(responseMessage(error.payload, error.status));
            } else {
                console.error("Could not submit the career application.", error);
                showApplicationError("We couldn’t reach the application service. Your details are still on this form; please check your connection and try again.");
            }
        }).finally(function () {
            applicationInProgress = false;
            submitButton.disabled = false;
            submitButton.removeAttribute("aria-busy");
            submitButton.firstChild.textContent = "SUBMIT APPLICATION ";
        });
    });

    window.addEventListener("hashchange", function () {
        if (requestedJobId === null || !selectedJob) {
            return;
        }
        if (window.location.hash === "#application-form") {
            showView("application");
        } else if (window.location.hash === "#job-detail-view") {
            showView("detail");
        }
    });

    loadJobs();
});
