//behavior and interactivity 

const copyButton = document.getElementById("copy-email-btn");

copyButton.addEventListener("click", function() {
    const email = document.getElementById("email-text").textContent;
    navigator.clipboard.writeText(email);
    copyButton.textContent = "Copied!";

    setTimeout(function() {
        copyButton.textContent = "Copy Email";
    }, 2000);
});