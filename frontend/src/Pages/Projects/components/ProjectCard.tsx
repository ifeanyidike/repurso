import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Image as ImageIcon, Users, Calendar, ChevronDown } from "lucide-react";

import { Folder, CheckCircle } from "react-feather";
import { motion } from "framer-motion";
import { BarChart2 } from "react-feather";
import { Link } from "react-router-dom";

//   const ProjectCard = ({ project }) => (
//     <div className="group font-outfit relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
//       <div className="relative h-64">
//         <img
//           src={project.thumbnail}
//           alt={project.title}
//           className="w-full h-full object-cover"
//           referrerPolicy="no-referrer"
//         />

//         <div className="absolute top-3 right-3 z-10">
//           <Badge
//             variant={project.status === "active" ? "success" : "warning"}
//             className="capitalize"
//           >
//             {project.status}
//           </Badge>
//         </div>

//         {/* Hover Overlay */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//           <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
//             <div className="flex gap-2">
//               <Button size="sm" variant="secondary" className="h-8">
//                 <Share2 className="h-4 w-4 mr-1" />
//                 Share
//               </Button>
//               <Button size="sm" variant="secondary" className="h-8">
//                 <Download className="h-4 w-4 mr-1" />
//                 Export
//               </Button>
//             </div>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button size="sm" variant="secondary" className="h-8">
//                   <MoreHorizontal className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent>
//                 <DropdownMenuItem>Edit Project</DropdownMenuItem>
//                 <DropdownMenuItem>Duplicate</DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem className="text-red-600">
//                   Delete
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>
//       </div>

//       <div className="p-5">
//         <div className="flex items-center justify-between mb-3">
//           <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
//             {project.title}
//           </h3>
//         </div>
//         <p className="text-sm text-gray-600 mb-4 line-clamp-2">
//           {project.description}
//         </p>

//         <div className="space-y-4">
//           <div className="flex justify-between items-center text-sm">
//             <span className="text-gray-600">Progress</span>
//             <span className="font-medium">{project.progress}%</span>
//           </div>
//           <Progress value={project.progress} className="h-2" />

//           <div className="flex items-center justify-between pt-2">
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <ImageIcon className="h-4 w-4" />
//               <span>{project.videoCount} videos</span>
//             </div>
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <Users className="h-4 w-4" />
//               <span>{project.collaborators}</span>
//             </div>
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <Calendar className="h-4 w-4" />
//               <span>{new Date(project.dueDate).toLocaleDateString()}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

const ProjectCard = ({ project }: any) => {
  const statusColors: Record<"active" | "warning" | "completed", string> = {
    active: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <Link to={`/videos/${project.id}`} onClick={() => console.log("Hello")}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className="group font-outfit cursor-pointer relative bg-gradient-to-br from-indigo-50 via-blue-100 to-purple-50 text-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        {/* Header Section */}
        <div className="p-5 relative">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Folder className="h-6 w-6 text-blue-500" />
              <h3 className="text-lg font-bold">{project.title}</h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                statusColors[
                  project.status as "active" | "warning" | "completed"
                ]
              }`}
            >
              {project.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">{project.description}</p>
        </div>

        {/* Progress Section */}
        <div className="px-5 pt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <div className="w-full h-2 mt-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Metadata Section */}
        <div className="p-5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>{project.collaborators} Collaborators</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>{new Date(project.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Hover Actions */}
        <motion.div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center items-center">
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition">
              Share
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition">
              Export
            </button>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
};

export default ProjectCard;
