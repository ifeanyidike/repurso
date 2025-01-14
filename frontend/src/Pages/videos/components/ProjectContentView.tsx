import React, { useState } from "react";
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
} from "lucide-react";
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
import { ProjectType } from "@/types/project";

type Props = {
  project: ProjectType;
};

const content = [
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
  },
];
type Content = typeof content;
const ContentStudioView = ({ project }: Props) => {
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedTab, setSelectedTab] = useState("all");

  // Enhanced sample data

  const Studio = () => (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Enhanced Left Sidebar */}
      <div className="w-80 bg-gray-50/50 border-r flex flex-col">
        <div className="p-4 border-b bg-white sticky top-0 z-10 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search content..."
              className="pl-9 bg-gray-50/80"
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
        </div>

        <Tabs defaultValue="all" className="flex-1 flex flex-col">
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
            {content.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedContent(item)}
                className={`mb-3 rounded-xl cursor-pointer transition-all overflow-hidden border ${
                  selectedContent?.id === item.id
                    ? "ring-2 ring-blue-500 border-transparent"
                    : "hover:bg-gray-100/80 border-gray-100"
                }`}
              >
                <div className="relative">
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                    {item.duration}
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.platform}
                    </Badge>
                    <Badge
                      variant={
                        item.status === "ready" ? "success" : "secondary"
                      }
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </Tabs>
      </div>

      {/* Enhanced Main Content Area */}
      {selectedContent ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/30">
          {/* Top Bar */}
          <div className="bg-white border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">{selectedContent.title}</h2>
              <Badge variant="secondary">{selectedContent.platform}</Badge>
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
              <Button size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          {/* Content Preview */}
          <div className="flex-1 p-8 flex justify-center items-center bg-gray-900/95">
            <div className="relative max-w-4xl w-full aspect-video">
              <img
                src={selectedContent.thumbnail}
                alt={selectedContent.title}
                className="w-full h-full object-cover rounded-lg shadow-2xl"
              />
              <Button
                size="lg"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <Play className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Bottom Panel */}
          <div className="bg-white border-t">
            <div className="max-w-6xl mx-auto p-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="variations">Variations</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-4">
                      <div className="flex gap-2">
                        {selectedContent.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-gray-50 border">
                          <p className="text-sm text-gray-500 mb-1">Duration</p>
                          <p className="text-lg font-medium">
                            {selectedContent.duration}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 border">
                          <p className="text-sm text-gray-500 mb-1">Views</p>
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

                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border bg-blue-50/50 border-blue-100">
                        <h3 className="font-medium mb-2">Quick Actions</h3>
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
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );

  const EmptyState = () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full" />
          <div className="relative bg-white p-8 rounded-2xl shadow-lg border">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Film className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">
              Welcome to Your Studio
            </h2>
            <p className="text-gray-600 mb-6">
              Start by adding your first piece of content and transform it into
              multiple formats for different platforms.
            </p>
            <Button size="lg" className="w-full">
              <Plus className="h-5 w-5 mr-2" />
              Add First Content
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-white">
      {/* Enhanced Header */}
      <header className="h-16 bg-white border-b flex items-center px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{project?.title}</h1>
          <Badge variant="secondary" className="text-sm">
            {content.length} items
          </Badge>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Content
          </Button>
        </div>
      </header>

      {/* Main Content */}
      {content.length === 0 ? <EmptyState /> : <Studio />}
    </div>
  );
};

export default ContentStudioView;
