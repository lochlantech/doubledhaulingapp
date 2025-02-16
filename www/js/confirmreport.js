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

    // Ensure the logo image exists
    const logoImageElement = document.getElementById("logoImage");
    if (!logoImageElement) {
        console.error("❌ Logo image not found in the document.");
        alert("Error: Logo image is missing.");
        return;
    }

    // Attach event listener to submit button
    document.getElementById("submitReport").addEventListener("click", async () => {
        console.log("📄 Submit Report clicked");

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text("Driver's Vehicle Inspection Report", 20, 20);
        doc.text(`Driver's Name: ${reportData.driverName}`, 20, 40);
        doc.text(`Vehicle Number: ${reportData.vehicleNumber}`, 20, 50);
        doc.text(`Odometer Reading: ${reportData.odometerReading}`, 20, 60);
        doc.text(`Driver's Signature: ${reportData.driverSignature}`, 20, 70);

        // Convert to Blob
        const pdfBlob = doc.output("blob");

        // ✅ Ensure PDF is correctly formatted as a File before sending
        const pdfFile = new File([pdfBlob], "inspection_report.pdf", { type: "application/pdf" });

        // Upload PDF to the backend
        const formData = new FormData();
        formData.append("pdf", pdfFile);
        formData.append("username", reportData.driverName);
        formData.append("email", localStorage.getItem("email"));
        formData.append("role", localStorage.getItem("role"));

        try {
            console.log("📤 Uploading PDF...");
            const response = await fetch("https://ddheavyhauling.xyz/pdfs", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ PDF successfully uploaded!");
                console.log("📄 PDF Upload Response:", result);
            } else {
                alert("❌ Error uploading PDF: " + result.error);
                console.error("❌ Upload Error:", result);
            }
        } catch (error) {
            console.error("❌ Upload Request Failed:", error);
            alert("❌ Error uploading PDF.");
        }
    });
});