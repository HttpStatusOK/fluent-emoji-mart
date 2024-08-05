import './App.css';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import GitHubIcon from '@mui/icons-material/GitHub';
import React, {useEffect, useState} from "react";
import {
  Button,
  createTheme,
  CssBaseline,
  FormControlLabel,
  ImageListItem,
  Radio,
  RadioGroup,
  ThemeProvider
} from "@mui/material";
import ClipboardJS from "clipboard";
import {SnackbarProvider, useSnackbar} from "notistack";

const getRandomBackgroundColor = () => {
  const partyColors = [
    "#FF6B6B",
    "#FF6BB5",
    "#FF81FF",
    "#D081FF",
    "#81ACFF",
    "#81FFFF",
    "#81FF81",
    "#FFD081",
    "#FF8181",
  ];
  return partyColors[Math.floor(Math.random() * partyColors.length)];
}

const Header = () => {
  return (
    <header>
      <img
        style={{marginTop: 20}}
        src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Convenience store/3D/convenience_store_3d.png"
        alt="Alien" width="50" height="50"/>
      <h1 style={{marginTop: 0}}>
        Fluent Emoji Mart
      </h1>
    </header>
  )
}

const FluentEmojiPicker = () => {
  const [metaData, setMetaData] = useState([]);
  const [emojiURLs, setEmojiURLs] = useState([]);

  const [copyMode, setCopyMode] = useState("Markdown");
  const {enqueueSnackbar} = useSnackbar();

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/xsalazar/fluent-emoji/main/src/Components/metadata.json")
      .then(res => res.json())
      .then(data => setMetaData(data));
  }, []);

  useEffect(() => {
    const clipboard = new ClipboardJS(".emoji-item");
    clipboard.on('success', (e) => {
      enqueueSnackbar('Copied', { variant: "success", autoHideDuration: 1000 ,anchorOrigin: { vertical : "top", horizontal: "center" } });
      e.clearSelection();
    });

    clipboard.on('error', (e) => {
      console.error('Action:', e.action);
      console.error('Trigger:', e.trigger);
      enqueueSnackbar('Fail', { variant: "error", anchorOrigin: { vertical : "top", horizontal: "center" } });
    });

    return () => {
      clipboard.destroy();
    };
  }, [enqueueSnackbar]);

  const findEmoji = (pickerSelected) => {
    /**
     * 1 Default
     * 2 Light
     * 3 MediumLight
     * 4 Medium
     * 5 MediumDark
     * 6 Dark
     */
    let hasSkin = pickerSelected.skin;

    let mode;
    if (hasSkin) {
      switch (pickerSelected.skin) {
        case 1: mode = "Default"; break;
        case 2: mode = "Light"; break;
        case 3: mode = "MediumLight"; break;
        case 4: mode = "Medium"; break;
        case 5: mode = "MediumDark"; break;
        case 6: mode = "Dark"; break;
        default: {}
      }
    }

    const URLs = [];
    for (const key in metaData) {
      if (metaData[key].cldr === pickerSelected.name.toLowerCase()) {
        let imagesObj = hasSkin && metaData[key]["skintones"] ? metaData[key]["skintones"][mode] : metaData[key]["styles"];
        for (let k in imagesObj) {
          URLs.push(
            imagesObj[k]
          );
        }
      }
    }
    setEmojiURLs(URLs)
  }

  const handleCopyURL = (url) => {
    if (copyMode === "Markdown") {
      return `<img src="${url}" alt="Alien" width="25" height="25" />`
    }
    return url;
  }

  return (
    <div className="flex flex-center" style={{
      justifyContent: "center",
      display: "flex"
    }}>
      <div>
        <Header/>
        <Picker
          data={data}
          onEmojiSelect={i => {
            setEmojiURLs(pre => []);
            findEmoji(i);
          }}/>
        <footer>
          <h1>
            <RadioGroup
              row
              value={copyMode}
              onChange={event => setCopyMode(event.target.value)}
              style={{padding: "0 12px"}}
            >
              <FormControlLabel value="Markdown" control={<Radio/>} label="Markdown"/>
              <FormControlLabel value="Raw" control={<Radio/>} label="Raw"/>
            </RadioGroup>
          </h1>
          <div
            className="container"
            style={{
              display: "grid",
              placeItems: "center",
              gridAutoFlow: "column",
              backgroundColor: "#151618",
              padding: 10,
              borderRadius: 10,
              minHeight: 100,
          }}>
            {emojiURLs.map((url) => (
              <ImageListItem
                className={"emoji-item"}
                data-clipboard-text={handleCopyURL(url)}
                sx={{
                  width: 80,
                  borderRadius: 2,
                  padding: 0.25,
                  "&:hover": {
                    backgroundColor: () => getRandomBackgroundColor(),
                  },
                }}
              >
                <img
                  loading="lazy"
                  width="32px"
                  height="32px"
                  src={url}
                  alt={url}
                />
              </ImageListItem>
            ))}
          </div>
          <div style={{ textAlign: "center", margin: 20 }}>
            <Button
              href="https://github.com/HttpStatusOK/fluent-emoji-mart"
              startIcon={<GitHubIcon />}
              style={{
                textTransform: "none",
                fontSize: 16,
                color: "white"
              }}
            >
              Github
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const App = () => {

  return (
    <div className="App">
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={1}>
          <FluentEmojiPicker />
        </SnackbarProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
