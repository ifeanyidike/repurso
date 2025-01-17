import React, { useState, ChangeEvent } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Sparkles,
  ArrowRight,
  Video,
  Image as ImageIcon,
  Type,
  Wand2,
  FileVideo,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ContentType {
  icon: LucideIcon;
  label: string;
  description: string;
}

interface FormData {
  title: string;
  description: string;
  contentType: string;
  file: File | null;
}

interface CreateContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialFormData: FormData = {
  title: "",
  description: "",
  contentType: "",
  file: null,
};

const contentTypes: ContentType[] = [
  {
    icon: Video,
    label: "Video Content",
    description: "Create engaging video content",
  },
  {
    icon: ImageIcon,
    label: "Visual Story",
    description: "Design visual narratives",
  },
  {
    icon: Type,
    label: "Text & Graphics",
    description: "Combine text with graphics",
  },
];

const CreateContentDialog: React.FC<CreateContentDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, file: files[0] }));
      simulateUpload();
    }
  };

  const simulateUpload = (): void => {
    setUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setUploading(false);
      }
    }, 200);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const isStepValid = (): boolean => {
    switch (step) {
      case 1:
        return Boolean(formData.title && formData.description);
      case 2:
        return Boolean(formData.contentType);
      case 3:
        return Boolean(formData.file || uploading);
      default:
        return false;
    }
  };

  const renderStepContent = (): JSX.Element => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 flex-1">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Let's Create Something Amazing
              </h2>
              <p className="text-gray-500">
                Start by giving your creation a name and description
              </p>
            </div>

            <div className="space-y-4 mt-8">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a catchy title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Describe what you're creating..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full h-32 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 flex-1">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 mx-auto flex items-center justify-center mb-4">
                <Wand2 className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Choose Your Content Type
              </h2>
              <p className="text-gray-500">
                Select the type of content you want to create
              </p>
            </div>

            <div className="grid gap-4 mt-8">
              {contentTypes.map(({ icon: Icon, label, description }) => (
                <button
                  key={label}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, contentType: label }))
                  }
                  className={`p-4 border rounded-xl text-left transition-all ${
                    formData.contentType === label
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                      : "hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  type="button"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-lg bg-white border shadow-sm flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">{label}</h3>
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 flex-1">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center mb-4">
                <FileVideo className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Upload Your Content</h2>
              <p className="text-gray-500">
                Upload your file or drag and drop it here
              </p>
            </div>

            <div className="mt-8">
              {!formData.file && !uploading ? (
                <div className="border-2 border-dashed rounded-xl p-8 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="video/*,image/*"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 mb-2">
                      Drag and drop your file here, or click to browse
                    </p>
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                        <FileVideo className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {formData.file?.name || "Uploading..."}
                        </p>
                        <p className="text-sm text-gray-500">
                          {uploading ? "Uploading..." : "Ready to process"}
                        </p>
                      </div>
                      {uploading && (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      )}
                    </div>
                    {uploading && (
                      <Progress value={uploadProgress} className="mt-4" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <></>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] p-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0">
          <Progress value={step * 33.33} className="rounded-none h-1" />
        </div>

        <div className="p-6 flex flex-col h-full">
          {renderStepContent()}

          <div className="border-t mt-auto pt-4 flex justify-between">
            <Button
              variant="ghost"
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (step < 3) {
                  setStep(step + 1);
                } else {
                  onOpenChange(false);
                }
              }}
              disabled={!isStepValid()}
            >
              {step === 3 ? "Create Content" : "Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContentDialog;
