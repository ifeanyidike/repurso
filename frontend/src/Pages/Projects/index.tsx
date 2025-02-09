import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Plus, Image as ImageIcon, Search, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

import { ProjectType } from "@/types/project";
import { observer } from "mobx-react-lite";
import { projectStore } from "@/store/ProjectStore";
import NewProjectCard from "./components/NewProjectCard";
import FiltersAndControls from "./components/FiltersAndControls";
import ProjectCard from "./components/ProjectCard";
import ListView from "./components/ListView";

const ProjectDashboard = observer(() => {
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [projectDetails, setProjectDetails] = useState<ProjectType>();

  const { user, getAccessTokenSilently } = useAuth0();
  // const [projects, setProjects] = useState([]);

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "marketing", label: "Marketing" },
    { id: "tutorials", label: "Tutorials" },
    { id: "social", label: "Social Media" },
  ];

  useEffect(() => {
    (async () => {
      if (user) {
        const token = await getAccessTokenSilently();

        await projectStore.getProjects(user.sub!, token);
      }
    })();
  }, [user?.sub]);
  // console.log("projects", projectStore.projects);

  // const projects = [
  //   {
  //     id: 1,
  //     title: "Marketing Campaign Videos",
  //     description: "Weekly video content for social media marketing campaigns",
  //     thumbnail: "https://fakeimg.pl/400x250",
  //     videoCount: 12,
  //     category: "marketing",
  //     progress: 75,
  //     collaborators: 4,
  //     dueDate: "2025-02-15",
  //     status: "active",
  //   },
  //   {
  //     id: 2,
  //     title: "Product Tutorials",
  //     description:
  //       "Comprehensive step-by-step guide videos for new feature releases",
  //     thumbnail:
  //       "https://cdn.pixabay.com/photo/2022/10/18/17/00/night-7530755_1280.jpg",
  //     videoCount: 8,
  //     category: "tutorials",
  //     progress: 45,
  //     collaborators: 3,
  //     dueDate: "2025-03-01",
  //     status: "pending",
  //   },
  // ];

  // const _projects = [
  //   // {
  //   //   id: 1,
  //   //   title: "Marketing Campaign Videos",
  //   //   description: "Weekly video content for social media marketing campaigns",
  //   //   category: "marketing",
  //   //   progress: 75,
  //   //   collaborators: 4,
  //   //   dueDate: "2025-02-15",
  //   //   status: "active",
  //   // },
  //   // {
  //   //   id: 2,
  //   //   title: "Product Tutorials",
  //   //   description:
  //   //     "Comprehensive step-by-step guide videos for new feature releases",
  //   //   category: "tutorials",
  //   //   progress: 45,
  //   //   collaborators: 3,
  //   //   dueDate: "2025-03-01",
  //   //   status: "pending",
  //   // },
  // ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 transition-all duration-200 ease-in-out group-focus-within:text-blue-600 group-hover:text-blue-600" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-12 py-2 pr-4 text-gray-800 placeholder:text-gray-500 placeholder:opacity-70 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out group hover:border-blue-400 hover:shadow-lg group-focus-within:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Dialog
                open={showNewProjectDialog}
                onOpenChange={setShowNewProjectDialog}
              >
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-5 w-5 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Start a new project and invite your team members.
                    </DialogDescription>
                  </DialogHeader>
                  {/* Add your new project form here */}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <FiltersAndControls
        viewMode={viewMode}
        sortBy={sortBy}
        setViewMode={setViewMode}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        setSortBy={setSortBy}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        <NewProjectCard
          showNewProjectDialog={showNewProjectDialog}
          setShowNewProjectDialog={setShowNewProjectDialog}
          projectDetails={projectDetails}
          setProjectDetails={setProjectDetails}
          projectsExist={projectStore.projects.length > 0}
        />

        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
              : "flex flex-col gap-4"
          }
        >
          {/* New Project Card - Only show in grid view */}

          {/* Project Cards */}
          {projectStore.projects.map((project: any) => (
            <div key={project.id}>
              {viewMode === "grid" ? (
                <ProjectCard project={project} />
              ) : (
                <ListView project={project} />
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
      </div>
    </div>
  );
});

export default ProjectDashboard;
