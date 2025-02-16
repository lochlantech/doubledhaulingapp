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

    document.getElementById("sendPhoto").addEventListener("click", async () => {
        console.log("Send Photo Clicked");

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text("Driver's Vehicle Inspection Report", 20, 20);
        doc.text(`Driver's Name: ${reportData.driverName}`, 20, 40);
        doc.text(`Vehicle Number: ${reportData.vehicleNumber}`, 20, 50);
        doc.text(`Odometer Reading: ${reportData.odometerReading}`, 20, 60);
        doc.text(`Driver's Signature: ${reportData.driverSignature}`, 20, 70);

        // Convert to Blob
        const pdfBlob = doc.output("blob");
        const formData = new FormData();
        formData.append("pdf", pdfBlob, "inspection_report.pdf");
        formData.append("username", reportData.driverName);
        formData.append("email", localStorage.getItem("email"));
        formData.append("role", localStorage.getItem("role"));

        try {
            const response = await fetch("https://ddheavyhauling.xyz/uploadPdf", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (response.ok) {
                alert("PDF successfully uploaded!");
            } else {
                alert("Error uploading PDF.");
            }
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Error uploading PDF.");
        }
    });
});