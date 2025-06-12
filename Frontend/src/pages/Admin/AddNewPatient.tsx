import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { db } from "../../Database/FirebaseConfig";  
import { doc, setDoc } from "firebase/firestore";
import CryptoJS from "crypto-js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Swal from "sweetalert2"; 
import { useNavigate } from "react-router-dom"; 

export default function AddNewPatient() {
  const navigate = useNavigate(); // Initialize useRouter for navigation
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [dob, setDob] = useState("");
  const [mobile, setMobile] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [pastDiseases, setPastDiseases] = useState("");
  const [allergies, setAllergies] = useState("");
  const [ongoingMedication, setOngoingMedication] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [bloodReport, setBloodReport] = useState<File | null>(null);
  const [prescription, setPrescription] = useState<File | null>(null);
  const [scans, setScans] = useState<File | null>(null);
  const [loading, setLoading] = useState(false); 

  const storage = getStorage(); 

  const handleAddPatient = async () => {
    try {
      setLoading(true); 
      const hashedAadhaar = CryptoJS.SHA256(aadhaar).toString();
      const fileUrls: string[] = [];

      const uploadFileAndGetUrl = async (file: File | null, folder: string) => {
        if (!file) return null;
        const fileRef = ref(storage, `${folder}/${file.name}`);
        await uploadBytes(fileRef, file);
        return await getDownloadURL(fileRef);
      };

      const bloodReportUrl = await uploadFileAndGetUrl(bloodReport, 'Sasoon Pune');
      if (bloodReportUrl) fileUrls.push(bloodReportUrl);

      const prescriptionUrl = await uploadFileAndGetUrl(prescription, 'Sasoon Pune');
      if (prescriptionUrl) fileUrls.push(prescriptionUrl);
      
      const scansUrl = await uploadFileAndGetUrl(scans, 'Sasoon Pune');
      if (scansUrl) fileUrls.push(scansUrl);
      const patientData = {
        name,
        email,
        aadhaar,
        age,
        city,
        dob,
        mobile,
        bloodType,
        pastDiseases: pastDiseases.split(","),
        allergies: allergies.split(","),
        ongoingMedication: ongoingMedication.split(","),
        bloodPressure,
        heartRate,
        respiratoryRate,
        temperature,
        oxygenSaturation,
        fileUrls, 
      };
      await setDoc(doc(db, "patients", hashedAadhaar), patientData);
      console.log("Patient added successfully:", patientData);
      await Swal.fire({
        title: 'Success!',
        text: 'Patient has been added successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
      });
      
     navigate('/Search-User');
      
      resetForm();
      
    } catch (error) {
      console.error("Error adding patient: ", error);
      await Swal.fire({
        title: 'Error!',
        text: 'There was an error adding the patient.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      setLoading(false); 
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setAadhaar("");
    setAge("");
    setCity("");
    setDob("");
    setMobile("");
    setBloodType("");
    setPastDiseases("");
    setAllergies("");
    setOngoingMedication("");
    setBloodPressure("");
    setHeartRate("");
    setRespiratoryRate("");
    setTemperature("");
    setOxygenSaturation("");
    setBloodReport(null);
    setPrescription(null);
    setScans(null);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100 dark:bg-black text-black dark:text-white">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-center mb-4">🧑‍⚕ Add New Patient</h1>
        
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium dark:text-white pr-10">
              Name
            </label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium dark:text-white pr-10">
              Email
            </label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="aadhaar" className="block text-sm font-medium dark:text-white pr-10">
              Aadhaar Number
            </label>
            <Input
              type="text"
              id="aadhaar"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-medium dark:text-white pr-10">
              Age
            </label>
            <Input
              type="text"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium dark:text-white pr-10">
              City
            </label>
            <Input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="dob" className="block text-sm font-medium dark:text-white pr-10">
              Date of Birth
            </label>
            <Input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium dark:text-white pr-10">
              Mobile No
            </label>
            <Input
              type="text"
              id="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="bloodType" className="block text-sm font-medium dark:text-white pr-10">
              Blood Type
            </label>
            <Input
              type="text"
              id="bloodType"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="pastDiseases" className="block text-sm font-medium dark:text-white pr-10">
              Past Diseases (comma separated)
            </label>
            <Input
              type="text"
              id="pastDiseases"
              value={pastDiseases}
              onChange={(e) => setPastDiseases(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="allergies" className="block text-sm font-medium dark:text-white pr-10">
              Allergies (comma separated)
            </label>
            <Input
              type="text"
              id="allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="ongoingMedication" className="block text-sm font-medium dark:text-white pr-10">
              Ongoing Medication (comma separated)
            </label>
            <Input
              type="text"
              id="ongoingMedication"
              value={ongoingMedication}
              onChange={(e) => setOngoingMedication(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="bloodPressure" className="block text-sm font-medium dark:text-white pr-10">
              Blood Pressure (BP)
            </label>
            <Input
              type="text"
              id="bloodPressure"
              value={bloodPressure}
              onChange={(e) => setBloodPressure(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="heartRate" className="block text-sm font-medium dark:text-white pr-10">
              Heart Rate (Pulse)
            </label>
            <Input
              type="text"
              id="heartRate"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="respiratoryRate" className="block text-sm font-medium dark:text-white pr-10">
              Respiratory Rate
            </label>
            <Input
              type="text"
              id="respiratoryRate"
              value={respiratoryRate}
              onChange={(e) => setRespiratoryRate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium dark:text-white pr-10">
              Temperature
            </label>
            <Input
              type="text"
              id="temperature"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="oxygenSaturation" className="block text-sm font-medium dark:text-white pr-10">
              Oxygen Saturation (SpO₂)
            </label>
            <Input
              type="text"
              id="oxygenSaturation"
              value={oxygenSaturation}
              onChange={(e) => setOxygenSaturation(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="bloodReport" className="block text-sm font-medium dark:text-white pr-10">
              Upload Blood Report
            </label>
            <Input
              type="file"
              id="bloodReport"
              onChange={(e) => setBloodReport(e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="prescription" className="block text-sm font-medium dark:text-white pr-10">
              Upload Prescription
            </label>
            <Input
              type="file"
              id="prescription"
              onChange={(e) => setPrescription(e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="scans" className="block text-sm font-medium dark:text-white pr-10">
              Upload Scans
            </label>
            <Input
              type="file"
              id="scans"
              onChange={(e) => setScans(e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={handleAddPatient}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-3 -ml-1 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 016.39-7.94c-.049.155-.09.314-.11.477a6 6 0 102.217 0c-.01-.163-.063-.322-.111-.477A8 8 0 114 12z"
                  />
                </svg>
              ) : (
                'Add Patient'
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}