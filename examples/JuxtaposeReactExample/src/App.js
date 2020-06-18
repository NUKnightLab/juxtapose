import React, { Component } from "react";
import "./styles.css";

class App extends Component {
  componentDidMount() {
    const slider = new juxtapose.JXSlider(
      "#juxtapose",
      [
        {
          src:
            "https://juxtapose.knightlab.com/static/img/Sochi_11April2005.jpg",
          label: "Apr. 2005",
          credit: "Google Earth"
        },
        {
          src: "https://juxtapose.knightlab.com/static/img/Sochi_22Nov2013.jpg",
          label: "Nov. 2013",
          credit: "Google Earth"
        }
      ],
      {
        animate: true,
        showLabels: true,
        showCredits: true,
        startingPosition: "50%",
        makeResponsive: true
      }
    );
  }
  render() {
    return (
      <div className="App">
        <h1>KnightLab JuxtaposeJS</h1>
        <div id="juxtapose" />
      </div>
    );
  }
}

export default App;
