import React, { useState, useRef, useEffect } from 'react';
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import breadLocation from './sandwich-bread.gif';

function App(props) {

  const modelPromise = cocoSsd.load();

  const [file, setFile] = useState(0);
  const [image, setImage] = useState(null);
  const [imgClass, setImgClass] = useState("hidden");
  const [canvasClass, setCanvasClass] = useState("hidden");

  const canvasRef = useRef(null);

  const detection = (image, model) => {
    const predictions = model.detect(image);
    drawBBox(predictions);
  };

  const drawBBox = predictions => {
    const ctx = canvasRef.current.getContext('2d');
    
    predictions.forEach(prediction => {
      const bread = new Image();
      bread.src = breadLocation;

      const breadHeight = (bread.height*prediction.bbox[3])/bread.width;

      const topBread = [
        prediction.bbox[0],
        prediction.bbox[1]-breadHeight/2,
        prediction.bbox[2],
        breadHeight        
      ];

      const bottomBread = [
        prediction.bbox[0],
        prediction.bbox[1]-breadHeight/2+prediction.bbox[3],
        prediction.bbox[2],
        breadHeight        
      ];

      ctx.drawImage(bread, topBread[0], topBread[1], topBread[2], topBread[3]);

      ctx.drawImage(bread, bottomBread[0], bottomBread[1], bottomBread[2], bottomBread[3]);

    })
  };

  const loadImage= (file) => {
    return new Promise(resolve => {
      const img = new Image();
      img.addEventListener('load', () => {
        resolve(img);
      });
      img.src = file;
    })
  }

  const imageUpdate = (event) => {
    setFile(URL.createObjectURL(event.target.files[0])); 
    setImgClass("coverImage app-position");
    setCanvasClass("coverCanvas app-position");
    const imagePromise = loadImage(file)
      .then(img => {
        setImage(img);
      });
    Promise.all([modelPromise, imagePromise])
    .then(values => detection(image, values[0]))
    .catch(error => console.error(error))
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(event) => imageUpdate(event)}
      />
      <img 
        src={file} 
        className={imgClass}
      />
      <canvas
        ref = {canvasRef}
        className = {canvasClass}
      />
    </div>
  );
}


export default App;