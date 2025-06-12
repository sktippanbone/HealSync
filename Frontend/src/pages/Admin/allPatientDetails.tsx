import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../Database/FirebaseConfig"; 
import { doc, getDoc } from "firebase/firestore";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import axios from 'axios'; // Import axios for API calls
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
}

const DocumentViewerModal = ({ isOpen, onClose, url }: ModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Document Viewer</DialogTitle>
                    <DialogClose />
                </DialogHeader>
                <iframe src={url} width="100%" height="600" style={{ border: "none" }} title="Document Viewer" />
                <div className="text-right mt-2">
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">Download Document</Button>
                    </a>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Modal for displaying the summary
const SummaryModal = ({ isOpen, onClose, summary }: { isOpen: boolean; onClose: () => void; summary: any; }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[80vh] overflow-y-auto w-auto">
                <DialogHeader>
                    <DialogTitle>Generated Summary</DialogTitle>
                    <DialogClose />
                </DialogHeader>
                <DialogDescription>
                    <ScrollArea className="p-4 bg-gray-100 rounded-md">
                        {summary ? (
                            <div className="whitespace-pre-wrap">
                                {Object.entries(summary).map(([key, value]) => (
                                    <div key={key} className="mb-2">
                                        <strong>{key}:</strong> {typeof value === 'object' ? (
                                            <ul className="list-disc pl-5">
                                                {value && Object.entries(value).map(([subKey, subValue]) => (
                                                    <li key={subKey}>
                                                        <strong>{subKey}:</strong> {String(subValue)}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span>{String(value)}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No summary available.</p>
                        )}
                    </ScrollArea>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};

export function AllPatient() {
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState<{ id: string; date: string; doctor: string; url: string; type: string; loading: boolean }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
    const [selectedRows, setSelectedRows] = useState<string[]>([]); 
    const [generatedSummary, setGeneratedSummary] = useState<string | null>(null); 
    const [isGeneratingAllSummaries, setIsGeneratingAllSummaries] = useState<boolean>(false); // New state for loading summaries for selected rows
    const AadharId = location.state?.aadhaar || '';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(db, "patients", AadharId); 
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const fileUrls = docSnap.data().fileUrls || [];
                    const formattedData = fileUrls.map((file: any, index: number) => ({
                        id: `file-${index}`,
                        date: file.date || "N/A",
                        doctor: file.doctor || "Unknown",
                        url: file.url || "#",
                        type: file.type || "Unknown",
                        loading: false 
                    }));
                    setData(formattedData);
                } else {
                    setError("No patient data found");
                }
            } catch (err) {
                setError("Error fetching data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [AadharId]);

    const generateSummary = async (urls: string[], rowIndex?: number) => {
        const dataToSend = { pdf_urls: urls };

        if (rowIndex !== undefined) {
            setData(prev => 
                prev.map((item, index) =>
                    index === rowIndex ? { ...item, loading: true } : item
                )
            );
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_MODEL_API_URL}/summarize`, dataToSend);
            console.log("Summaries generated:", response.data);

            if (rowIndex !== undefined) {
                setData(prev => 
                    prev.map((item, index) =>
                        index === rowIndex ? { ...item, loading: false } : item
                    )
                );
            }

            setGeneratedSummary(response.data || ""); 
            setIsSummaryModalOpen(true);
        } catch (error) {
            console.error("Error generating summaries:", error);
            if (rowIndex !== undefined) {
                setData(prev => 
                    prev.map((item, index) =>
                        index === rowIndex ? { ...item, loading: false } : item
                    )
                );
            }
        }
    };

    const handleGenerateSummaryForAll = async () => {
        const urls = selectedRows.map(id => data.find(row => row.id === id)?.url).filter(Boolean);
        if (urls.length > 0) {
            setIsGeneratingAllSummaries(true); 
            try {
                await generateSummary(urls.filter((url): url is string => !!url));
            } finally {
                setIsGeneratingAllSummaries(false);
            }
        }
    };

    const columns: ColumnDef<any>[] = [
        {
            id: "select",
            header: ({ }) => (
                <Checkbox
                    onCheckedChange={(isChecked) => {
                        setSelectedRows(isChecked ? data.map((row) => row.id) : []);
                    }}
                    checked={selectedRows.length === data.length}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedRows.includes(row.original.id)}
                    onCheckedChange={() => {
                        const isSelected = selectedRows.includes(row.original.id);
                        setSelectedRows((prev) => 
                            isSelected 
                                ? prev.filter(id => id !== row.original.id) 
                                : [...prev, row.original.id]
                        );
                    }}
                    aria-label={`Select row ${row.original.id}`}
                />
            ),
        },
        { accessorKey: "date", header: "Date" },
        { accessorKey: "doctor", header: "Doctor" },
        { accessorKey: "type", header: "Type" },
        {
            id: "view",
            header: "View",
            cell: ({ row }) => (
                <Button variant="ghost" onClick={() => {
                    setSelectedDocumentUrl(row.original.url);
                    setIsModalOpen(true);
                }}>
                    <Eye />
                </Button>
            ),
        },
        {
            id: "generateSummary",
            header: "Generate Summary",
            cell: ({ row }) => (
                <Button variant="outline" onClick={() => generateSummary([row.original.url], row.index)} disabled={loading || row.original.loading}>
                    {row.original.loading ? ( 
                        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                    ) : (
                        "Generate Summary"
                    )}
                </Button>
            ),
        },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    if (loading) return (
        <div className="flex justify-center items-center">
            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span className="ml-2">Loading...</span>
        </div>
    );

    if (error) return <p>{error}</p>;

    return (
        <div className="w-full">
            <button className="mt-4 ml-4 p-2 black:bg-gray-300 hover:bg-gray-500 rounded" onClick={() => navigate(-1)}>
                🔙 Back
            </button>
            <div className="flex items-center py-4 px-10">
                <Input placeholder="Filter by doctor..." className="max-w-sm" />
            </div>
            <div className="rounded-md px-10">
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
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-end p-4 pr-10 mr-20">
                <Button 
                    variant="outline" 
                    onClick={handleGenerateSummaryForAll} 
                    disabled={selectedRows.length === 0 || isGeneratingAllSummaries}  // Disable if already generating summaries
                >
                    {isGeneratingAllSummaries ? (
                        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                    ) : (
                        "Generate Summary for Selected"
                    )}
                </Button>
            </div>

            <DocumentViewerModal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedDocumentUrl(null);
                }} 
                url={selectedDocumentUrl} 
            />

            <SummaryModal 
                isOpen={isSummaryModalOpen} 
                onClose={() => {
                    setIsSummaryModalOpen(false);
                    setGeneratedSummary(null);
                }} 
                summary={generatedSummary || ""} 
            />
        </div>
    );
}