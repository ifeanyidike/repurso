import React from "react";
import { Plus, Image as ImageIcon, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const NewProjectCard = ({
  showNewProjectDialog,
  setShowNewProjectDialog,
}: any) => {
  return (
    <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
      <DialogTrigger asChild>
        <div className="group relative max-w-[650px] h-[320px] mx-auto bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center shadow-md mb-4">
              <Plus className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Create New Project
            </h3>
            <p className="text-sm text-gray-500 mt-2 text-center max-w-[240px]">
              Start a new project and collaborate with your team
            </p>
            <Button variant="outline" className="mt-6 group-hover:bg-blue-100">
              Get Started
            </Button>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] ">
        <DialogHeader>
          <DialogTitle className="text-gray-800 text-xl font-bold">
            Create New Project
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Fill in the project details to get started. You can always edit
            these later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Project Title
              </label>
              <Input placeholder="Enter project title" className="mt-1" />
              <p className="text-xs text-gray-500 mt-1">
                E.g., Social Media Campaign
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <Input placeholder="Brief project description" className="mt-1" />
              <p className="text-xs text-gray-500 mt-1">
                Provide a short summary of the project.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between mt-1"
                  >
                    Select category
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem>Marketing</DropdownMenuItem>
                  <DropdownMenuItem>Tutorials</DropdownMenuItem>
                  <DropdownMenuItem>Social Media</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Due Date
              </label>
              <Input type="date" className="mt-1" />
              <p className="text-xs text-gray-500 mt-1">
                Set a deadline for the project.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowNewProjectDialog(false)}
            >
              Cancel
            </Button>
            <Button>Create Project</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectCard;
