import React from "react";
import {
  Grid,
  List,
  Clock,
  TrendingUp,
  Filter,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
const FiltersAndControls = ({
  viewMode,
  setViewMode,
  selectedCategory,
  setSelectedCategory,
  categories,
  setCategories,
  sortBy,
  setSortBy,
}: any) => {
  return (
    <div className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* View Mode Buttons */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                <Grid className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                <List className="h-5 w-5" />
              </Button>
            </div>

            <div className="h-8 w-px bg-gray-200" />

            {/* Categories */}
            <div className="flex gap-4">
              {categories.map((category: any) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Filters and Sort By */}
          <div className="flex items-center gap-6">
            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-2 border-gray-300 rounded-lg py-2 px-3 text-gray-600 hover:bg-gray-50 transition-all duration-200"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Active Projects</DropdownMenuItem>
                <DropdownMenuItem>Pending Projects</DropdownMenuItem>
                <DropdownMenuItem>Completed Projects</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort By Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-2 border-gray-300 rounded-lg py-2 px-3 text-gray-600 hover:bg-gray-50 transition-all duration-200"
                >
                  {sortBy === "recent" ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  Sort by
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("recent")}>
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("progress")}>
                  Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("deadline")}>
                  Deadline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersAndControls;
