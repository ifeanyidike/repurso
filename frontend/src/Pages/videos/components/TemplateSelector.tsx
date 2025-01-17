import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Wand2, Layout, Copy, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const templates = [
  {
    id: 1,
    name: "Product Showcase",
    description: "Highlight key features with dynamic transitions and overlays",
    category: "Marketing",
    duration: "60s",
    platforms: ["YouTube", "Instagram", "TikTok"],
    thumbnail: "/api/placeholder/320/180",
    popularFor: ["SaaS", "E-commerce"],
    aiFeatures: ["Auto B-Roll", "Smart Cuts", "Voice Enhancement"],
  },
  {
    id: 2,
    name: "Tutorial Builder",
    description: "Step-by-step guide with auto-chapters and highlights",
    category: "Education",
    duration: "5-10min",
    platforms: ["YouTube", "Udemy"],
    thumbnail: "/api/placeholder/320/180",
    popularFor: ["Course Creators", "Technical Tutorials"],
    aiFeatures: ["Auto Chapters", "Key Moment Detection"],
  },
  // More templates would go here...
];

const TemplateSelector = ({ onSelect }: any) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-4">Content Templates</h2>
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search templates..." className="pl-9" />
          </div>
          <Button variant="outline">
            <Layout className="h-4 w-4 mr-2" />
            Categories
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Badge variant="secondary">All</Badge>
          <Badge variant="outline">Marketing</Badge>
          <Badge variant="outline">Education</Badge>
          <Badge variant="outline">Social Media</Badge>
          <Badge variant="outline">Entertainment</Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full aspect-video object-cover"
              />
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{template.name}</h3>
                  <Badge variant="secondary">{template.duration}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {template.platforms.map((platform) => (
                    <Badge key={platform} variant="outline" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button className="flex-1" onClick={() => onSelect(template)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TemplateSelector;
