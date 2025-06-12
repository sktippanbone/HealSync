import { createContext, useContext, useState } from "react";

interface UserContextType {
  userId: string | null;
  userType: string | null;
  userName: string | null;
  userEmail: string | null;
  setUser: (id: string, type: string, name: string, email: string) => void;
  clearUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper function for initial state retrieval
const getStoredUserData = () => ({
  userId: localStorage.getItem('userId'),
  userType: localStorage.getItem('userType'),
  userName: localStorage.getItem('userName'),
  userEmail: localStorage.getItem('userEmail'),
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const storedData = getStoredUserData();

  const [userId, setUserId] = useState<string | null>(storedData.userId);
  const [userType, setUserType] = useState<string | null>(storedData.userType);
  const [userName, setUserName] = useState<string | null>(storedData.userName);
  const [userEmail, setUserEmail] = useState<string | null>(storedData.userEmail);

  const setUser = (id: string, type: string, name: string, email: string) => {
    setUserId(id);
    setUserType(type);
    setUserName(name);
    setUserEmail(email);

    // Store user information in localStorage
    localStorage.setItem('userId', id);
    localStorage.setItem('userType', type);
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
  };

 const clearUserData = async () => {
    setUserId(null);
    setUserType(null);
    setUserName(null);
    setUserEmail(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
  };

  // console.log(userId, userType, userName, userEmail);

  return (
    <UserContext.Provider value={{ userId, userType, userName, userEmail, setUser, clearUserData }}>
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}