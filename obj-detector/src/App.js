import React, { useState, useRef, useEffect, useCallback } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

function App(props) {
  //const modelPromise = cocoSsd.load();

  const [file, setFile] = useState(null);
  const [imgClass, setImgClass] = useState("hidden");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState(null);
  const [detected, setDetect] = useState("");

  useEffect(() => {
    async function loadModel() {
      setIsLoading(true);
      setModel(await cocoSsd.load("mobilenet_v2"));
      setIsLoading(false);
    }

    loadModel();
  }, []);

  useEffect(() => {
    async function detect() {
      if (file) {
        setIsLoading(true);

        const image = new Image();
        image.src = file;

        image.onload = await async function() {
          let detectText = "";

          let predictions = await model.detect(image);
          predictions.forEach(prediction => {
            detectText = detectText.concat(
              prediction.class + " " + (prediction.score * 100).toFixed(2) + " "
            );
          });

          setDetect(detectText);

          setIsLoading(false);
        };
      }
    }

    detect();
  }, [file]);

  const imageUpdate = event => {
    setFile(URL.createObjectURL(event.target.files[0]));
    setImgClass("center-fit");
  };

  return (
    <>
      <input
        type="file"
        name="pic"
        accept="image/*"
        disabled={isLoading}
        onChange={imageUpdate}
        className="selection"
      />

      <div className="imgBox">
        {!file ? "No image" : <img src={file} className={imgClass} />}
      </div>
      <div>{isLoading ? "Loading..." : detected}</div>
    </>
  );
}

export default App;
