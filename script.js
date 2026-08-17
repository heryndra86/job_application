const STORAGE_KEY = "personal-job-hunt-tracker-v1";
const statuses = ["Saved", "Applied", "Screening", "Interview", "Offer", "Rejected"];
const priorityRank = { High: 0, Medium: 1, Low: 2 };

const sampleJobs = [
  {
    id: crypto.randomUUID(),
    company: "Northstar Labs",
    role: "Frontend Engineer",
    status: "Interview",
    priority: "High",
    appliedDate: getDateOffset(-9),
    followUpDate: getDateOffset(1),
    link: "https://example.com/frontend-engineer",
    contact: "Maya, recruiter",
    notes: "Prepare portfolio walkthrough and questions about design systems.",
    createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    company: "Atlas Health",
    role: "Product Engineer",
    status: "Applied",
    priority: "Medium",
    appliedDate: getDateOffset(-3),
    followUpDate: getDateOffset(4),
    link: "",
    contact: "Referral submitted",
    notes: "Strong match on React and customer-facing product work.",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    company: "BrightPath AI",
    role: "Full Stack Developer",
    status: "Saved",
    priority: "Low",
    appliedDate: "",
    followUpDate: getDateOffset(2),
    link: "https://example.com/full-stack-developer",
    contact: "",
    notes: "Review requirements before applying.",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const state = {
  jobs: loadJobs(),
  search: "",
  status: "All",
  sort: "newest",
};

const elements = {
  form: document.querySelector("#jobForm"),
  formTitle: document.querySelector("#formTitle"),
  resetFormButton: document.querySelector("#resetFormButton"),
  jobId: document.querySelector("#jobId"),
  company: document.querySelector("#company"),
  role: document.querySelector("#role"),
  status: document.querySelector("#status"),
  priority: document.querySelector("#priority"),
  appliedDate: document.querySelector("#appliedDate"),
  followUpDate: document.querySelector("#followUpDate"),
  link: document.querySelector("#link"),
  contact: document.querySelector("#contact"),
  notes: document.querySelector("#notes"),
  jobList: document.querySelector("#jobList"),
  emptyState: document.querySelector("#emptyState"),
  searchInput: document.querySelector("#searchInput"),
  statusFilter: document.querySelector("#statusFilter"),
  sortSelect: document.querySelector("#sortSelect"),
  exportButton: document.querySelector("#exportButton"),
  importButton: document.querySelector("#importButton"),
  importInput: document.querySelector("#importInput"),
  template: document.querySelector("#jobCardTemplate"),
};

elements.form.addEventListener("submit", saveJob);
elements.resetFormButton.addEventListener("click", resetForm);
elements.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value.trim().toLowerCase();
  render();
});
elements.statusFilter.addEventListener("change", (event) => {
  state.status = event.target.value;
  render();
});
elements.sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  render();
});
elements.exportButton.addEventListener("click", exportJobs);
elements.importButton.addEventListener("click", () => elements.importInput.click());
elements.importInput.addEventListener("change", importJobs);

render();

function loadJobs() {
  const storedJobs = localStorage.getItem(STORAGE_KEY);
  if (!storedJobs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleJobs));
    return sampleJobs;
  }

  try {
    const parsedJobs = JSON.parse(storedJobs);
    return Array.isArray(parsedJobs) ? parsedJobs : [];
  } catch {
    return [];
  }
}

function persistJobs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.jobs));
}

function saveJob(event) {
  event.preventDefault();

  const job = {
    id: elements.jobId.value || crypto.randomUUID(),
    company: elements.company.value.trim(),
    role: elements.role.value.trim(),
    status: elements.status.value,
    priority: elements.priority.value,
    appliedDate: elements.appliedDate.value,
    followUpDate: elements.followUpDate.value,
    link: elements.link.value.trim(),
    contact: elements.contact.value.trim(),
    notes: elements.notes.value.trim(),
    createdAt: elements.jobId.value
      ? state.jobs.find((item) => item.id === elements.jobId.value)?.createdAt || new Date().toISOString()
      : new Date().toISOString(),
  };

  state.jobs = state.jobs.some((item) => item.id === job.id)
    ? state.jobs.map((item) => (item.id === job.id ? job : item))
    : [job, ...state.jobs];

  persistJobs();
  resetForm();
  render();
}

function editJob(id) {
  const job = state.jobs.find((item) => item.id === id);
  if (!job) return;

  elements.formTitle.textContent = "Edit job";
  elements.jobId.value = job.id;
  elements.company.value = job.company;
  elements.role.value = job.role;
  elements.status.value = job.status;
  elements.priority.value = job.priority;
  elements.appliedDate.value = job.appliedDate;
  elements.followUpDate.value = job.followUpDate;
  elements.link.value = job.link;
  elements.contact.value = job.contact;
  elements.notes.value = job.notes;
  elements.company.focus();
}

