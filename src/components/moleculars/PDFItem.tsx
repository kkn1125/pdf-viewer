import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import PDFViewer from "./PDFViewer";

interface PDFItemProps {
  name: string;
  img: string;
  filename: string;
}

const PDFItem: React.FC<PDFItemProps> = ({ name, img, filename }) => {
  const [visible, setVisible] = useState(false);

  const screenCover = (
    <Box
      sx={{
        ["&::before"]: {
          content: '""',
          position: "fixed",

          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: "#56565656",
        },
      }}
    />
  );

  const handleToggle = () => {
    setVisible((prev) => !prev);
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <Paper component={Stack} p={2} gap={2}>
      <Typography
        fontSize={18}
        fontWeight={700}
        align='center'
        sx={{ textTransform: "uppercase" }}>
        {name}
      </Typography>
      <Box
        component='img'
        src={img}
        alt={name}
        width={200}
        sx={{
          border: "1px solid #56565626",
          borderRadius: 1,
          boxSizing: "border-box",
        }}
      />
      <Button
        variant='contained'
        color='warning'
        onClick={handleToggle}
        sx={{ fontSize: 16 }}>
        상세보기
      </Button>
      {visible && (
        <Box position='fixed' zIndex={999}>
          {screenCover}
          <PDFViewer
            name={name}
            img={img}
            filename={filename}
            handleClose={handleClose}
          />
        </Box>
      )}
    </Paper>
  );
};

export default PDFItem;
