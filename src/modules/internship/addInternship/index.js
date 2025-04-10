import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { DateField, ImageUpload } from "./formcomponents";
import { ReusableField } from "./formcomponents";
import { useSelector } from "react-redux";

const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

const FormSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    desc: z.string().min(20, {
        message: "Event description must be at least 20 characters.",
    }),
    url: z.string().min(10, {
        message: "Form URL must be at least 10 characters.",
    }),
    startDate: z.date({
        required_error: "Start date is required.",
    }).refine((startDate) => {
        return startDate.setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0);
    }, {
        message: "Start date must be greater than or equal to today's date.",
    }),
    image: z
        .any()
        .refine(
            (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
            "Only .jpg, .jpeg, .png, and .webp formats are supported."
        ),
});

export function AddInternship() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [logo, setLogo] = useState(null);
    const { user } = useSelector((state) => state.user);

    const hasPermission = user && user.erpID === "111111";
    //const hasPermission = user && user.erpID === "220600077";
    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            image: null,
            title: "",
            desc: "",
            url: "",
            startDate: new Date(),
        },
    });

    async function onSubmit(data) {
        if(isSubmitting) return;
        setIsSubmitting(true);
        try {
            console.log(data)
            const formData = new FormData();
            for (const key in data) {
                formData.append(key, data[key]);
            }
            const response = await axios.post("/api/internship/create", formData);
            console.log(response);
            if (response.data.success) {
                form.reset();
                setLogo(null);
                toast.success("Internship added successfully!");
            } else {
                toast.error("Failed to add. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
            console.error("Error:", error);
        }finally{
            setIsSubmitting(false);
        }
    }

    if (!hasPermission) {
        return null;
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size="lg" className="button w-full sm:w-fit">Upload Jobs</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="md:h-max h-svh">
                <AlertDialogHeader>
                    <AlertDialogTitle>Add Internship</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="overflow-auto p-1">
                    <Form {...form} >
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 select-none">
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                <ImageUpload
                                    form={form}
                                    name="image"
                                    label="Image"
                                    description="Choose your logo wisely."
                                    preview={logo}
                                    setPreview={setLogo}
                                />
                                <div className="col-span-2 grid gap-y-3">
                                    <div className="grid col-span-2 gap-6">
                                        <ReusableField
                                            form={form}
                                            name="title"
                                            label="Title*"
                                            placeholder="Title"
                                            component={Input}
                                        />
                                        <ReusableField
                                            form={form}
                                            name="desc"
                                            label="Description*"
                                            placeholder="Description"
                                            component={Textarea}
                                        />
                                        <ReusableField
                                            form={form}
                                            name="url"
                                            label="URL*"
                                            placeholder="Form URL"
                                            component={Input}
                                        />
                                        <DateField
                                            form={form}
                                            label="Application Deadline*"
                                            name="startDate"
                                        />
                                    </div>
                                </div>
                            </div>

                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting? "Submitting..." : "Continue"}</Button>
                            </AlertDialogFooter>
                        </form>
                    </Form>
                </div>
            </AlertDialogContent>
        </AlertDialog >
    );
}