function deleteJob(id) {
  const job = state.jobs.find((item) => item.id === id);
  if (!job) return;

  const confirmed = confirm(`Delete ${job.company} - ${job.role}?`);
  if (!confirmed) return;

  state.jobs = state.jobs.filter((item) => item.id !== id);
  persistJobs();
  render();
}

function resetForm() {
  elements.form.reset();
  elements.jobId.value = "";
  elements.formTitle.textContent = "Add job";
  elements.priority.value = "Medium";
  elements.status.value = "Saved";
}

function render() {
  renderSummary();
  renderPipeline();
  renderJobs();
}

function renderSummary() {
  const today = startOfToday();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const total = state.jobs.length;
  const weekly = state.jobs.filter((job) => {
    if (!job.appliedDate) return false;
    const date = new Date(`${job.appliedDate}T00:00:00`);
    return date >= weekAgo && date <= today;
  }).length;
  const interviews = state.jobs.filter((job) => ["Screening", "Interview"].includes(job.status)).length;
  const followUps = state.jobs.filter((job) => {
    if (!job.followUpDate || ["Offer", "Rejected"].includes(job.status)) return false;
    return new Date(`${job.followUpDate}T00:00:00`) <= today;
  }).length;
  const offers = state.jobs.filter((job) => job.status === "Offer").length;

  document.querySelector("#totalApplications").textContent = total;
  document.querySelector("#weeklyApplications").textContent = `${weekly} this week`;
  document.querySelector("#interviewCount").textContent = interviews;
  document.querySelector("#followUpsDue").textContent = followUps;
  document.querySelector("#offerRate").textContent = total ? `${Math.round((offers / total) * 100)}%` : "0%";
}

function renderPipeline() {
  statuses
    .filter((status) => status !== "Rejected")
    .forEach((status) => {
      const count = state.jobs.filter((job) => job.status === status).length;
      document.querySelector(`#stage${status}`).textContent = count;
    });
}

function renderJobs() {
  const jobs = getFilteredJobs();
  elements.jobList.innerHTML = "";
  elements.emptyState.hidden = jobs.length > 0;

  jobs.forEach((job) => {
    const node = elements.template.content.cloneNode(true);
    const card = node.querySelector(".job-card");
    card.querySelector("h3").textContent = job.company;
    card.querySelector(".role").textContent = job.role;
    card.querySelector(".status-pill").textContent = job.status;
    card.querySelector(".applied-date").textContent = formatDate(job.appliedDate);
    card.querySelector(".follow-up-date").textContent = formatDate(job.followUpDate);
    card.querySelector(".priority").textContent = job.priority;
    card.querySelector(".contact").textContent = job.contact || "None";
    card.querySelector(".notes").textContent = job.notes || "No notes yet.";

    const link = card.querySelector(".job-link");
    if (job.link) {
      link.href = job.link;
    } else {
      link.remove();
    }

    card.querySelector(".edit-button").addEventListener("click", () => editJob(job.id));
    card.querySelector(".delete-button").addEventListener("click", () => deleteJob(job.id));
    elements.jobList.appendChild(node);
  });
}

function getFilteredJobs() {
  const filtered = state.jobs.filter((job) => {
    const haystack = [job.company, job.role, job.contact, job.notes, job.status, job.priority]
      .join(" ")
      .toLowerCase();
    const matchesSearch = !state.search || haystack.includes(state.search);
    const matchesStatus = state.status === "All" || job.status === state.status;
    return matchesSearch && matchesStatus;
  });

  return filtered.sort((a, b) => {
    if (state.sort === "followUp") {
      return dateValue(a.followUpDate) - dateValue(b.followUpDate);
    }
    if (state.sort === "priority") {
      return priorityRank[a.priority] - priorityRank[b.priority];
    }
    if (state.sort === "company") {
      return a.company.localeCompare(b.company);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

function exportJobs() {
  const blob = new Blob([JSON.stringify(state.jobs, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `job-hunt-backup-${getDateOffset(0)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function importJobs(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const importedJobs = JSON.parse(reader.result);
      if (!Array.isArray(importedJobs)) throw new Error("Backup must contain a job list.");
      state.jobs = importedJobs.map((job) => ({
        id: job.id || crypto.randomUUID(),
        company: job.company || "",
        role: job.role || "",
        status: statuses.includes(job.status) ? job.status : "Saved",
        priority: ["High", "Medium", "Low"].includes(job.priority) ? job.priority : "Medium",
        appliedDate: job.appliedDate || "",
        followUpDate: job.followUpDate || "",
        link: job.link || "",
        contact: job.contact || "",
        notes: job.notes || "",
        createdAt: job.createdAt || new Date().toISOString(),
      }));
      persistJobs();
      render();
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    } finally {
      event.target.value = "";
    }
  });
  reader.readAsText(file);
}

function formatDate(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${value}T00:00:00`),
  );
}

function dateValue(value) {
  return value ? new Date(`${value}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getDateOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}
