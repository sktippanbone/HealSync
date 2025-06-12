import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";``
import { useNavigate } from "react-router-dom";
import { db } from "../../Database/FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import CryptoJS from "crypto-js";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { imgDB } from "../../Database/FirebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { format } from "date-fns";
import Swal from "sweetalert2";

export default function PatientSearch() {
    const [searchAadhaar, setSearchAadhaar] = useState("");
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");
    const [doctorName, setDoctorName] = useState("");
    const [reportType, setReportType] = useState("");
    const [loading, setLoading] = useState(false); // loading state for search
    const [isUploading, setIsUploading] = useState(false); // loading state for file upload

    const navigate = useNavigate();

    const handleSearch = async () => {
        setLoading(true);
        try {
            const hashedAadhaar = CryptoJS.SHA256(searchAadhaar).toString();
            const patientDoc = doc(db, "patients", hashedAadhaar);
            const docSnapshot = await getDoc(patientDoc);

            if (docSnapshot.exists()) {
                setSelectedUser({ ...docSnapshot.data(), aadhaar: hashedAadhaar });
                setError(null);
            } else {
                setSelectedUser(null);
                setError("No user found with this Aadhaar number");
            }
        } catch (error) {
            console.error("Error fetching user data: ", error);
            setError("Error fetching user data");
            setSelectedUser(null);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async () => {
        if (file && fileName && doctorName && reportType) {
            const date = format(new Date(), "yyyyMMdd");
            const filePath = `${fileName}_${date}_${searchAadhaar}`;
            const storageRef = ref(imgDB, `Sasoon Pune/${filePath}`);
            try {
                setIsUploading(true); // Start the upload process

                // Uploading the file
                await uploadBytes(storageRef, file);

                // Getting the download URL
                const downloadURL = await getDownloadURL(storageRef);

                // Add file information to Firestore
                const fileDetails = {
                    url: downloadURL,
                    doctor: doctorName,
                    type: reportType,
                    date: date,
                };

                // Update the patient's document in Firestore
                const patientDoc = doc(db, "patients", selectedUser.aadhaar);
                await updateDoc(patientDoc, {
                    fileUrls: selectedUser.fileUrls ? [...selectedUser.fileUrls, fileDetails] : [fileDetails],
                });

                // Showing success alert
                await Swal.fire({
                    icon: "success",
                    title: "Uploaded!",
                    text: "File has been uploaded successfully.",
                    confirmButtonText: "OK",
                });

                navigate(`/all-patient-details/${selectedUser.aadhaar}`, { state: { aadhaar: selectedUser.aadhaar } });

                // Reset dialog fields
                setIsDialogOpen(false);
                setFile(null);
                setFileName("");
                setDoctorName("");
                setReportType("");
            } catch (error) {
                console.error("Error uploading file: ", error);
                // Showing error alert
                await Swal.fire({
                    icon: "error",
                    title: "Error!",
                    text: "Failed to upload the file. Please try again.",
                    confirmButtonText: "OK",
                });
            } finally {
                setIsUploading(false); // End the upload process
            }
        } else {
            setError("Please fill in all fields");
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100 dark:bg-black text-black dark:text-white">
            <Card className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6">
                <h1 className="text-2xl font-semibold text-center mb-4">
                    🔍 Patient Search
                </h1>

                {/* Search Bar */}
                <div className="relative flex items-center mb-4">
                    <Input
                        type="text"
                        placeholder="Enter Aadhaar Number"
                        value={searchAadhaar}
                        onChange={(e) => setSearchAadhaar(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="w-full p-3 text-sm border rounded-md bg-gray-200 border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white pr-10"
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-3 text-gray-600 dark:text-gray-300"
                    >
                        <Search size={20} />
                    </button>
                </div>

                {/* Loader for Search */}
                {loading && (
                    <div className="flex justify-center mb-4">
                        <div className="loader" />
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 text-red-600 border border-red-400 rounded-md p-2 mb-4">
                        {error}
                    </div>
                )}

                {/* User Info */}
                {selectedUser && (
                    <CardContent className="mt-6 space-y-4">
                        <div className="flex justify-between mb-4">
                            <div className="flex gap-2">
                                <Button
                                    className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => navigate(`/new-prescription/${selectedUser.aadhaar}`, { state: { aadhaar: searchAadhaar } })}
                                >
                                    ➕ New Prescription
                                </Button>

                                <Button
                                    className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => setIsDialogOpen(true)}
                                >
                                    ➕ Add New Reports
                                </Button>
                            </div>

                            <Button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => navigate(`/all-patient-details/${selectedUser.aadhaar}`, { state: { aadhaar: selectedUser.aadhaar } })}
                            >
                                View All Details
                            </Button>
                        </div>

                        {/* Dialog for uploading report */}
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Upload Report</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <Input
                                        type="text"
                                        placeholder="Enter File Name"
                                        value={fileName}
                                        onChange={(e) => setFileName(e.target.value)}
                                        className="w-full p-3 text-sm border rounded-md bg-gray-200 border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    />
                                    <Input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                        className="w-full p-3 text-sm border rounded-md bg-gray-200 border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Enter Doctor's Name"
                                        value={doctorName}
                                        onChange={(e) => setDoctorName(e.target.value)}
                                        className="w-full p-3 text-sm border rounded-md bg-gray-200 border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Enter Report Type"
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                        className="w-full p-3 text-sm border rounded-md bg-gray-200 border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={handleFileUpload}
                                    >
                                        {isUploading ? ( // Show loader when uploading
                                            <>
                                                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                </svg>
                                                Uploading...
                                            </>
                                        ) : (
                                            "Upload"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Patient Details */}
                        <h2 className="text-xl font-medium">🧑‍⚕️ Patient Details</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <p><strong>Name:</strong> {selectedUser.name}</p>
                            <p><strong>Age:</strong> {selectedUser.age}</p>
                            <p><strong>City:</strong> {selectedUser.city}</p>
                            <p><strong>Date of Birth:</strong> {selectedUser.dob}</p>
                            <p><strong>Mobile No:</strong> {selectedUser.mobile}</p>
                            <p><strong>Blood Type:</strong> {selectedUser.bloodType}</p>
                        </div>

                        {/* Medical History */}
                        <h3 className="mt-4 text-lg font-medium">📋 Medical History</h3>
                        <Table className="mt-2 border rounded-md">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Past Diseases</TableCell>
                                    <TableCell>{(selectedUser.pastDiseases || []).join(", ") || "None"}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Allergies</TableCell>
                                    <TableCell>{(selectedUser.allergies || []).join(", ") || "None"}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Ongoing Medication</TableCell>
                                    <TableCell>{(selectedUser.ongoingMedication || []).join(", ") || "None"}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>

                        {/* Divider */}
                        <div className="border-t border-gray-300 dark:border-gray-700 my-6"></div>

                        {/* Upcoming Appointments */}
                        <h3 className="mt-6 text-lg font-medium">📅 Upcoming Appointments</h3>
                        <ul className="mt-4 list-disc pl-5 space-y-2">
                            {(selectedUser.upcomingAppointments || []).map((appt: any, index: number) => (
                                <li key={index}>
                                    <strong>{appt.doctor} ({appt.specialty})</strong> - {appt.date}
                                    <br />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Next Step: {appt.nextStep}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                )}
            </Card>

            {/* Loader Styles */}
            <style>{`
                .loader {
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}