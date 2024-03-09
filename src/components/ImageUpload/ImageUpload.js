// ImageUpload.js
import { createClient } from "pexels";
import { v1 as uuidv1 } from "uuid";
import React from "react";
import axios from "axios";
import { Audio } from "react-loader-spinner";
import "./imageupload.css";

class ImageUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      photos: [],
      labels: [],
      isFetched: false,
      isLoading: false,
      errMsg: "",
    };
    this.onImageChange = this.onImageChange.bind(this);
    this.analyzeImage = this.analyzeImage.bind(this);
  }

  analyzeImage() {
    if (this.state.file !== null) this.callAnalyzeImage();
    else alert("Please enter the image");
  }

  async callAnalyzeImage() {
    this.setState({
      photos: [],
      labels: [],
      isLoading: true,
      isFetched: false,
    });
    const API_KEY = "AIzaSyB4bDg0E3X9hQ_BxRv6Qc1wJMeXNHmqyiA";
    const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

    const client = createClient(
      "jQBQSGlNdNoKmNOgWrNM1l7pdljRDDsStJCbfsFZmm8DbN3eOIWLhCwe"
    );

    const { file } = this.state;
    console.log(file);
    try {
      const base64Image = await this.getBase64(file);

      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [{ type: "LABEL_DETECTION", maxResults: 6 }],
          },
        ],
      };

      const response = await axios.post(API_URL, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = response.data["responses"][0]["labelAnnotations"];
      const labels = data.map((item) => item.description);
      this.setState({ labels });

      const searchPromises = labels.map((label) => {
        return client.photos.search({ query: label, per_page: 1 });
      });
      const result = await Promise.all(searchPromises);
      const photos = result.map((res) => {
        const photo = res["photos"][0];
        return {
          src: photo["src"]["medium"],
          alt: photo["alt"],
        };
      });

      this.setState({ photos, isFetched: true, isLoading: false });
      console.log(photos);
    } catch (error) {
      this.setState({
        isFetched: false,
        isLoading: false,
        errMsg: error.message,
      });
    }
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  }

  onImageChange(event) {
    if (event.target.files && event.target.files[0]) {
      if (
        event.target.files[0].type === "image/jpeg" ||
        event.target.files[0].type === "image/png" ||
        event.target.files[0].type === "image/jpg"
      ) {
        let img = event.target.files[0];
        this.setState({
          file: img,
        });
      } else {
        alert("Enter valid image, Enter only jpg or jpeg or png files");
        this.setState({
          file: null,
          photos: [],
          labels: [],
          isFetched: false,
        });
      }
    }
  }

  handleRetryBtn = () => {
    this.setState({
      photos: [],
      labels: [],
      isLoading: false,
      isFetched: false,
      file: null,
      errMsg: "",
    });
  };

  render() {
    const { photos, labels, isFetched, isLoading, errMsg } = this.state;
    console.log(typeof errMsg);
    return (
      <div className="main-container">
        <div className="sub-container">
          <div>
            <p className="welcome-note">
              Welcome!
              <br /> This is a website used to analyse the given image and give
              the similar products based on the image as result.
              <br />
              Select one image file and click the analyse image button to get
              the result.
            </p>
          </div>
          <h2>Upload your image</h2>
          <div className="input-container">
            <input
              type="file"
              className="file-input"
              accept=".jpg,.png,.jpeg"
              onChange={this.onImageChange}
            />
            <div>
              {this.state.file && (
                <img
                  src={URL.createObjectURL(this.state.file)}
                  alt="Uploaded"
                  className="uploaded-image"
                />
              )}
            </div>
          </div>

          <div className="result-container">
            <button className="analyse-btn" onClick={this.analyzeImage}>
              Analyse the image
            </button>
            {isLoading && (
              <Audio
                height="80"
                width="80"
                radius="9"
                color="green"
                ariaLabel="loading"
                wrapperStyle
                wrapperClass
              />
            )}
            {isFetched && (
              <div className="results">
                <p className="result-top-line">
                  Here is the analysis of the given image...Here is what we
                  found in the image
                </p>
                <ul className="res-labels-container">
                  {labels.map((label) => (
                    <li key={uuidv1()} className="res-label">
                      {label}
                    </li>
                  ))}
                </ul>
                <p className="result-top-line">
                  Here are the similar images...
                </p>
                <ul className="res-images-container">
                  {photos.map((image) => (
                    <li key={uuidv1()} className="image-container">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="res-image"
                      />
                      <p className="image-alt">{image.alt}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {errMsg && (
              <>
                <p className="err-msg">{errMsg}!!</p>
                <button onClick={this.handleRetryBtn} className="retry-btn">
                  Retry
                </button>
              </>
            )}
          </div>
          <p>
            We have integrated google cloud vision API for the image analysation
            and used external APIs to fetch the similar products for the data
            recieved from the analysis.
            <br />
            The Google Cloud Vision API allows developers to integrate vision
            detection features into their applications. It provides capabilities
            such as image labeling, face and landmark detection, optical
            character recognition (OCR), and detection of explicit content.
            <br />
            The image you upload will be sent to the google cloud for the
            analysis.
          </p>
        </div>
      </div>
    );
  }
}

export default ImageUpload;
