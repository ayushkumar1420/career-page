
const jobs = [
    {
        id: 1,
        title: "Frontend Developer",
        department: "Development",
        location: "Remote",
        type: "Full-time",
        experience: "0-2 years",
        description: "Build responsive web applications.",
        skills: "HTML, CSS, JavaScript, React"
    },
    {
        id: 2,
        title: "Backend Developer",
        department: "Development",
        location: "On-site",
        type: "Full-time",
        experience: "1-3 years",
        description: "Develop APIs and manage databases.",
        skills: "Node.js, Express, MongoDB"
    },
    {
        id: 3,
        title: "UI/UX Design Intern",
        department: "Design",
        location: "Hybrid",
        type: "Internship",
        experience: "Fresher",
        description: "Design interfaces and wireframes.",
        skills: "Figma, Wireframing"
    },
    {
        id: 4,
        title: "Digital Marketing Intern",
        department: "Marketing",
        location: "On-site",
        type: "Internship",
        experience: "Fresher",
        description: "Support digital marketing campaigns.",
        skills: "SEO, Content Marketing"
    }
];

const jobList = document.getElementById("job-list");
const jobFeedback = document.getElementById("job-feedback");
const filterForm = document.getElementById("job-filters");

function showJobs(data) {
    jobList.innerHTML = "";

    data.forEach(job => {
        const card = document.createElement("article");
        card.className = "job-card";

        const title = document.createElement("h3");
        title.textContent = job.title;

        const info = document.createElement("p");
        info.textContent = `${job.department} | ${job.location} | ${job.type}`;

        const experience = document.createElement("p");
        experience.textContent = `Experience: ${job.experience}`;

        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = "View Job Details";

        const description = document.createElement("p");
        description.textContent = job.description;

        const skills = document.createElement("p");
        skills.textContent = `Skills: ${job.skills}`;
        details.append(summary, description, skills);

        const button = document.createElement("button");
        button.className = "apply-job";
        button.textContent = "Apply for this Job";
        button.addEventListener("click", () => applyJob(job.id));

        card.append(title, info, experience, details, button);
        jobList.appendChild(card);
    });

    jobFeedback.textContent = data.length ? "" : "No jobs found.";
}

filterForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const search = document.getElementById("job-search").value.toLowerCase().trim();
    const department = document.getElementById("job-department").value;
    const type = document.getElementById("job-type").value;

    const filtered = jobs.filter(job =>
        job.title.toLowerCase().includes(search) &&
        (!department || job.department === department) &&
        (!type || job.type === type)
    );

    showJobs(filtered);
});

filterForm.addEventListener("reset", () => {
    showJobs(jobs);
});

function applyJob(id) {
    const job = jobs.find(job => job.id === id);
    if (!job) return;

    // Login and application form will be added later
    alert(`Apply for ${job.title} - Login/Register coming soon`);
}

showJobs(jobs);
