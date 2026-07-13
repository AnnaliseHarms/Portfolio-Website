//behavior and interactivity

// for the experience section, toggle the job details when the job is clicked
const jobs = document.querySelectorAll(".job");

// Make the first job open by default when the page loads
if (jobs.length > 0) {
    jobs[0].classList.add("active");
}

jobs.forEach(function(job) {
    job.addEventListener("click", function() {
        const isAlreadyActive = job.classList.contains("active");

        // Close all jobs first
        jobs.forEach(function(otherJob) {
            otherJob.classList.remove("active");
        });

        // If the clicked job wasn't already open, open it
        if (!isAlreadyActive) {
            job.classList.add("active");
        }
    });
});

// for the copy email button, copy the email to clipboard and show "Copied!" for 2 seconds before restoring the copy symbol
const copyButton = document.getElementById("copy-email-btn");
const originalCopyLabel = copyButton.textContent; // the copy symbol
let copyResetTimer;

copyButton.addEventListener("click", function() {
    const email = document.getElementById("email-text").textContent;
    navigator.clipboard.writeText(email);

    copyButton.textContent = "Copied!";
    copyButton.classList.add("copied");

    // reset any pending restore so repeated clicks keep the full timer
    clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(function() {
        copyButton.textContent = originalCopyLabel;
        copyButton.classList.remove("copied");
    }, 2000);
});