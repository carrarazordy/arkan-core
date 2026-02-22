"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Square,
  LayoutGrid,
  Activity,
  Cpu,
  Signal,
  Database,
  Search,
  Plus,
  ArrowLeft,
  Zap,
  Clock,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardEngine } from "@/hooks/useDashboardEngine";
import { ProjectDrillDown } from "@/components/dashboard/ProjectDrillDown";
import { GlobalInbox } from "@/components/layout/GlobalInbox";
import { cn } from "@/lib/utils";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";
import { useProjectStore } from "@/store/useProjectStore";
import { useDialogStore } from "@/store/useDialogStore";
import { useOperationsStore } from "@/store/useOperationsStore";
import { OperationsModals } from "@/components/dashboard/OperationsModals";
import { Project } from "@/lib/types";

export default function DashboardPage() {
  const { state, metrics, initialize, expandProject, returnToGrid } = useDashboardEngine();
  const { projects, systemStatus, activeView, selectedProjectId, isLoading } = state;
  const [searchQuery, setSearchQuery] = useState("");
  const [quickNote, setQuickNote] = useState("");

  useEffect(() => {
    initialize();
    const savedNote = localStorage.getItem('arkan_quick_note');
    if (savedNote) setQuickNote(savedNote);
  }, [initialize]);

  const handleQuickNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuickNote(e.target.value);
    localStorage.setItem('arkan_quick_note', e.target.value);
  };

  const handleInitProject = () => {
    ArkanAudio.playFast('system_engage');
    useOperationsStore.getState().openOperations();
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    ArkanAudio.playFast('system_engage');
    useDialogStore.getState().openDialog({
      title: "DE_MANIFEST_PROTOCOL // CONFIRM",
      placeholder: `TYPE "${name}" TO CONFIRM...`,
      confirmLabel: "PURGE_DATA",
      onConfirm: async (val) => {
        if (val === name) {
          await useProjectStore.getState().deleteProject(id);
          ArkanAudio.playFast('system_purge');
        } else {
          useDialogStore.getState().closeDialog();
          ArkanAudio.playFast('error');
        }
      }
    });
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    return projects.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technicalId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-black text-primary font-mono" >
      {/* Background Grid */}
      < div className="absolute inset-0 pointer-events-none z-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(249, 249, 6, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(249, 249, 6, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div >

      {/* HEADER / STATUS BAR */}
      < header className="h-12 border-b border-primary/20 bg-[#0a0a05]/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0" >
        <div className="flex items-center gap-6 text-[10px] tracking-widest uppercase">
          <div className="flex items-center gap-2 text-primary/60">
            <Database className="h-3 w-3" />
            <span>ARK_CORE_DB: <span className={cn("text-primary", systemStatus === 'OPTIMAL' ? "animate-pulse" : "text-red-500")}>{systemStatus}</span></span>
          </div>
          <div className="w-px h-4 bg-primary/20"></div>
          <div className="flex items-center gap-2 text-primary/60">
            <Signal className="h-3 w-3" />
            <span>LATENCY: {Math.round(metrics.heartbeatMs)}ms</span>
          </div>
        </div>

        {/* SEARCH BAR (Only visible in GRID view) */}
        {
          activeView === 'GRID' && (
            <div className="flex-1 max-w-md mx-6 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-primary/40 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH_ACTIVE_OPERATIONS..."
                className="w-full bg-black/40 border border-primary/10 rounded-sm py-1.5 pl-8 pr-4 text-[10px] text-primary placeholder:text-primary/20 focus:border-primary/50 focus:bg-primary/5 transition-all outline-none uppercase tracking-wider"
              />
            </div>
          )
        }

        <div className="flex items-center gap-4">
          {activeView === 'PROJECT_EXPANDED' && (
            <button
              onClick={returnToGrid}
              className="flex items-center gap-2 text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-sm border border-primary/20 transition-all active:scale-95"
            >
              <ArrowLeft className="h-3 w-3" />
              RETURN_TO_GRID
            </button>
          )}
          <button
            onClick={handleInitProject}
            className="bg-primary hover:bg-white hover:text-black text-black px-4 py-1.5 rounded-sm font-bold text-[10px] tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(249,249,6,0.3)] flex items-center gap-2"
          >
            <Plus className="h-3 w-3" />
            INIT_PROJECT
          </button>
        </div>
      </header >

      {/* MAIN CONTENT AREA */}
      < div className="flex-1 flex overflow-hidden z-10" >

        {/* LEFT: GLOBAL INBOX */}
        < aside className="w-80 border-r border-primary/10 bg-[#0a0a05]/60 backdrop-blur-sm flex flex-col shrink-0" >
          <GlobalInbox />
        </aside >

        {/* CENTER: DYNAMIC VIEWPORT */}
        < main className="flex-1 relative overflow-y-auto custom-scrollbar p-8 bg-black/40" >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full gap-4 opacity-50"
              >
                <Cpu className="h-12 w-12 animate-spin text-primary" />
                <span className="text-xs tracking-[0.3em] animate-pulse">ESTABLISHING_UPLINK...</span>
              </motion.div>
            ) : activeView === 'GRID' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <header className="flex items-end justify-between border-b border-primary/20 pb-4">
                  <div>
                    <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                      <LayoutGrid className="h-6 w-6 text-primary" />
                      Active_Operations
                    </h1>
                    <p className="text-[10px] text-primary/60 mt-1 tracking-widest">
                      COMMAND_CENTER // VIEWING {filteredProjects.length} ACTIVE MODULES
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-primary/40">
                    <Square className="h-3 w-3 fill-primary" />
                    <span>GRID_LAYOUT_ACTIVE</span>
                  </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProjects.map(project => (
                    <div
                      key={project.id}
                      onClick={() => expandProject(project.id)}
                      className="cursor-pointer group"
                      data-context-target={project.id}
                      data-context-type="PROJECT"
                      data-context-name={project.name}
                    >
                      <div className="bg-[#11110b] border border-primary/20 p-6 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group-hover:shadow-[0_0_20px_rgba(249,249,6,0.1)] relative overflow-hidden h-48 flex flex-col justify-between">
                        <div className="absolute top-0 right-0 p-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <button
                            onClick={(e) => handleDeleteProject(e, project.id, project.name)}
                            className="p-1 hover:bg-red-500/20 text-red-500/40 hover:text-red-500 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <div className="p-1 text-primary/80">
                            <Zap className="h-4 w-4" />
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-primary/50 mb-1">{project.technicalId}</div>
                          <h3 className="text-lg font-bold text-white tracking-wide uppercase group-hover:text-primary transition-colors">{project.name}</h3>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] uppercase text-primary/40">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add New Placeholder */}
                  <button
                    onClick={handleInitProject}
                    className="border-2 border-dashed border-primary/20 rounded-lg h-48 flex flex-col items-center justify-center gap-4 text-primary/40 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="h-6 w-6" />
                    </div>
                    <span className="text-xs tracking-widest font-bold uppercase">Initialize_New_Module</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {selectedProject ? (
                  <ProjectDrillDown
                    project={selectedProject}
                  />
                ) : (
                  <div className="text-center text-red-500">MODULE_LOAD_ERROR</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main >

        {/* RIGHT: METRICS & QUICK NOTES */}
        < aside className="w-72 border-l border-primary/10 bg-[#0a0a05]/80 backdrop-blur-sm p-4 flex flex-col gap-4 shrink-0 pointer-events-auto" >
          <div className="p-4 border border-primary/20 rounded bg-black/40">
            <h3 className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity className="h-3 w-3" />
              System_Uptime
            </h3>
            <div className="text-2xl font-mono text-primary tabular-nums">
              {new Date(metrics.uptime).toISOString().substr(11, 8)}
            </div>
          </div>

          <div className="flex-1 flex flex-col border border-primary/20 rounded bg-black/40 overflow-hidden">
            <div className="p-3 border-b border-primary/10 bg-primary/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Quick_Buffer</span>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            </div>
            <textarea
              className="flex-1 bg-transparent p-3 text-[10px] font-mono text-primary/80 resize-none outline-none placeholder:text-primary/20 leading-relaxed"
              placeholder="> ENTER_TEMPORAL_DATA..."
              value={quickNote}
              onChange={handleQuickNoteChange}
              spellCheck={false}
            />
          </div>

          <div className="p-4 border border-primary/20 rounded bg-black/40 flex flex-col gap-2">
            <h3 className="text-[10px] font-bold text-primary/60 uppercase tracking-widest flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Session_ID
            </h3>
            <div className="text-[9px] font-mono text-primary/40 break-all leading-tight">
              {metrics.sessionStartTime}-{Math.floor(Math.random() * 9999)}
            </div>
          </div>
        </aside >
      </div >
      <OperationsModals />
    </div >
  );
}
