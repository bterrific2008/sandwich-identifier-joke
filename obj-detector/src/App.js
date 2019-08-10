import React, { useState, useRef, useEffect } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import breadLocation from "./sandwich-bread.gif";

function App(props) {
  //const modelPromise = cocoSsd.load();

  const [file, setFile] = useState(0);
  const [imgClass, setImgClass] = useState("hidden");
  const [canvasClass, setCanvasClass] = useState("hidden");
  const [isLoading, setIsLoading] = useState(false);

  var canvasRef = useRef(null);

  useEffect(() => {
    const loadImage = file => {
      var img = new Image();
      img.onload = function() { console.log("Image loaded.");}
      img.src = file;
      return img;
    };

    async function applyBox() {
      setIsLoading(true);

      const img = await loadImage(file);
      const bread = await loadImage(breadLocation);

      if (file !== 0) {
        const model = await cocoSsd.load();

        const predictions = await model.detect(img);

        const ctx = canvasRef.current.getContext("2d");
        ctx.save();
        console.log("Predictions: ", predictions);

        predictions.forEach(prediction => {
          const breadHeight = (bread.height * prediction.bbox[3]) / bread.width;

          const topBread = [
            prediction.bbox[0],
            prediction.bbox[1] - breadHeight / 2,
            prediction.bbox[2],
            breadHeight
          ];

          const bottomBread = [
            prediction.bbox[0],
            prediction.bbox[1] - breadHeight / 2 + prediction.bbox[3],
            prediction.bbox[2],
            breadHeight
          ];

          ctx.drawImage(
            bread,
            topBread[0],
            topBread[1],
            topBread[2],
            topBread[3]
          );

          ctx.drawImage(
            bread,
            bottomBread[0],
            bottomBread[1],
            bottomBread[2],
            bottomBread[3]
          );
        });

      }

      setIsLoading(false);
    }

    applyBox();
  }, [file]);

  const imageUpdate = event => {
    setFile(URL.createObjectURL(event.target.files[0]));
    setImgClass("coverImage app-position");
    setCanvasClass("coverCanvas app-position");
  };

  return (
    <div>
      <input type="file" disabled={isLoading} onChange={imageUpdate} />
      {isLoading && <div>Loading...</div>}

      <img src={file} className={imgClass} />
      <canvas ref={canvasRef} className={canvasClass} />
    </div>
  );
}

export default App;
