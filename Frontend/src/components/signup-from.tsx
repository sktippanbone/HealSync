import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../Database/FirebaseConfig";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [alert, setAlert] = useState<{
    type: "success" | "danger" | null;
    message: string;
  } | null>(null);

  // OTP-related state variables
  const [isOTPBoxVisible, setIsOTPBoxVisible] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [userCode, setUserCode] = useState("");
  const [otpError, setOtpError] = useState("");

  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (formData.name.trim().length < 2 || formData.name.trim().length > 20) {
      newErrors.name = "Name should be between 2 and 20 characters.";
    }
    if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Invalid email format.";
    }
    if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must have at least 8 characters, one uppercase, one lowercase, one digit, and one special character.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (resendTimer === 0) {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/send-otp`, {
          email: formData.email,
        });
        startResendTimer();
        setAlert({
          type: "success",
          message: "OTP resent. Please check your email.",
        });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setOtpError("Failed to resend OTP. Please try again.");
      }
    }
  };

  const handleVerifyOTP = async () => {
    setOtpError("");
    if (userCode.trim().length !== 6) {
      setOtpError("Please enter a 6-digit OTP.");
      return;
    }
    try {
      const codeAsInt = parseInt(userCode, 10);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/verify-otp`, {
        email: formData.email,
        userCode: codeAsInt,
      });
      // OTP is valid – proceed with user registration
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: formData.name });
      const uid = uuidv4();
      await setDoc(doc(db, "Users", uid), {
        name: formData.name,
        email: formData.email,
        userType: "Student",
        uid,
      });
      setAlert({
        type: "success",
        message: "Registration successful! Redirecting...",
      });
      navigate("/dashboard");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setOtpError("Invalid OTP. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    if (!validateForm()) return;

    // If OTP box is not visible, initiate OTP sending process
    if (!isOTPBoxVisible) {
      try {
        const signInMethods = await fetchSignInMethodsForEmail(
          auth,
          formData.email
        );
        if (signInMethods.length > 0) {
          setErrors((prev) => ({
            ...prev,
            email: "Email is already in use.",
          }));
          return;
        }
        await axios.post(`${import.meta.env.VITE_API_URL}/api/send-otp`, {
          email: formData.email,
        });
        setIsOTPBoxVisible(true);
        startResendTimer();
        setAlert({
          type: "success",
          message: "OTP sent. Please check your email.",
        });
        return;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setAlert({
          type: "danger",
          message: "Error sending OTP. Please try again.",
        });
        return;
      }
    }
    // If OTP box is already visible, do nothing here.
    // User should click the "Verify OTP" button to complete registration.
  };

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <form
      className={cn("flex flex-col gap-6 w-[400px]", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      {alert && (
        <div
          className={`fixed top-0 left-1/2 transform -translate-x-1/2 p-2 w-2/4 mt-1 text-sm ${
            alert.type === "danger"
              ? "text-red-700 bg-red-100"
              : "text-green-700 bg-green-100"
          } rounded-lg flex items-center justify-center gap-2 text-center`}
        >
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M15.133 10.632v-1.8a5.407 5.407 0 0 0-4.154-5.262.955.955 0 0 0 .021-.106V1.1a1 1 0 0 0-2 0v2.364a.944.944 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C4.867 13.018 3 13.614 3 14.807 3 15.4 3 16 3.538 16h12.924C17 16 17 15.4 17 14.807c0-1.193-1.867-1.789-1.867-4.175Zm-13.267-.8a1 1 0 0 1-1-1 9.424 9.424 0 0 1 2.517-6.39A1.001 1.001 0 1 1 4.854 3.8a7.431 7.431 0 0 0-1.988 5.037 1 1 0 0 1-1 .995Zm16.268 0a1 1 0 0 1-1-1A7.431 7.431 0 0 0 15.146 3.8a1 1 0 0 1 1.471-1.354 9.425 9.425 0 0 1 2.517 6.391 1 1 0 0 1-1 .995ZM6.823 17a3.453 3.453 0 0 0 6.354 0H6.823Z" />
          </svg>
          <div>{alert.message}</div>
        </div>
      )}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign Up to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to create your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder=""
            required
            onChange={handleChange}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            onChange={handleChange}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            onChange={handleChange}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            required
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
          )}
        </div>
        {isOTPBoxVisible && (
          <div className="grid gap-2 ">
            <Label htmlFor="otp" className="m-auto">
              Enter OTP
            </Label>
            <div className="space-y-2 m-auto">
              <InputOTP
                maxLength={6}
                value={userCode}
                onChange={(value) => setUserCode(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot
                    index={0}
                    className="w-10 h-10 text-lg p-2 border-2 border-gray-300 rounded-md"
                  />
                  <InputOTPSlot
                    index={1}
                    className="w-10 h-10 text-lg p-2 border-2 border-gray-300 rounded-md"
                  />
                  <InputOTPSlot
                    index={2}
                    className="w-10 h-10 text-lg p-2 border-2 border-gray-300 rounded-md"
                  />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot
                    index={3}
                    className="w-10 h-10 text-lg p-2 border-2 border-gray-300 rounded-md"
                  />
                  <InputOTPSlot
                    index={4}
                    className="w-10 h-10 text-lg p-2 border-2 border-gray-300 rounded-md"
                  />
                  <InputOTPSlot
                    index={5}
                    className="w-10 h-10 text-lg p-2 border-2 border-gray-300 rounded-md"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {otpError && <p className="text-red-500 text-xs">{otpError}</p>}
            <div className="flex justify-between mt-2">
              <Button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </Button>
              <Button type="button" onClick={handleVerifyOTP}>
                Verify OTP
              </Button>
            </div>
          </div>
        )}
        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Login
        </a>
      </div>
    </form>
  );
}
