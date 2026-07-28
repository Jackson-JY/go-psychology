import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import IntroStage from "@/stages/IntroStage";
import TutorialStage from "@/stages/TutorialStage";
import PlayStage from "@/stages/PlayStage";
import LoadingStage from "@/stages/LoadingStage";
import ResultStage from "@/stages/ResultStage";
import PosterStage from "@/stages/PosterStage";
import SgfUploadStage from "@/stages/SgfUploadStage";
import SgfResultStage from "@/stages/SgfResultStage";
import EditorLoginStage from "@/stages/EditorLoginStage";
import EditorStage from "@/stages/EditorStage";
import { useGameStore } from "@/store";

export default function App() {
  const stage = useGameStore((s) => s.stage);

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
          {stage === "poster" && <PosterStage />}
          {stage === "sgf-upload" && <SgfUploadStage />}
          {stage === "sgf-result" && <SgfResultStage />}
          {stage === "editor-login" && <EditorLoginStage />}
          {stage === "editor" && <EditorStage />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
