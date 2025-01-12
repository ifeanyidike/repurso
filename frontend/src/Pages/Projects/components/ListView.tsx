import React, { useState, useEffect } from "react";
import {
  Download,
  Share2,
  MoreHorizontal,
  Image as ImageIcon,
  Users,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { BarChart2 } from "react-feather";
//   const ListView = ({ project }) => (
//     <div className="group bg-white rounded-lg p-4 hover:shadow-md transition-all duration-300 border border-gray-100">
//       <div className="flex items-center gap-4">
//         <img
//           src={project.thumbnail}
//           alt={project.title}
//           className="w-24 h-24 rounded-lg object-cover"
//         />
//         <div className="flex-1">
//           <div className="flex items-center justify-between mb-2">
//             <h3 className="font-semibold text-gray-900">{project.title}</h3>
//             <Badge
//               variant={project.status === "active" ? "success" : "warning"}
//               className="capitalize"
//             >
//               {project.status}
//             </Badge>
//           </div>
//           <p className="text-sm text-gray-600 mb-3 line-clamp-2">
//             {project.description}
//           </p>
//           <div className="flex items-center gap-6">
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <ImageIcon className="h-4 w-4" />
//               <span>{project.videoCount} videos</span>
//             </div>
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <Users className="h-4 w-4" />
//               <span>{project.collaborators} members</span>
//             </div>
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <Calendar className="h-4 w-4" />
//               <span>{new Date(project.dueDate).toLocaleDateString()}</span>
//             </div>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button size="sm" variant="ghost">
//             <Share2 className="h-4 w-4" />
//           </Button>
//           <Button size="sm" variant="ghost">
//             <Download className="h-4 w-4" />
//           </Button>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button size="sm" variant="ghost">
//                 <MoreHorizontal className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <DropdownMenuItem>Edit Project</DropdownMenuItem>
//               <DropdownMenuItem>Duplicate</DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem className="text-red-600">
//                 Delete
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>
//     </div>
//   );

//   const ListView = ({ project }) => (
//     <motion.div
//       whileHover={{ scale: 1.02 }}
//       className="group bg-white rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200"
//     >
//       <div className="flex items-start gap-4">
//         {/* Thumbnail */}
//         <motion.img
//           whileHover={{ scale: 1.05 }}
//           src={project.thumbnail}
//           alt={project.title}
//           className="w-28 h-28 rounded-lg object-cover shadow-md"
//         />

//         {/* Content */}
//         <div className="flex-1">
//           {/* Header */}
//           <div className="flex items-center justify-between">
//             <h3 className="font-semibold text-gray-900 text-lg">
//               {project.title}
//             </h3>
//             <span
//               className={`px-3 py-1 rounded-full text-sm font-medium ${
//                 project.status === "active"
//                   ? "bg-green-100 text-green-700"
//                   : "bg-yellow-100 text-yellow-700"
//               }`}
//             >
//               {project.status}
//             </span>
//           </div>

//           {/* Description */}
//           <p className="text-sm text-gray-600 mt-2 mb-4 line-clamp-2">
//             {project.description}
//           </p>

//           {/* Metadata */}
//           <div className="flex items-center gap-6 text-sm text-gray-500">
//             <div className="flex items-center gap-2">
//               <Share2 className="h-4 w-4" />
//               <span>{project.videoCount} videos</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Users className="h-4 w-4" />
//               <span>{project.collaborators} members</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Calendar className="h-4 w-4" />
//               <span>{new Date(project.dueDate).toLocaleDateString()}</span>
//             </div>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex items-center gap-3">
//           <button
//             className="p-2 rounded-md hover:bg-gray-100 transition"
//             title="Share"
//           >
//             <Share2 className="h-5 w-5 text-gray-600" />
//           </button>
//           <button
//             className="p-2 rounded-md hover:bg-gray-100 transition"
//             title="Download"
//           >
//             <Download className="h-5 w-5 text-gray-600" />
//           </button>
//           <button
//             className="p-2 rounded-md hover:bg-gray-100 transition"
//             title="More"
//           >
//             <MoreHorizontal className="h-5 w-5 text-gray-600" />
//           </button>
//         </div>
//       </div>
//     </motion.div>
//   );

//   import React from "react";
//   import { Share2, Download, Calendar, Users } from "react-feather";
//   import { motion } from "framer-motion";

//   const ListView = ({ project }) => {
//     return (
//       <motion.div
//         whileHover={{ scale: 1.03 }}
//         className="group relative bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300"
//       >
//         {/* Content */}
//         <div className="flex flex-col gap-4">
//           {/* Header */}
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold">{project.title}</h3>
//             <span
//               className={`px-3 py-1 rounded-full text-sm font-medium ${
//                 project.status === "active"
//                   ? "bg-green-600/90"
//                   : "bg-yellow-500/90"
//               }`}
//             >
//               {project.status}
//             </span>
//           </div>

//           {/* Details */}
//           <div className="grid grid-cols-3 gap-4 text-sm">
//             <div className="flex items-center gap-2">
//               <Users className="h-5 w-5 text-white/90" />
//               <span>{project.collaborators} members</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Calendar className="h-5 w-5 text-white/90" />
//               <span>{new Date(project.dueDate).toLocaleDateString()}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="h-5 w-5 rounded-full bg-green-400" />{" "}
//               {/* Icon */}
//               <span>{project.progress}% completed</span>
//             </div>
//           </div>

//           {/* Progress Bar */}
//           <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-2">
//             <div
//               className="bg-green-400 h-full transition-all duration-300"
//               style={{ width: `${project.progress}%` }}
//             />
//           </div>

//           {/* Description */}
//           <p className="text-sm mt-3 line-clamp-2">{project.description}</p>

//           {/* Hover Actions */}
//           <div className="absolute top-4 right-4 hidden group-hover:flex gap-3">
//             <button
//               className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
//               title="Share"
//             >
//               <Share2 className="h-5 w-5 text-white" />
//             </button>
//             <button
//               className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
//               title="Download"
//             >
//               <Download className="h-5 w-5 text-white" />
//             </button>
//           </div>
//         </div>
//       </motion.div>
//     );
//   };

const ListView = ({ project }: any) => (
  <motion.div
    whileHover={{
      scale: 1.02,
      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
    }}
    className="group p-6 rounded-lg transition-all duration-300 bg-gradient-to-r from-indigo-50 via-blue-100 to-purple-50 text-gray-800 shadow-md"
  >
    {/* Project Title and Status */}
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-lg">{project.title}</h3>
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          project.status === "active"
            ? "bg-green-200 text-green-800"
            : "bg-yellow-200 text-yellow-800"
        }`}
      >
        {project.status}
      </span>
    </div>

    {/* Project Details */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="flex items-center gap-3">
        <BarChart2 className="w-5 h-5" />
        <span className="text-sm font-medium">
          Progress: <span className="font-semibold">{project.progress}%</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Users className="w-5 h-5" />
        <span className="text-sm font-medium">
          Members:{" "}
          <span className="font-semibold">{project.collaborators}</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5" />
        <span className="text-sm font-medium">
          Due:{" "}
          <span className="font-semibold">
            {new Date(project.dueDate).toLocaleDateString()}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">
          Videos: <span className="font-semibold">{project.videoCount}</span>
        </span>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex items-center gap-3">
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-white bg-opacity-20 hover:bg-opacity-40 transition"
        title="Share"
      >
        <Share2 className="h-5 w-5" />
        <span className="text-sm font-medium">Share</span>
      </button>
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-white bg-opacity-20 hover:bg-opacity-40 transition"
        title="Download"
      >
        <Download className="h-5 w-5" />
        <span className="text-sm font-medium">Export</span>
      </button>
      <button
        className="ml-auto flex items-center gap-2 px-4 py-2 rounded-md bg-white bg-opacity-20 hover:bg-opacity-40 transition"
        title="More"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
    </div>
  </motion.div>
);

export default ListView;
