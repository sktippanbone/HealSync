import * as React from "react"
import { useEffect, useState } from "react"
import { GalleryVerticalEnd, SquareTerminal, Book, FileText } from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { db } from "../Database/FirebaseConfig"
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { collection, getDocs } from "firebase/firestore"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userId?: string;
  userType?: string;
  userName?: string;
  userEmail?: string;
}

interface Test {
  id: string;
  TestName: string;
}

interface Chapter {
  id: string;
  ChapterNo: number;
  Title: string;
  tests: Test[];
}

interface Course {
  id: string;
  CourseName: string;
  EnrolledStudentId: string[];
  TeacherId: string;
  CourseTitle: string;
  chapters: Chapter[];
}

export function AppSidebar({ userId, userType , userName , userEmail, ...props }: AppSidebarProps) {
  const [courses, setCourses] = useState<Course[]>([]);

  // Fetch courses, chapters, and tests
  useEffect(() => {
    const fetchCourses = async () => {
      const coursesCollection = collection(db, "Courses");
      const coursesSnapshot = await getDocs(coursesCollection);
      const coursesList: Course[] = [];

      for (const courseDoc of coursesSnapshot.docs) {
        const courseData = courseDoc.data();
        const course: Course = {
          id: courseDoc.id,
          CourseName: courseData.CourseName,
          EnrolledStudentId: courseData.EnrolledStudentId || [],
          TeacherId: courseData.TeacherId,
          CourseTitle: courseData.Title,
          chapters: [],
        };

        // Filter courses based on userType
        if (userType === "Student" && userId && !course.EnrolledStudentId.includes(userId)) {
          continue;
        }
        if (userType === "Teacher" && course.TeacherId !== userId) {
          continue;
        }

        // Fetch Chapters inside the Course
        const chaptersCollection = collection(db, `Courses/${course.id}/Chapters`);
        const chaptersSnapshot = await getDocs(chaptersCollection);
        const chaptersList: Chapter[] = [];

        for (const chapterDoc of chaptersSnapshot.docs) {
          const chapterData = chapterDoc.data();
          const chapter: Chapter = {
            id: chapterDoc.id,
            ChapterNo: chapterData.ChapterNo,
            Title: chapterData.Title,
            tests: [],
          };

          // Fetch Tests inside the Chapter
          const testsCollection = collection(db, `Courses/${course.id}/Chapters/${chapter.id}/Test`);
          const testsSnapshot = await getDocs(testsCollection);
          chapter.tests = testsSnapshot.docs.map(testDoc => ({
            id: testDoc.id,
            TestName: testDoc.data().TestName,
          }));

          chaptersList.push(chapter);
        }

        course.chapters = chaptersList;
        coursesList.push(course);
      }

      setCourses(coursesList);
    };

    fetchCourses();
  }, [userId, userType]);

  // Sidebar Data Structure
  const sidebarData = {
    user: {
      name: userName || "Default Name",
      email: userEmail || "default@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: "Acme Inc",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
    ],
    navMain: [
      {
        title: "Courses",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: courses.map(course => ({
          title:  <Link to={`/courses/${course.id}`}>{course.CourseName}</Link>,
          url: "#",
          icon: Book,
          items: course.chapters.map(chapter => ({
            title: `Chapter ${chapter.ChapterNo}: ${chapter.Title}`,
            url: "#",
            icon: Book,
            items: chapter.tests.map(test => ({
              title: `Test: ${test.TestName}`,
              url: "#",
              icon: FileText,
            })),
          })),
        })),
      },
    ],
  };

  // console.log(sidebarData.navMain);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
