import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Film,
  Pencil,
  Share2,
  Box,
  ArrowRight,
  Play,
  Image as ImageIcon,
  Filter,
  Clock,
  Settings,
  MoreVertical,
  ChevronDown,
  BookMarked,
  Trash2,
  Download,
  Grid,
  List,
  AlertCircle,
  X,
  ChevronLeft,
  ExternalLink,
  Copy,
  Users,
  Sparkles,
  LayoutGrid,
  Wand2,
} from "lucide-react";
import TemplateSelector from "./TemplateSelector";
import AIEffectsPanel from "./AIEffectsPanel";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectType } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ContentPreviewSection from "./ContentPreviewSection";
import { observer } from "mobx-react-lite";
import { projectStore } from "@/store/ProjectStore";
import CreateContentDialog from "./ContentCreationDialog.tsx";

type Props = {
  project: ProjectType;
};

// Enhanced content type with more fields
interface Content {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
  status: "draft" | "processing" | "ready" | "failed" | "archived";
  variations: number;
  platform: "YouTube" | "Instagram" | "TikTok" | "Twitter" | "LinkedIn";
  created: string;
  views: number;
  engagement: number;
  tags: string[];
  description?: string;
  author?: {
    name: string;
    avatar: string;
  };
  lastModified?: string;
  processingProgress?: number;
  error?: string;
  shareCount?: number;
  collaborators?: number;
}

const content: Content[] = [
  {
    id: 1,
    title: "Product Demo Walkthrough",
    thumbnail:
      "https://cdn.pixabay.com/photo/2022/10/18/17/00/night-7530755_1280.jpg",
    duration: "5:24",
    status: "ready",
    variations: 3,
    platform: "YouTube",
    created: "2024-01-10",
    views: 1234,
    engagement: 8.7,
    tags: ["demo", "product", "tutorial"],
    description: "Comprehensive walkthrough of our latest product features",
    author: {
      name: "Sarah Chen",
      avatar:
        "https://cdn.pixabay.com/photo/2022/10/18/17/00/night-7530755_1280.jpg",
    },
    lastModified: "2024-01-15",
    shareCount: 45,
    collaborators: 3,
  },
  {
    id: 2,
    title: "Feature Highlights Reel",
    thumbnail:
      "https://cdn.pixabay.com/photo/2022/10/18/17/00/night-7530755_1280.jpg",
    duration: "3:15",
    status: "processing",
    variations: 0,
    platform: "Instagram",
    created: "2024-01-12",
    views: 567,
    engagement: 6.2,
    tags: ["features", "promo"],
    description: "Quick showcase of top features",
    author: {
      name: "Mike Wilson",
      avatar:
        "https://cdn.pixabay.com/photo/2022/10/18/17/00/night-7530755_1280.jpg",
    },
    processingProgress: 65,
    lastModified: "2024-01-14",
    shareCount: 12,
    collaborators: 2,
  },
  {
    id: 3,
    title: "Failed Export Test",
    thumbnail:
      "https://cdn.pixabay.com/photo/2022/10/18/17/00/night-7530755_1280.jpg",
    duration: "2:30",
    status: "failed",
    variations: 0,
    platform: "TikTok",
    created: "2024-01-13",
    views: 0,
    engagement: 0,
    tags: ["test"],
    error: "Export failed due to incompatible resolution",
    author: {
      name: "Alex Johnson",
      avatar:
        "https://cdn.pixabay.com/photo/2022/10/18/17/00/night-7530755_1280.jpg",
    },
    lastModified: "2024-01-13",
  },
];

