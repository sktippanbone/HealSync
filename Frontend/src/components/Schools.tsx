import { useEffect, useState } from "react"
import { collection, getDocs, setDoc, doc } from "firebase/firestore"
import { db } from "../Database/FirebaseConfig" // Import Firestore instance
import { v4 as uuidv4 } from "uuid"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface School {
  id: string;
  SchoolName: string;
  SchoolTitle: string;
}

export function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newSchool, setNewSchool] = useState({ SchoolName: "", SchoolTitle: "" });

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Schools"));
        const schoolsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as School[];
        setSchools(schoolsData);
      } catch (error) {
        console.error("Error fetching schools:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const handleCreateSchool = async () => {
    if (!newSchool.SchoolName.trim() || !newSchool.SchoolTitle.trim()) return;
    
    const newId = uuidv4(); // Generate unique ID
    const newSchoolData: School = {
      id: newId,
      ...newSchool
    };

    try {
      await setDoc(doc(db, "Schools", newId), newSchoolData);
      setSchools([...schools, newSchoolData]); 
      setNewSchool({ SchoolName: "", SchoolTitle: "" });
      setIsDialogOpen(false); 
    } catch (error) {
      console.error("Error adding school:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>

        <DialogTrigger asChild>
          <Card className="w-[350px] h-[150px] flex items-center justify-center cursor-pointer border-dashed border-2 border-gray-300 hover:bg-gray-800 transition">
            <p className="text-4xl text-gray-500">+</p>
          </Card>
        </DialogTrigger>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>Add New School</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter School Name"
              value={newSchool.SchoolName}
              onChange={(e) => setNewSchool({ ...newSchool, SchoolName: e.target.value })}
            />
            <Input
              placeholder="Enter School Title"
              value={newSchool.SchoolTitle}
              onChange={(e) => setNewSchool({ ...newSchool, SchoolTitle: e.target.value })}
            />
            <Button className="w-full" onClick={handleCreateSchool}>Add School</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Display Schools */}
      {loading ? (
        <>
          <Skeleton className="h-[150px] w-[350px] rounded-md" />
          <Skeleton className="h-[150px] w-[350px] rounded-md" />
          <Skeleton className="h-[150px] w-[350px] rounded-md" />
          <Skeleton className="h-[150px] w-[350px] rounded-md" />
          <Skeleton className="h-[150px] w-[350px] rounded-md" />
          <Skeleton className="h-[150px] w-[350px] rounded-md" />
          <Skeleton className="h-[150px] w-[350px] rounded-md" />
          <Skeleton className="h-[150px] w-[350px] rounded-md" />
        </>
      ) : schools.length > 0 ? (
        schools.map((school) => (
          <Card key={school.id} className="w-[350px] h-[150px] shadow-md">
            <CardHeader>
              <CardTitle>{school.SchoolName}</CardTitle>
              <CardDescription>{school.SchoolTitle}</CardDescription>
            </CardHeader>
          </Card>
        ))
      ) : (
        <p className="text-center col-span-full">No schools found.</p>
      )}
    </div>
  );
}
