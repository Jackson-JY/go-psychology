import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, ImageIcon, ArrowLeft, Loader2 } from "lucide-react";
import Seal from "@/components/Seal";
import { useGameStore } from "@/store";
import { analyzeSgf, analyzeImage } from "@/lib/api";

type FileType = "sgf" | "image" | null;

function resizeImageToBase64(file: File, maxSize = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height / width) * maxSize);
          width = maxSize;
        } else {
          width = Math.round((width / height) * maxSize);
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 初始化失败"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = URL.createObjectURL(file);
  });
}

export default function SgfUploadStage() {
  const restart = useGameStore((s) => s.restart);
  const setSgfResult = useGameStore((s) => s.setSgfResult);
  const setError = useGameStore((s) => s.setError);

  const [sgfContent, setSgfContent] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<FileType>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [parseInfo, setParseInfo] = useState<{
    boardSize: number;
    moveCount: number;
    playerBlack?: string;
    playerWhite?: string;
  } | null>(null);

  const parsePreview = useCallback((content: string) => {
    const szMatch = content.match(/SZ\[(\d+)\]/);
    const boardSize = szMatch ? parseInt(szMatch[1], 10) : 19;
    const pbMatch = content.match(/PB\[([^\]]+)\]/);
    const pwMatch = content.match(/PW\[([^\]]+)\]/);
    const moveRegex = /;[BW]\[[a-z]{2}\]/gi;
    const moves = content.match(moveRegex) || [];
    setParseInfo({
      boardSize,
      moveCount: moves.length,
      playerBlack: pbMatch?.[1],
      playerWhite: pwMatch?.[1],
    });
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      const isSgf = file.name.endsWith(".sgf");
      const isImage = /\.(png|jpe?g|webp)$/i.test(file.name);

      if (!isSgf && !isImage) {
        alert("请上传 .sgf 棋谱文件或图片（.png/.jpg/.jpeg/.webp）");
        return;
      }

      setFileName(file.name);
      setFileType(isSgf ? "sgf" : "image");
      setSgfContent("");
      setImageBase64("");
      setParseInfo(null);

      if (isSgf) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setSgfContent(content);
          parsePreview(content);
        };
        reader.readAsText(file);
      } else {
        try {
          const base64 = await resizeImageToBase64(file, 1024);
          setImageBase64(base64);
          // 对图片只做基础信息展示
          setParseInfo({ boardSize: 19, moveCount: 0 });
        } catch {
          setError("图片处理失败，请尝试其他图片");
        }
      }
    },
    [parsePreview, setError],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleAnalyze = async () => {
    if (fileType === "sgf" && sgfContent) {
      setAnalyzing(true);
      try {
        const result = await analyzeSgf(sgfContent, "B");
        setSgfResult({ ...result, source: "sgf" });
      } catch (err) {
        setError((err as Error).message || "棋谱分析失败");
      } finally {
        setAnalyzing(false);
      }
    } else if (fileType === "image" && imageBase64) {
      setAnalyzing(true);
      try {
        const result = await analyzeImage(imageBase64, "B");
        setSgfResult(result);
      } catch (err) {
        setError((err as Error).message || "图片分析失败");
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const hasFile = fileType !== null;
  const isImage = fileType === "image";

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-paper-100 px-5 py-6">
      {/* 顶部导航 */}
      <header className="flex items-center justify-between">
        <button
          onClick={restart}
          className="flex items-center gap-1.5 font-mono text-[11px] tracking-widest text-ink-900/50 transition-colors hover:text-ink-900"
        >
          <ArrowLeft size={14} />
          返回首页
        </button>
        <div className="flex items-center gap-2">
          <Seal char="谱" size={28} />
          <span className="font-mono text-[10px] tracking-[0.3em] text-ink-900/60">
            SGF 深度分析
          </span>
        </div>
      </header>

      {/* 标题区 */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 text-center"
      >
        <h1 className="font-serif text-2xl font-semibold text-ink-900">
          上传棋谱 · 深度心理分析
        </h1>
        <p className="mx-auto mt-2 max-w-[20em] font-kai text-sm leading-relaxed text-ink-900/60">
          上传完整棋谱（SGF）或棋盘截图，AI 将从你的行棋风格中提取深层心理画像
        </p>
      </motion.section>

      {/* 上传区 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-8 flex flex-1 flex-col items-center"
      >
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative flex w-full max-w-[320px] flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
            dragOver
              ? "border-cinnabar bg-cinnabar/5"
              : hasFile
                ? "border-ink-900/30 bg-ink-900/5"
                : "border-ink-900/20 bg-paper-100"
          }`}
        >
          <input
            type="file"
            accept=".sgf,.png,.jpg,.jpeg,.webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
          />

          {hasFile ? (
            <div className="flex flex-col items-center gap-2">
              {isImage ? (
                <>
                  {imageBase64 && (
                    <img
                      src={imageBase64}
                      alt="预览"
                      className="mb-2 h-auto max-h-[160px] w-auto max-w-[240px] rounded border border-ink-900/10 object-contain"
                    />
                  )}
                  <ImageIcon size={28} className="text-cinnabar" />
                </>
              ) : (
                <FileText size={32} className="text-cinnabar" />
              )}
              <span className="font-mono text-xs text-ink-900">{fileName}</span>
              {parseInfo && !isImage && (
                <div className="mt-1 flex flex-col items-center gap-0.5 font-mono text-[10px] text-ink-900/50">
                  <span>
                    {parseInfo.boardSize}×{parseInfo.boardSize} · {parseInfo.moveCount} 手
                  </span>
                  {(parseInfo.playerBlack || parseInfo.playerWhite) && (
                    <span>
                      {parseInfo.playerBlack || "黑方"} vs{" "}
                      {parseInfo.playerWhite || "白方"}
                    </span>
                  )}
                </div>
              )}
              {isImage && (
                <span className="mt-1 font-mono text-[10px] text-ink-900/50">
                  图片模式 · AI 将自动识别棋盘落子
                </span>
              )}
              <span className="mt-1 text-[10px] text-ink-900/40">
                点击或拖拽替换文件
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload
                size={32}
                className={`transition-colors ${dragOver ? "text-cinnabar" : "text-ink-900/30"}`}
              />
              <span className="font-kai text-sm text-ink-900/70">
                拖拽文件到此处
              </span>
              <span className="font-mono text-[10px] text-ink-900/40">
                支持 SGF 或棋盘图片
              </span>
            </div>
          )}
        </div>

        {/* 分析按钮 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleAnalyze}
          disabled={!hasFile || analyzing}
          className={`btn-ink mt-6 flex items-center gap-2 !px-8 !py-3 text-sm ${
            !hasFile || analyzing ? "opacity-40" : ""
          }`}
        >
          {analyzing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {isImage ? "图像识别中..." : "分析中..."}
            </>
          ) : (
            <>开始深度分析 →</>
          )}
        </motion.button>

        {/* 说明 */}
        <div className="mt-6 flex flex-col items-center gap-1.5 font-mono text-[9px] tracking-wider text-ink-900/30">
          <span>支持 .sgf / .png / .jpg / .webp · 最大 5MB</span>
          <span>建议上传清晰、完整的棋盘截图以提升识别准确度</span>
        </div>
      </motion.div>

      <footer className="mt-auto text-center font-mono text-[9px] tracking-widest text-ink-900/30">
        从棋谱中提取五维心理画像 · 不依赖 AI 引擎
      </footer>
    </div>
  );
}
