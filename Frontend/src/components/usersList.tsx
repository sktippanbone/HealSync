import  { useState, useEffect } from "react";
import {
    ColumnDef,
    flexRender,
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
  } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { doc, getDocs, updateDoc, collection } from "firebase/firestore";
import { db } from "../Database/FirebaseConfig";
import { Button } from "@/components/ui/button";

export type User = {
    id: string;
    email: string;
    name: string;
    prn: string;
    userType: "Student" | "Admin";
};



const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
 
  {
    accessorKey: "userType",
    header: "User Type",
    cell: ({ row }) => {
      const user = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [newUserType, setNewUserType] = useState(user.userType);

      const handleSubmitChange = async () => {
        const userRef = doc(db, "Users", user.id);

        try {
          await updateDoc(userRef, { userType: newUserType });
          // You can implement your own data updating logic here
          // For now, it's a simple console.log
          console.log("User type updated");
        } catch (error) {
          console.error("Error updating user type: ", error);
        }
      };

      return (
        <div className="flex items-center w-full ">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-between max-w-[200px] w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              {newUserType.charAt(0).toUpperCase() + newUserType.slice(1)}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {["Student", "Admin"].map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => setNewUserType(type as "Student"  | "Admin")}
                  className={type === newUserType ? "bg-gray-200" : ""}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleSubmitChange} className="ml-2">
            Change
          </Button>
        </div>
      );
    },
  },
];

const AdminUserTable = () => {
    const [data, setData] = useState<User[]>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    useEffect(() => {
        const fetchData = async () => {
            const querySnapshot = await getDocs(collection(db, "Users"));
            const users = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as User[];
            setData(users);
        };
        fetchData();
    }, []);

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <><div className="w-full py-4 pl-10 mt-5">
            <Input
                placeholder="Search users..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm" />
        </div><div className="rounded-md  px-10">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center">
                                    {data.length === 0 ? (
                                    <div className="flex justify-center items-center">
                                      <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                      </svg>
                                      <span className="ml-2">Loading...</span>
                                    </div>
                                    ) : "No results found."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div></>
    );
};

export default AdminUserTable;