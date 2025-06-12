// src/components/LoginForm.tsx
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { auth } from "../Database/FirebaseConfig";
import { signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../Database/FirebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext"; 
import { useUser } from "../hooks/userContext";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setIsAuthenticated, isAuthenticated } = useAuth(); 
  const { setUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectToDashboard = async () => {
        const usersRef = collection(db, "Users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          const userType = userData.userType;
          switch (userType) {
            case "Student":
              navigate('/student-dashboard');
              break;
            case "Admin":
              navigate('/admin-dashboard');
              break;
            default:
              alert("Invalid user type");
          }
        }
      };

      redirectToDashboard();
    }
  }, [isAuthenticated, email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const userCredential = await signInWithEmailAndPassword(auth, email, password);


      // Set authenticated state
      setIsAuthenticated(true);

      // Now handle navigation based on user type
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const userType = userData.userType;
        const userId = userData.uid;
        const userName = userData.name;
        const userEmail = userData.email;

        setUser(userId , userType , userName, userEmail);
        switch (userType) {
          case "Student":
            navigate('/student-dashboard');
            break;
          case "Admin":
            navigate('/admin-dashboard');
            break;
          default:
            alert("Invalid user type");
        }
      } else {
        alert("User data not found for the provided email.");
      }
    } catch (error ) {
      console.error("Error logging in: ", error);
      const authError = error as AuthError;
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
        alert("Invalid email or password. Please sign up if you don't have an account.");
      } else {
        const errorMessage = authError.message || "Unknown error";
        alert("Error logging in: " + errorMessage);
      }
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </div>
      <div className="text-center text-sm">
        Don't have an account?{" "}
        <a href="/signup" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </form>
  );
}