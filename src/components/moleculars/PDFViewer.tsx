import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import useKeydownControlPdf from "@src/hooks/useKeydownControlPdf";
import * as pdfjs from "pdfjs-dist";
import { RenderParameters } from "pdfjs-dist/types/src/display/api";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import CachedIcon from "@mui/icons-material/Cached";
import useScrollControlPdf from "@src/hooks/useScrollControlPdf";

const PDF_JS_VERSION = pdfjs.version || "4.4.168";
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.mjs`;

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.5;
const ZOOM_UNIT = 0.1;

interface PDFViewerProps {
  name: string;
  img: string;
  filename: string;
  handleClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  name,
  img,
  filename,
  handleClose,
}) => {
  // useScrollControlPdf({
  //   up: handleZoomIn,
  //   down: handleZoomOut,
  // });
  useKeydownControlPdf({
    ArrowLeft: handlePrev,
    ArrowRight: handleNext,
    Escape: handleClose,
    "+": handleZoomIn,
    "-": handleZoomOut,
  });
  // useEscape(handleClose);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<pdfjs.RenderTask | null>(null); // 렌더링 작업을 저장할 ref
  const [pdf, setPdf] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [scale, setScale] = useState(1);
  const outputScale = window.devicePixelRatio || 1;

  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true);
      const loadingTask = pdfjs.getDocument(filename);
      try {
        const loadedPdf = await loadingTask.promise;
        setPdf(loadedPdf);
        setTotalPage(loadedPdf.numPages);
      } catch (error) {
        console.error("Failed to load PDF:", error);
      }
      setLoading(false);
    };

    loadPdf();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [filename]);

  useEffect(() => {
    const renderPage = async (pageNum: number) => {
      if (!pdf || !canvasRef.current) return;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      try {
        const page: pdfjs.PDFPageProxy = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";

        const transform =
          outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : undefined;

        const renderContext: RenderParameters = {
          canvasContext: context!,
          transform: transform,
          viewport: viewport,
        };

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (error: any) {
        if (error.name === "RenderingCancelledException") {
          console.log("Rendering cancelled:", error.message);
        } else {
          console.error("Failed to render page:", error);
        }
      }
    };
    renderPage(currentPage);
  }, [currentPage, outputScale, pdf, scale]);

  async function handleFirst() {
    handleZoomReset();
    setCurrentPage(1);
  }

  async function handleLast() {
    handleZoomReset();
    setCurrentPage(totalPage);
  }

  async function handlePrev() {
    handleZoomReset();
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }

  async function handleNext() {
    handleZoomReset();
    setCurrentPage((prev) => Math.min(prev + 1, totalPage));
  }

  function handleZoomOut() {
    setScale((scale) => Math.max(+(scale - ZOOM_UNIT).toFixed(2), ZOOM_MIN));
  }

  function handleZoomIn() {
    setScale((scale) => Math.min(+(scale + ZOOM_UNIT).toFixed(2), ZOOM_MAX));
  }

  function handleZoomReset() {
    setScale(1);
  }

  function handleChangeCurrentPage(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setCurrentPage(+value || 1);
  }

  return (
    <Paper
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        background: "#525659",
      }}>
      <Stack
        position='absolute'
        left='calc(100% + 5px)'
        overflow='hidden'
        borderRadius={1}
        boxShadow='5px 5px 15px 0 #565656'>
        <Typography
          fontSize={16}
          fontWeight={700}
          align='center'
          py={0.5}
          sx={{
            color: "#fff",
            backgroundColor: "#565656",
            textTransform: "uppercase",
          }}>
          {name}
        </Typography>
        <Box
          component='img'
          src={img}
          width={150}
          sx={{ backgroundColor: "#ffffff" }}
        />
      </Stack>
      <Stack position='relative' spacing={2} height='100%'>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          px={2}
          pt={2}>
          <Typography fontWeight={700} fontSize={18} sx={{ color: "#fff" }}>
            {name}
          </Typography>
          <IconButton
            color='error'
            size='small'
            onClick={handleClose}
            sx={{
              color: "transparent",
              textShadow: "0 0 0 white",
              background: (theme) => theme.palette.error.light,
              fontSize: 14,
            }}>
            ❌
          </IconButton>
        </Stack>
        <Stack
          // maxWidth='80vw'
          width={612}
          height={792}
          overflow={"auto"}>
          {!loading && <Box component='canvas' ref={canvasRef} m='auto' />}
        </Stack>
        {scale !== 1 && (
          <IconButton
            size='small'
            color='default'
            onClick={handleZoomReset}
            sx={{
              position: "absolute",
              bottom: 120,
              right: 160,
              color: "white",
              background: (theme) => theme.palette.info.main,
            }}>
            <CachedIcon />
          </IconButton>
        )}
        <Stack
          position='absolute'
          direction='row'
          alignItems='center'
          gap={1}
          bottom={120}
          right={50}
          sx={{
            background: "#121212b6",
            borderRadius: "1rem",
          }}>
          <IconButton
            size='small'
            color='inherit'
            onClick={handleZoomOut}
            sx={{ color: "white", background: "#12121256" }}>
            <RemoveIcon />
          </IconButton>
          <Typography fontWeight={700} sx={{ color: "#ffffff" }}>
            {scale.toFixed(1)}
          </Typography>
          <IconButton
            size='small'
            color='inherit'
            onClick={handleZoomIn}
            sx={{ color: "white", background: "#12121256" }}>
            <AddIcon />
          </IconButton>
        </Stack>
        <Stack
          direction='row'
          gap={1}
          justifyContent='center'
          alignItems='center'
          p={2}>
          <IconButton
            size='small'
            color='default'
            onClick={handleFirst}
            sx={{ backgroundColor: "#ffffff" }}>
            <FirstPageIcon />
          </IconButton>
          <IconButton
            size='small'
            color='default'
            onClick={handlePrev}
            sx={{ backgroundColor: "#ffffff" }}>
            <KeyboardArrowLeftIcon />
          </IconButton>
          <Stack direction='row' gap={2} alignItems='center'>
            <TextField
              size='small'
              type='number'
              value={currentPage}
              onKeyDown={(e) => e.stopPropagation()}
              onChange={handleChangeCurrentPage}
              sx={{
                width: 70,
                textAlignLast: "center",
                [".MuiInputBase-root"]: { background: "#ffffff" },
                ["& input::-webkit-inner-spin-button"]: {
                  display: "none",
                },
              }}
            />
            /
            <Typography width='50%' align='center'>
              {totalPage}
            </Typography>
          </Stack>
          <IconButton
            size='small'
            color='default'
            onClick={handleNext}
            sx={{ backgroundColor: "#ffffff" }}>
            <KeyboardArrowRightIcon />
          </IconButton>
          <IconButton
            size='small'
            color='default'
            onClick={handleLast}
            sx={{ backgroundColor: "#ffffff" }}>
            <LastPageIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default PDFViewer;