const ContentStudioView = observer(() => {
  const project = projectStore.project;
  const videos = projectStore.videos;
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showAIEffects, setShowAIEffects] = useState(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // Handle template selection
  const handleTemplateSelect = (template: any) => {
    setShowTemplateSelector(false);
    // Implementation for template processingvideos
  };

  // Handle AI effects application
  const handleApplyEffects = (effects: any) => {
    setShowAIEffects(false);
    // Implementation for applying AI effects
  };

  // Filter content based on search and selected tab
  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "video" && item.duration) ||
      (selectedTab === "image" && !item.duration);
    return matchesSearch && matchesTab;
  });

  const handleDelete = (contentId: number) => {
    // Implement delete logic here
    setIsDeleteDialogOpen(false);
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  const NewContentButton = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-indigo-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Content
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => setShowTemplateSelector(true)}>
          <Box className="h-4 w-4 mr-2" />
          Use Template
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowAIEffects(true)}>
          <Box className="h-4 w-4 mr-2" />
          Use AI
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Film className="h-4 w-4 mr-2" />
          Upload Video
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ImageIcon className="h-4 w-4 mr-2" />
          Upload Image
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Add AI Effects button to content preview toolbar
  //   const ContentPreviewToolbar = () => (
  //     <div className="bg-white border-b p-4 flex items-center justify-between sticky top-0 z-20">
  //       <div className="flex items-center gap-4">
  //         <Button
  //           variant="ghost"
  //           size="sm"
  //           onClick={() => setSelectedContent(null)}
  //           className="mr-2"
  //         >
  //           <ChevronLeft className="h-4 w-4 mr-2" />
  //           Back
  //         </Button>
  //         <div>
  //           <h2 className="text-xl font-semibold">{selectedContent?.title}</h2>
  //           <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
  //             <span>Created {selectedContent?.created}</span>
  //             <span>•</span>
  //             <span>Last modified {selectedContent?.lastModified}</span>
  //           </div>
  //         </div>
  //       </div>
  //       <div className="flex items-center gap-2">
  //         <Button variant="outline" size="sm">
  //           <Download className="h-4 w-4 mr-2" />
  //           Download
  //         </Button>
  //         <Button variant="outline" size="sm">
  //           <Share2 className="h-4 w-4 mr-2" />
  //           Share
  //         </Button>
  //         <Button
  //           variant="outline"
  //           size="sm"
  //           onClick={() => setShowAIEffects(true)}
  //         >
  //           <Wand2 className="h-4 w-4 mr-2" />
  //           AI Effects
  //         </Button>
  //         <Button
  //           size="sm"
  //           className="bg-gradient-to-r from-blue-600 to-indigo-600"
  //         >
  //           <Pencil className="h-4 w-4 mr-2" />
  //           Edit
  //         </Button>
  //       </div>
  //     </div>
  //   );

  const ContentCard = ({ item }: { item: Content }) => {
    const isSelected = selectedContent?.id === item.id;

    return (
      <Card
        className={`group overflow-hidden transition-all cursor-pointer ${
          isSelected ? "ring-2 ring-blue-500" : "hover:shadow-md"
        }`}
        onClick={() => setSelectedContent(item)}
      >
        <div className="relative">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full aspect-video object-cover"
          />
          {item.duration && (
            <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
              {item.duration}
            </div>
          )}
          {item.status === "processing" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
                <div className="text-sm">
                  Processing... {item.processingProgress}%
                </div>
                <Progress value={item.processingProgress} className="mt-2" />
              </div>
            </div>
          )}
          {item.status === "failed" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white p-4">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <div className="text-sm text-red-200">{item.error}</div>
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={item.author?.avatar} />
                  <AvatarFallback>{item.author?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{item.author?.name}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge
              variant="secondary"
              className={`text-xs ${
                item.status === "failed"
                  ? "bg-red-100 text-red-700"
                  : item.status === "processing"
                  ? "bg-yellow-100 text-yellow-700"
                  : item.status === "ready"
                  ? "bg-green-100 text-green-700"
                  : ""
              }`}
            >
              {item.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {item.platform}
            </Badge>
            {item.variations > 0 && (
              <Badge variant="secondary" className="text-xs">
                {item.variations} variations
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {item.collaborators}
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              {item.shareCount}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
            <div className="relative bg-white p-8 rounded-2xl shadow-xl border">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6 hover:rotate-0 transition-transform">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Your Creative Studio Awaits
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Transform your ideas into engaging content. Start by adding your
                first piece and watch it evolve across multiple platforms.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => setDialogOpen(true)}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Content
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Watch Tutorial
                </Button>
              </div>
              <CreateContentDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
              />
            </div>
          </div>
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border shadow-sm flex flex-col items-center">
              <Box className="h-6 w-6 text-blue-500 mb-2" />
              <h3 className="font-medium mb-1">Multiple Formats</h3>
              <p className="text-sm text-gray-500">Export for any platform</p>
            </div>
            <div className="p-4 bg-white rounded-xl border shadow-sm flex flex-col items-center">
              <Users className="h-6 w-6 text-blue-500 mb-2" />
              <h3 className="font-medium mb-1">Collaboration</h3>
              <p className="text-sm text-gray-500">Work with your team</p>
            </div>
            <div className="p-4 bg-white rounded-xl border shadow-sm flex flex-col items-center">
              <Sparkles className="h-6 w-6 text-blue-500 mb-2" />
              <h3 className="font-medium mb-1">AI Enhancement</h3>
              <p className="text-sm text-gray-500">Smart content tools</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Enhanced Header */}
      <header className="h-16 bg-white border-b flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{project?.title}</h1>
          <Badge variant="secondary" className="text-sm">
            {videos.length} items
          </Badge>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          {/* <Button
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Content
          </Button> */}
          <NewContentButton />
        </div>
      </header>

      {videos.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="h-[calc(100vh-4rem)] flex">
          {/* Enhanced Left Sidebar */}
          <div className="w-80 bg-gray-50/50 border-r flex flex-col">
            <div className="p-4 border-b bg-white sticky top-0 z-10 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search content..."
                  className="pl-9 bg-gray-50/80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Recent
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Sort By <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Newest First</DropdownMenuItem>
                    <DropdownMenuItem>Oldest First</DropdownMenuItem>
                    <DropdownMenuItem>Most Viewed</DropdownMenuItem>
                    <DropdownMenuItem>Highest Engagement</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="flex-1 flex flex-col"
            >
              <div className="px-4 pt-2">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex-1">
                    Videos
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex-1">
                    Images
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div
                  className={`grid gap-4 ${
                    viewMode === "grid" ? "grid-cols-1" : "grid-cols-1"
                  }`}
                >
                  {filteredContent.map((item) => (
                    <ContentCard key={item.id} item={item} />
                  ))}
                  {filteredContent.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Search className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        No results found
                      </h3>
                      <p className="text-sm text-gray-500">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Main Content Area */}
          {selectedContent ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/30">
              {/* Top Bar */}
              <div className="bg-white border-b p-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedContent(null)}
                    className="mr-2"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedContent.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span>Created {selectedContent.created}</span>
                      <span>•</span>
                      <span>Last modified {selectedContent.lastModified}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>

              {/* Content Preview */}
              <div className="flex-1 p-8 flex justify-center items-center bg-[#1a1a1a]">
                <div className="relative max-w-4xl w-full aspect-video group">
                  <img
                    src={selectedContent.thumbnail}
                    alt={selectedContent.title}
                    className="w-full h-full object-cover rounded-lg shadow-2xl"
                  />
                  {selectedContent.status === "ready" && (
                    <Button
                      size="lg"
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="h-6 w-6" />
                    </Button>
                  )}
                  {selectedContent.status === "processing" && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4" />
                        <p className="text-lg font-medium mb-2">
                          Processing...
                        </p>
                        <Progress
                          value={selectedContent.processingProgress}
                          className="w-48 mx-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* <MediaTimeline
                selectedContent={selectedContent}
                selectedObject={selectedContent} // Pass currently selected object
              /> */}

              {/* Bottom Panel */}
              <div className="bg-white border-t">
                <div className="max-w-6xl mx-auto p-6">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="variations">
                        Variations ({selectedContent.variations})
                      </TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="mt-6">
                      <div className="grid grid-cols-3 gap-8">
                        <div className="col-span-2 space-y-6">
                          <div>
                            <h3 className="font-medium text-gray-900 mb-3">
                              Description
                            </h3>
                            <p className="text-gray-600">
                              {selectedContent.description}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 mb-3">
                              Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedContent.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg bg-gray-50 border">
                              <p className="text-sm text-gray-500 mb-1">
                                Duration
                              </p>
                              <p className="text-lg font-medium">
                                {selectedContent.duration}
                              </p>
                            </div>
                            <div className="p-4 rounded-lg bg-gray-50 border">
                              <p className="text-sm text-gray-500 mb-1">
                                Views
                              </p>
                              <p className="text-lg font-medium">
                                {selectedContent.views.toLocaleString()}
                              </p>
                            </div>
                            <div className="p-4 rounded-lg bg-gray-50 border">
                              <p className="text-sm text-gray-500 mb-1">
                                Engagement
                              </p>
                              <p className="text-lg font-medium">
                                {selectedContent.engagement}%
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <Card className="p-4 bg-blue-50/50 border-blue-100">
                            <h3 className="font-medium mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                              >
                                <Box className="h-4 w-4 mr-2" />
                                Create Variation
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                              >
                                <BookMarked className="h-4 w-4 mr-2" />
                                Add to Collection
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-red-600 hover:text-red-700"
                                onClick={() => setIsDeleteDialogOpen(true)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Content
                              </Button>
                            </div>
                          </Card>

                          <Card className="p-4">
                            <h3 className="font-medium mb-4">Collaborators</h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src="/api/placeholder/32/32" />
                                    <AvatarFallback>SC</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">
                                      Sarah Chen
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Owner
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Collaborator
                              </Button>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <Film className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select content to preview
                </h3>
                <p className="text-gray-500">
                  Choose an item from the sidebar to view details
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* {selectedContent && <ContentPreviewSection content={selectedContent} />} */}

      <Dialog
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
      >
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
            <DialogDescription>
              Select a template to get started with your content
            </DialogDescription>
          </DialogHeader>
          <TemplateSelector onSelect={handleTemplateSelect} />
        </DialogContent>
      </Dialog>

      {/* AI Effects Dialog */}
      <Dialog open={showAIEffects} onOpenChange={setShowAIEffects}>
        <DialogContent className="max-w-5xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>AI Effects Studio</DialogTitle>
            <DialogDescription>
              Enhance your content with AI-powered effects
            </DialogDescription>
          </DialogHeader>
          <AIEffectsPanel onApplyEffects={handleApplyEffects} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Content</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this content? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(selectedContent?.id || 0)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed bottom-4 right-4 z-50">
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              Content has been deleted successfully.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
});

export default ContentStudioView;
