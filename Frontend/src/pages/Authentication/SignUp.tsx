import { GalleryVerticalEnd } from "lucide-react"
import { SignUpForm } from "@/components/signup-from"
import { ScrollArea } from "@/components/ui/scroll-area"
import hospitalsLogo from "../../assets/WhatsApp Image 2025-02-22 at 17.49.02.jpeg"
import hospitalsLanding from "../../assets/1699275917532.jpeg"

export default function SignUp() {
    return (
            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="relative hidden bg-muted lg:block">
                    <img
                        src={hospitalsLanding}
                        alt="projectLogo"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-in-out transform hover:scale-90 dark:brightness-[0.9] dark:grayscale"
                    />
                    <img src={hospitalsLogo} className="absolute left-10 top-10 h-12 w-auto" />
                </div>
                <div className="flex flex-col gap-4 p-6 md:p-10 mj">
                    <div className="flex justify-center gap-2 md:justify-start">
                        <a href="#" className="flex items-center gap-2 font-medium">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                <GalleryVerticalEnd className="size-4" />
                            </div>
                            Kalyan Doc
                        </a>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                    <ScrollArea className="h-[480px] w-[500px] rounded-md p-4 left-10">
                        <div className="w-full max-w-xs pl-2">
                            <SignUpForm />
                        </div>
                       </ScrollArea>
                    </div>
                </div>
            </div>
    )
}