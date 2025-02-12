document.addEventListener("DOMContentLoaded", () => {
    const reportData = JSON.parse(sessionStorage.getItem("reportData"));

    if (!reportData) {
        alert("No report data found. Redirecting to report creation.");
        window.location.href = "createreport.html";
        return;
    }

    // Display report data
    document.getElementById("reportPreview").innerHTML = `
        <p><strong>Driver's Name:</strong> ${reportData.driverName}</p>
        <p><strong>Vehicle Number:</strong> ${reportData.vehicleNumber}</p>
        <p><strong>Odometer Reading:</strong> ${reportData.odometerReading}</p>
        <p><strong>Driver's Signature:</strong> ${reportData.driverSignature}</p>
    `;

    // Ensure the image exists
    const logoImageElement = document.getElementById("logoImage");

    if (!logoImageElement) {
        console.error("Logo image not found in the document.");
        alert("Error: Logo image is missing.");
        return;
    }

    // Attach event listeners to buttons
    document.getElementById("submitReport").addEventListener("click", () => {
        console.log("Submit Report clicked");
        generatePDF(reportData, logoImageElement);
    });

    document.getElementById("downloadPDF").addEventListener("click", () => {
        console.log("Download PDF clicked");
        generatePDF(reportData, logoImageElement);
    });
});