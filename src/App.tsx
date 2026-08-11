import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import IntroStage from "@/stages/IntroStage";
import TutorialStage from "@/stages/TutorialStage";
import PlayStage from "@/stages/PlayStage";
import LoadingStage from "@/stages/LoadingStage";
import ResultStage from "@/stages/ResultStage";
import SgfUploadStage from "@/stages/SgfUploadStage";
import SgfResultStage from "@/stages/SgfResultStage";
import EditorLoginStage from "@/stages/EditorLoginStage";
import EditorStage from "@/stages/EditorStage";
import StatsStage from "@/stages/StatsStage";
import AdminStage from "@/stages/AdminStage";
import { useGameStore } from "@/store";

export default function App() {
  const stage = useGameStore((s) => s.stage);
  const goAdmin = useGameStore((s) => s.goAdmin);

  // 监听哈希路由：#admin 进入后台
  useEffect(() => {
    const check = () => {
      if (window.location.hash === "#admin") {
        goAdmin();
      }
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [goAdmin]);

  // 进入 loading 时自动滚动到顶
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stage]);

  return (
    <div className="relative min-h-[100dvh] w-full bg-paper-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {stage === "intro" && <IntroStage />}
          {stage === "tutorial" && <TutorialStage />}
          {stage === "play" && <PlayStage />}
          {stage === "loading" && <LoadingStage />}
          {stage === "result" && <ResultStage />}
          {stage === "sgf-upload" && <SgfUploadStage />}
          {stage === "sgf-result" && <SgfResultStage />}
          {stage === "editor-login" && <EditorLoginStage />}
          {stage === "editor" && <EditorStage />}
          {stage === "stats" && <StatsStage />}
          {stage === "admin" && <AdminStage />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
