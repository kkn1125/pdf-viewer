import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import * as pdfjs from "pdfjs-dist";
import { RenderParameters } from "pdfjs-dist/types/src/display/api";
import { useCallback, useEffect, useRef, useState } from "react";

let resolver: (done: boolean) => void;

const PDF_JS_VERSION = pdfjs.version || "4.4.168";
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.mjs`;
const outputScale = window.devicePixelRatio || 1;

function PDFViewer({
  filename,
  handleClose,
}: {
  filename: string;
  handleClose: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [document, setDocument] = useState<pdfjs.PDFDocumentLoadingTask | null>(
    null
  );
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement>(
    window.document.createElement("canvas")
  );
  const [pdf, setPdf] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      setCanvas(canvas);
      setCtx(canvas.getContext("2d") as CanvasRenderingContext2D);
      const document = pdfjs.getDocument(filename);
      setDocument(document);
      document.promise
        .then(function (pdf) {
          setTotalPage(pdf.numPages);
          setPdf(pdf);
        })
        .then(async () => {
          setLoaded(true);
        });
    }
  }, [filename]);

  useEffect(() => {
    if (loaded) update(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  async function update(pageNumber: number) {
    if (!pdf) return;
    // you can now use *pdf* here
    const page = await pdf.getPage(pageNumber);

    // you can now use *page* here
    const viewport = page.getViewport({ scale: scale });
    // Support HiDPI-screens.

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";

    const transform =
      outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

    const renderContext = {
      canvasContext: ctx,
      transform: transform,
      viewport: viewport,
    };

    page.render(renderContext as RenderParameters);
  }

  async function handlePrev() {
    const prev = currentPage - 1;
    if (prev > 0) {
      setCurrentPage(prev);
      // await update(prev);
    }
  }
  async function handleNext() {
    const next = currentPage + 1;
    if (next <= totalPage) {
      setCurrentPage(next);
      // await update(next);
    }
  }

  const renderPdf = useCallback(() => {
    return (
      <Box
        key={`${filename}-${currentPage}`} // key 속성 추가
        component='object'
        data={
          filename +
          `#page=${currentPage}&zoom=100&view=FitH&toolbar=0&sidebar=0&navpanes=0&scrollbar=0`
        }
        // 스크롤 보이려면 여기 수정
        width={617}
        height='inherit'
        type='application/pdf'
        sx={{
          ["*::-webkit-scrollbar"]: {
            display: "none",
          },
          pointerEvents: "none",
        }}
      />
    );
  }, [currentPage, filename]);

  return (
    <Paper
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        overflow: "hidden",
        width: 600,
        height: (600 * 303) / 210,
        background: "#525659",
      }}>
      <Box
        component='canvas'
        ref={canvasRef}
        width='inherit'
        height='inherit'
        hidden
        m='auto'
      />
      <Stack height='inherit'>
        <Stack direction='row' justifyContent='flex-end' p={1}>
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
        <Stack position='relative' height='100%'>
          {renderPdf()}
        </Stack>
        <Stack
          direction='row'
          gap={1}
          justifyContent='center'
          alignItems='center'
          p={2}>
          <Button variant='contained' onClick={handlePrev}>
            prev
          </Button>
          <Typography>
            {currentPage}/{totalPage}
          </Typography>
          <Button variant='contained' onClick={handleNext}>
            next
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default PDFViewer;
